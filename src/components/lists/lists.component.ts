import { ChangeDetectionStrategy, Component, computed, inject, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { InfluencerService } from '../../services/influencer.service';
import { Campaign, CampaignInfluencerDetails } from '../../models/campaign.model';
// FIX: Import Budget directly from influencer.model.ts
import { Influencer, ProgressStatus, Budget } from '../../models/influencer.model';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PLATFORM_LOGOS } from '../../constants';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { IconComponent } from '../shared/icon/icon.component';
import { Conversation, ConversationService } from '../../services/conversation.service';

type InfluencerWithCampaign = Influencer & { campaignId: string; campaignName: string };

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, SafeHtmlPipe, IconComponent],
})
export class ListsComponent {
  private influencerService = inject(InfluencerService);
  private conversationService = inject(ConversationService);
  private route = inject(ActivatedRoute);
  
  campaigns = toSignal(this.influencerService.getCampaigns(), { initialValue: [] });
  private queryParams = toSignal(this.route.queryParams);
  private allInfluencers = this.influencerService.getAllInfluencers();
  private allConversations = toSignal(this.conversationService.getConversations(), { initialValue: [] });

  viewMode = signal<'manage' | 'kanban'>('kanban');
  selectedCampaignId = signal<string | null>(null);
  
  campaignInfluencers = signal<Influencer[]>([]);
  manageViewInfluencers = signal<InfluencerWithCampaign[]>([]);
  status = signal<'idle'|'loading'>('idle');

  // Drag & Drop for Campaigns
  draggedCampaignIndex = signal<number | null>(null);

  // Drag & Drop for Columns
  draggedColumnIndex = signal<number | null>(null);

  // Drag & Drop for Influencer Cards
  draggedInfluencer = signal<Influencer | null>(null);
  dragOverColumn = signal<ProgressStatus | null>(null);

  // Modals and editing state
  showDeleteModal = signal<Campaign | null>(null);
  showDeleteColumnModal = signal<string | null>(null);
  showAddInfluencerModal = signal<string | null>(null);
  showRemoveInfluencerModal = signal<Influencer | null>(null);
  showRemoveInfluencerFromManageModal = signal<InfluencerWithCampaign | null>(null);
  editingColumn = signal<{ originalName: string; newName: string } | null>(null);
  expandedCardId = signal<string | null>(null);
  showBudgetModal = signal<InfluencerWithCampaign | null>(null);
  editingBudget = signal<{ value: number | null, currency: string }>({ value: null, currency: 'VND' });
  showDeliverablesModal = signal<InfluencerWithCampaign | null>(null);
  editingDeliverables = signal<string[]>([]);
  newDeliverableUrl = signal('');

  // Agreement upload state
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  uploadingForInfluencer = signal<InfluencerWithCampaign | null>(null);
  
  // Add influencer modal state
  addInfluencerSearchTerm = signal('');
  suggestedInfluencers = signal<Influencer[]>([]);
  addedInfluencerIdsInModal = signal(new Set<string>());
  addInfluencerResults = computed(() => {
    const term = this.addInfluencerSearchTerm().toLowerCase();
    if (!term) return [];
    const campaignId = this.selectedCampaignId();
    if (!campaignId) return [];

    const influencersInCampaign = new Set(this.campaignInfluencers().map(i => i.id));
    
    return this.allInfluencers()
        .filter(inf => !influencersInCampaign.has(inf.id)) // Exclude already added
        .filter(inf => inf.name.toLowerCase().includes(term) || inf.handle.toLowerCase().includes(term));
  });

  readonly platformLogos = PLATFORM_LOGOS;

  kanbanColumns = computed(() => this.selectedCampaign()?.kanbanColumns ?? []);

  influencersByStatus = computed(() => {
    const influencers = this.campaignInfluencers();
    const grouped = new Map<ProgressStatus, Influencer[]>();
    this.kanbanColumns().forEach(status => grouped.set(status, []));
    influencers.forEach(influencer => {
      const status = influencer.progressStatus || this.kanbanColumns()[0]; // Default to first column if no status
      if (grouped.has(status)) {
        grouped.get(status)!.push(influencer);
      }
    });
    return grouped;
  });

  selectedCampaign = computed(() => {
    const id = this.selectedCampaignId();
    if (!id) return null;
    return this.campaigns().find(c => c.id === id) ?? null;
  });

  constructor() {
    effect(() => {
        const currentCampaigns = this.campaigns();
        const queryParams = this.queryParams();
        
        if (queryParams['select_campaign']) {
          this.selectCampaign(queryParams['select_campaign']);
        } else if(this.viewMode() === 'kanban' && !this.selectedCampaignId() && currentCampaigns.length > 0) {
            this.selectCampaign(currentCampaigns[0].id);
        }

        if(this.selectedCampaignId() && !currentCampaigns.find(c => c.id === this.selectedCampaignId())) {
          this.selectCampaign(currentCampaigns.length > 0 ? currentCampaigns[0].id : null);
        }
    }, { allowSignalWrites: true });
  }
  
