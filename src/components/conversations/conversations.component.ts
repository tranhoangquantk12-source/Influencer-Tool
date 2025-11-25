import { ChangeDetectionStrategy, Component, computed, inject, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Conversation, ConversationService, Message } from '../../services/conversation.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ContentDeliveryStatus, PaymentStatus } from '../../models/influencer.model';
import { InfluencerService } from '../../services/influencer.service';
import { PLATFORM_LOGOS } from '../../constants';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { EmailComposerComponent, EmailData } from '../shared/email-composer/email-composer.component';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, DatePipe, SafeHtmlPipe, EmailComposerComponent, IconComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class ConversationsComponent {
  private conversationService = inject(ConversationService);
  private influencerService = inject(InfluencerService);
  // FIX: Explicitly type the injected ActivatedRoute to resolve type inference issues.
  private route: ActivatedRoute = inject(ActivatedRoute);

  private allConversations = toSignal(this.conversationService.getConversations(), { initialValue: [] });
  private allInfluencersSignal = this.influencerService.getAllInfluencers();
  selectedConversationId = signal<string | null>(null);
  
  // Filtering
  conversationSearchTerm = signal('');
  filterByCampaign = signal<string>('');
  filterByContractStatus = signal<string>('');
  filterByContentStatus = signal<string>('');
  filterByPaymentStatus = signal<string>('');
  openFilterDropdown = signal<'campaign' | 'contract' | 'content' | 'payment' | null>(null);

  readonly contractStatuses: string[] = ['Agreement Signed', 'Negotiating'];
  readonly contentStatuses: ContentDeliveryStatus[] = ['Not Live Yet', 'Partially Done', 'Live'];
  readonly paymentStatuses: PaymentStatus[] = ['Awaiting', 'Partially Made', 'Fulfilled'];
  readonly platformLogos = PLATFORM_LOGOS;

  conversations = computed(() => {
    let convos = this.allConversations();
    const searchTerm = this.conversationSearchTerm().toLowerCase();
    const campaignFilter = this.filterByCampaign();
    const contractStatusFilter = this.filterByContractStatus();
    const contentStatusFilter = this.filterByContentStatus();
    const paymentStatusFilter = this.filterByPaymentStatus();

    if (searchTerm) {
        convos = convos.filter(c => c.influencerName.toLowerCase().includes(searchTerm));
    }
    if (campaignFilter) {
      convos = convos.filter(c => c.campaignName === campaignFilter);
    }
    if (contractStatusFilter) {
      convos = convos.filter(c => c.progressStatus === contractStatusFilter);
    }
    if (contentStatusFilter) {
      convos = convos.filter(c => c.contentDeliveryStatus === contentStatusFilter);
    }
    if (paymentStatusFilter) {
      convos = convos.filter(c => c.paymentStatus === paymentStatusFilter);
    }

    return convos;
  });
  
  uniqueCampaignNames = computed(() => {
    const names = this.allConversations().map(c => c.campaignName).filter(Boolean);
    return [...new Set(names)];
  });

  selectedConversation = computed(() => {
    const id = this.selectedConversationId();
    if (!id) return null;
    return this.allConversations().find(c => c.id === id) ?? null;
  });

  selectedInfluencerDetails = computed(() => {
    const conv = this.selectedConversation();
    if (!conv) return null;
    return this.allInfluencersSignal().find(inf => inf.id === conv.influencerId) ?? null;
  });

  newMessage = signal('');
  
  // For pre-filling from query params
  private queryParams = toSignal(this.route.queryParams);
  
  // Drag & Drop
  draggedConversationIndex = signal<number | null>(null);

  // Add to Campaign Modal
  showAddToCampaignModal = signal(false);
  campaigns = toSignal(this.influencerService.getCampaigns(), { initialValue: [] });
  selectedCampaignId = signal<string>('');
  isCampaignModalDropdownOpen = signal(false);
  
  // Email Composer
  isComposerOpen = signal(false);
  composerInitialRecipients = signal<{email: string, name: string}[]>([]);
  composerInitialSubject = signal('');
  
  selectedCampaignName = computed(() => {
    const campaignId = this.selectedCampaignId();
    if (!campaignId) return 'Select a campaign';
    return this.campaigns().find(c => c.id === campaignId)?.name || 'Select a campaign';
  });

  // Auto-scroll
  @ViewChild('messageContainer') private messageContainer!: ElementRef<HTMLDivElement>;

  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Close if the click is outside of a filter button/dropdown
    if (!target.closest('.filter-chip-container')) {
      this.openFilterDropdown.set(null);
    }
     if (!target.closest('.custom-dropdown-container')) {
      this.isCampaignModalDropdownOpen.set(false);
    }
  }

  constructor() {
      effect(() => {
          const params = this.queryParams();
          const convs = this.allConversations();
          if (params && convs.length > 0) {
              if (params['recipientEmail']) {
                  this.composerInitialRecipients.set([{ email: params['recipientEmail'], name: params['recipientName'] || params['recipientEmail'] }]);
                  this.isComposerOpen.set(true);
              } else if (params['select']) {
                  const conversationExists = convs.some(c => c.id === params['select']);
                  if (conversationExists) {
                      this.selectConversation(params['select']);
                  }
              }
          }
      });

      effect(() => {
        // Re-run when the selected conversation's messages change
        this.selectedConversation()?.messages;
        this.scrollToBottom();
      });
  }

  scrollToBottom(): void {
    if (this.messageContainer?.nativeElement) {
      setTimeout(() => {
        const el = this.messageContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }, 0);
    }
  }

  selectConversation(id: string) {
    this.selectedConversationId.set(id);
  }

  sendMessage() {
    const id = this.selectedConversationId();
    const content = this.newMessage().trim();
    if (id && content) {
      this.conversationService.sendMessage(id, content);
      this.newMessage.set('');
    }
  }

  startNewConversation() {
    this.composerInitialRecipients.set([]);
    this.composerInitialSubject.set('');
    this.isComposerOpen.set(true);
  }

  handleSendEmail(emailData: EmailData) {
    console.log("Sending Email:", emailData);
    // In a real app, this would call a service to create a new conversation or send the email.
    this.isComposerOpen.set(false);
  }

  onDragStart(index: number) { this.draggedConversationIndex.set(index); }
  onDrop(dropIndex: number) {
    const startIndex = this.draggedConversationIndex();
    if (startIndex !== null && startIndex !== dropIndex) {
      this.conversationService.reorderConversations(startIndex, dropIndex);
    }
    this.draggedConversationIndex.set(null);
  }

  toggleFilterDropdown(name: 'campaign' | 'contract' | 'content' | 'payment') {
    this.openFilterDropdown.update(current => current === name ? null : name);
  }

  selectFilter(filterName: 'campaign' | 'contract' | 'content' | 'payment', value: string) {
    if (filterName === 'campaign') {
      this.filterByCampaign.set(value);
    } else if (filterName === 'contract') {
      this.filterByContractStatus.set(value);
      if (value) {
        this.filterByContentStatus.set('');
        this.filterByPaymentStatus.set('');
      }
    } else if (filterName === 'content') {
      this.filterByContentStatus.set(value);
      if (value) {
        this.filterByContractStatus.set('');
        this.filterByPaymentStatus.set('');
      }
    } else if (filterName === 'payment') {
      this.filterByPaymentStatus.set(value);
      if (value) {
        this.filterByContractStatus.set('');
        this.filterByContentStatus.set('');
      }
    }
    this.openFilterDropdown.set(null);
  }

  getFilterLabel(filterName: 'campaign' | 'contract' | 'content' | 'payment'): string {
    switch (filterName) {
      case 'campaign':
        return this.filterByCampaign() || 'All Campaigns';
      case 'contract':
        return this.filterByContractStatus() || 'Contract: All';
      case 'content':
        return this.filterByContentStatus() || 'Content: All';
      case 'payment':
        return this.filterByPaymentStatus() || 'Payment: All';
    }
  }

  getStatusColor(status: string | undefined): string {
    switch (status) {
        case 'Agreement Signed':
        case 'Scope Done':
        case 'Live':
        case 'Fulfilled':
            return 'bg-blue-100 text-blue-800';
        case 'Negotiating':
        case 'Preparing Content':
        case 'Awaiting':
            return 'bg-amber-100 text-amber-800';
        case 'Rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-slate-100 text-slate-600';
    }
  }

  formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatFollowers(followers: number): string {
    if (!followers) return '0';
    if (followers >= 1000000) return (followers / 1000000).toFixed(1) + 'M';
    if (followers >= 1000) return (followers / 1000).toFixed(0) + 'K';
    return followers.toString();
  }
  
  openAddToCampaignModal() {
    if (this.campaigns().length > 0 && !this.selectedCampaignId()) {
        this.selectedCampaignId.set(this.campaigns()[0].id);
    }
    this.showAddToCampaignModal.set(true);
  }

  closeModal() {
    this.showAddToCampaignModal.set(false);
    this.isCampaignModalDropdownOpen.set(false);
  }

  addToCampaign() {
    const campaignId = this.selectedCampaignId();
    const influencer = this.selectedInfluencerDetails();
    if (!campaignId || !influencer) {
        this.closeModal();
        return;
    }
    this.influencerService.addInfluencerToCampaign(influencer, campaignId);
    this.closeModal();
  }
  
  toggleCampaignModalDropdown() {
    this.isCampaignModalDropdownOpen.update(v => !v);
  }

  selectCampaignForModal(campaignId: string) {
    this.selectedCampaignId.set(campaignId);
    this.isCampaignModalDropdownOpen.set(false);
  }
}