  selectView(mode: 'manage' | 'kanban', campaignId: string | null = null) {
      this.viewMode.set(mode);
      if(mode === 'manage') {
        this.selectedCampaignId.set(null);
        this.manageViewInfluencers.set(this.influencerService.getAllInfluencersWithCampaignDetails() as InfluencerWithCampaign[]);
      } else {
        this.selectCampaign(campaignId);
      }
  }

  selectCampaign(campaignId: string | null) {
    if (this.selectedCampaignId() === campaignId && this.status() === 'idle') return;
    if (!campaignId) {
        this.selectedCampaignId.set(null);
        this.campaignInfluencers.set([]);
        return;
    }
    
    this.viewMode.set('kanban');
    this.selectedCampaignId.set(campaignId);
    this.status.set('loading');
    this.influencerService.getInfluencersForCampaign(campaignId).subscribe(influencers => {
      this.campaignInfluencers.set(influencers);
      this.status.set('idle');
    });
  }

  createNewCampaign() {
    const newCampaign = this.influencerService.createBlankCampaign();
    this.selectCampaign(newCampaign.id);
  }
  
  confirmDeleteCampaign() {
    const campaign = this.showDeleteModal();
    if (campaign) {
        this.influencerService.deleteCampaign(campaign.id);
        this.showDeleteModal.set(null);
    }
  }

  onCampaignDragStart(index: number) { this.draggedCampaignIndex.set(index); }
  onCampaignDrop(dropIndex: number) {
    const startIndex = this.draggedCampaignIndex();
    if (startIndex !== null && startIndex !== dropIndex) {
      this.influencerService.reorderCampaigns(startIndex, dropIndex);
    }
    this.draggedCampaignIndex.set(null);
  }

  // Column Management
  onColumnDragStart(index: number) { this.draggedColumnIndex.set(index); }
  onColumnDrop(dropIndex: number) {
    const startIndex = this.draggedColumnIndex();
    const campaignId = this.selectedCampaignId();
    if (startIndex !== null && startIndex !== dropIndex && campaignId) {
      const columns = [...this.kanbanColumns()];
      const [removed] = columns.splice(startIndex, 1);
      columns.splice(dropIndex, 0, removed);
      this.influencerService.updateCampaignColumns(campaignId, columns);
    }
    this.draggedColumnIndex.set(null);
  }

  startEditingColumn(name: string) { this.editingColumn.set({ originalName: name, newName: name }); }
  cancelEditingColumn() { this.editingColumn.set(null); }
  saveColumnName() {
    const editState = this.editingColumn();
    const campaignId = this.selectedCampaignId();
    if (editState && campaignId && editState.newName.trim() && editState.originalName !== editState.newName) {
        this.influencerService.renameCampaignColumn(campaignId, editState.originalName, editState.newName);
    }
    this.editingColumn.set(null);
  }

  confirmDeleteColumn() {
    const columnName = this.showDeleteColumnModal();
    const campaignId = this.selectedCampaignId();
    if (columnName && campaignId) {
      this.influencerService.removeCampaignColumn(campaignId, columnName);
      this.campaignInfluencers.update(current => 
        current.filter(inf => inf.progressStatus !== columnName)
      );
    }
    this.showDeleteColumnModal.set(null);
  }
  
  // Influencer Card Management
  private saveDetail(influencerId: string, details: Partial<CampaignInfluencerDetails>) {
    const campaignId = this.selectedCampaignId();
    if (!campaignId) return;
    this.influencerService.updateInfluencerDetail(campaignId, influencerId, details);
  }
  onCardDragStart(influencer: Influencer) { this.draggedInfluencer.set(influencer); }
  onCardDropOnColumn(newStatus: ProgressStatus) {
    const influencer = this.draggedInfluencer();
    if (influencer && influencer.progressStatus !== newStatus) {
      this.campaignInfluencers.update(influencers =>
        influencers.map(inf => inf.id === influencer.id ? { ...inf, progressStatus: newStatus } : inf)
      );
      this.saveDetail(influencer.id, { progressStatus: newStatus });
    }
    this.draggedInfluencer.set(null);
    this.dragOverColumn.set(null);
  }
  onCardDragEnd() {
    this.draggedInfluencer.set(null);
    this.dragOverColumn.set(null);
  }

  openAddInfluencerModal(status: string) {
    const campaignId = this.selectedCampaignId();
    if (!campaignId) return;
    this.suggestedInfluencers.set(this.influencerService.getSuggestedInfluencers(campaignId));
    this.addInfluencerSearchTerm.set('');
    this.addedInfluencerIdsInModal.set(new Set());
    this.showAddInfluencerModal.set(status);
  }

  addInfluencerToColumn(influencer: Influencer) {
    const campaignId = this.selectedCampaignId();
    const status = this.showAddInfluencerModal();
    if (campaignId && status) {
        this.influencerService.addInfluencerToCampaign(influencer, campaignId, { progressStatus: status });
        this.addedInfluencerIdsInModal.update(s => s.add(influencer.id));
    }
  }

  confirmRemoveInfluencer() {
    const influencer = this.showRemoveInfluencerModal();
    const campaignId = this.selectedCampaignId();
    if (influencer && campaignId) {
      this.influencerService.removeInfluencersFromCampaign([influencer.id], campaignId);
    }
    this.showRemoveInfluencerModal.set(null);
  }

  confirmRemoveInfluencerFromManage() {
    const influencer = this.showRemoveInfluencerFromManageModal();
    if (influencer) {
        this.influencerService.removeInfluencersFromCampaign([influencer.id], influencer.campaignId);
        this.manageViewInfluencers.set(this.influencerService.getAllInfluencersWithCampaignDetails() as InfluencerWithCampaign[]);
    }
    this.showRemoveInfluencerFromManageModal.set(null);
  }

  toggleCardExpansion(influencerId: string) {
    this.expandedCardId.update(current => current === influencerId ? null : influencerId);
  }
  
  getConversationForInfluencer(influencerId: string): Conversation | undefined {
    return this.allConversations().find(c => c.influencerId === influencerId);
  }

  // Manage View Interactive Components Logic
  openBudgetModal(influencer: InfluencerWithCampaign) {
    this.editingBudget.set({
        value: (influencer as any).budget?.value ?? null,
        currency: (influencer as any).budget?.currency ?? 'VND'
    });
    this.showBudgetModal.set(influencer);
  }

  saveBudget() {
      const influencer = this.showBudgetModal();
      const budget = this.editingBudget();
      if (influencer && budget.value !== null && budget.value > 0) {
          const newBudget: Budget = { value: budget.value, currency: budget.currency };
          this.influencerService.updateInfluencerDetail(influencer.campaignId, influencer.id, { budget: newBudget });
          this.manageViewInfluencers.update(influencers => influencers.map(inf => inf.id === influencer.id && inf.campaignId === influencer.campaignId ? {...inf, budget: newBudget} : inf));
      }
      this.showBudgetModal.set(null);
  }

  openDeliverablesModal(influencer: InfluencerWithCampaign) {
      this.editingDeliverables.set([...(influencer.deliverables || [])]);
      this.newDeliverableUrl.set('');
      this.showDeliverablesModal.set(influencer);
  }

  addDeliverable() {
      const url = this.newDeliverableUrl().trim();
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          this.editingDeliverables.update(urls => [...urls, url]);
          this.newDeliverableUrl.set('');
      } else {
          alert('Please enter a valid URL (starting with http:// or https://)');
      }
  }
  
  removeDeliverable(index: number) {
      this.editingDeliverables.update(urls => urls.filter((_, i) => i !== index));
  }
  
  saveDeliverables() {
      const influencer = this.showDeliverablesModal();
      if (influencer) {
          const newDeliverables = this.editingDeliverables();
          this.influencerService.updateInfluencerDetail(influencer.campaignId, influencer.id, { deliverables: newDeliverables });
          this.manageViewInfluencers.update(influencers => influencers.map(inf => inf.id === influencer.id && inf.campaignId === influencer.campaignId ? {...inf, deliverables: newDeliverables} : inf));
      }
      this.showDeliverablesModal.set(null);
  }

  triggerFileUpload(influencer: InfluencerWithCampaign) {
    this.uploadingForInfluencer.set(influencer);
    this.fileInput.nativeElement.click();
  }
  
  onFileSelected(event: Event) {
      const influencer = this.uploadingForInfluencer();
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0 && influencer) {
          const file = input.files[0];
          const newDocument = { name: file.name, url: '#' }; // Mock URL
          this.influencerService.updateInfluencerDetail(influencer.campaignId, influencer.id, {
              documents: [newDocument]
          });
          this.manageViewInfluencers.update(influencers => influencers.map(inf => inf.id === influencer.id && inf.campaignId === influencer.campaignId ? {...inf, documents: [newDocument]} : inf));
          this.uploadingForInfluencer.set(null);
          input.value = ''; // Reset file input
      }
  }
  
  removeAgreement(influencer: InfluencerWithCampaign) {
    const currentDocs = influencer.documents || [];
    if (currentDocs.length > 0) {
        this.influencerService.updateInfluencerDetail(influencer.campaignId, influencer.id, {
            documents: []
        });
        this.manageViewInfluencers.update(influencers => influencers.map(inf => 
            inf.id === influencer.id && inf.campaignId === influencer.campaignId 
                ? {...inf, documents: []} 
                : inf
        ));
    }
  }
}