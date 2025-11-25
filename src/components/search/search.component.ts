import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Influencer, PlatformName } from '../../models/influencer.model';
import { InfluencerService } from '../../services/influencer.service';
import { finalize } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { COUNTRIES } from './countries';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { PLATFORM_LOGOS } from '../../constants';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';
type DropdownType = 'platform' | 'size' | 'views' | 'location' | 'engagement' | null;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SafeHtmlPipe, RouterLink, RouterLinkActive],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class SearchComponent {
  private influencerService = inject(InfluencerService);
  private router = inject(Router);

  // Form signals
  searchTerm = signal('');
  selectedPlatforms = signal(new Set<PlatformName>());
  country = signal('');
  minFollowers = signal<number | null>(null);
  maxFollowers = signal<number | null>(null);
  minViewcount = signal<number | null>(null);
  maxViewcount = signal<number | null>(null);
  minEngagement = signal<number | null>(null);

  // Dropdown state
  openDropdown = signal<DropdownType>(null);
  locationSearchTerm = signal('');

  // State signals
  status = signal<SearchStatus>('idle');
  error = signal<string | null>(null);
  results = signal<Influencer[]>([]);
  
  // Modal and campaign management
  showAddToCampaignModal = signal(false);
  showSuccessModal = signal<{ campaignName: string; campaignId: string } | null>(null);
  isBulkAdd = signal(false);
  influencerForModal = signal<Influencer | null>(null);
  selectedCampaignId = signal<string>('');
  campaigns = toSignal(this.influencerService.getCampaigns(), { initialValue: [] });
  isCampaignModalDropdownOpen = signal(false);

  selectedCampaignName = computed(() => {
    const campaignId = this.selectedCampaignId();
    if (!campaignId) return 'Select a campaign';
    return this.campaigns().find(c => c.id === campaignId)?.name || 'Select a campaign';
  });
  
  // Selection signals
  selectedInfluencerIds = signal(new Set<string>());
  hoveredRowId = signal<string | null>(null);
  areAllSelected = computed(() => {
    const resultsCount = this.results().length;
    return resultsCount > 0 && this.selectedInfluencerIds().size === resultsCount;
  });

  // Filter active states
  isPlatformFilterActive = computed(() => this.selectedPlatforms().size > 0);
  isSizeFilterActive = computed(() => this.minFollowers() !== null || this.maxFollowers() !== null);
  isViewsFilterActive = computed(() => this.minViewcount() !== null || this.maxViewcount() !== null);
  isLocationFilterActive = computed(() => this.country() !== '');
  isEngagementFilterActive = computed(() => this.minEngagement() !== null);

  sizeFilterLabel = computed(() => {
    const min = this.minFollowers();
    const max = this.maxFollowers();
    if (min === null && max === null) return 'Influencer size';
    if (min !== null && max !== null) return `${this.formatFollowers(min)} - ${this.formatFollowers(max)}`;
    if (min !== null) return `> ${this.formatFollowers(min)}`;
    if (max !== null) return `< ${this.formatFollowers(max)}`;
    return 'Influencer size';
  });

  viewsFilterLabel = computed(() => {
    const min = this.minViewcount();
    const max = this.maxViewcount();
    if (min === null && max === null) return 'Average views';
    if (min !== null && max !== null) return `${this.formatFollowers(min)} - ${this.formatFollowers(max)}`;
    if (min !== null) return `> ${this.formatFollowers(min)}`;
    if (max !== null) return `< ${this.formatFollowers(max)}`;
    return 'Average views';
  });

  engagementFilterLabel = computed(() => {
    const min = this.minEngagement();
    if (min === null) return 'Engagement rate';
    return `> ${min}%`;
  });

  readonly countries = COUNTRIES;
  filteredCountries = computed(() => {
    const search = this.locationSearchTerm().toLowerCase();
    if (!search) return this.countries;
    return this.countries.filter(c => c.toLowerCase().includes(search));
  });

  readonly allPlatforms: PlatformName[] = ['Instagram', 'YouTube', 'TikTok', 'X', 'Facebook'];
  readonly platformLogos = PLATFORM_LOGOS;

  readonly followerTiers = [
    { id: 'nano', label: 'Nano (1k-10k)', min: 1000, max: 10000 },
    { id: 'micro', label: 'Micro (10k-100k)', min: 10001, max: 100000 },
    { id: 'mid', label: 'Mid-tier (100k-1M)', min: 100001, max: 1000000 },
    { id: 'macro', label: 'Macro (1M-5M)', min: 1000001, max: 5000000 },
    { id: 'mega', label: 'Mega (5M+)', min: 5000001, max: null }
  ];

  readonly viewcountTiers = [
    { id: '1k', label: '> 1k', min: 1000 },
    { id: '10k', label: '> 10k', min: 10000 },
    { id: '100k', label: '> 100k', min: 100000 }
  ];

  readonly engagementTiers = [
    { id: '1', label: '> 1%', min: 1 },
    { id: '3', label: '> 3%', min: 3 },
    { id: '5', label: '> 5%', min: 5 }
  ];

  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-dropdown-container')) {
      this.openDropdown.set(null);
    }
    if (!target.closest('.custom-dropdown-container')) {
      this.isCampaignModalDropdownOpen.set(false);
    }
  }

  toggleDropdown(type: DropdownType) {
    this.openDropdown.update(current => current === type ? null : type);
  }

  performSearch() {
    this.status.set('loading');
    this.error.set(null);
    this.selectedInfluencerIds.set(new Set());
    
    this.influencerService.search(this.searchTerm(), this.selectedPlatforms(), this.country(), this.minFollowers(), this.maxFollowers(), this.minViewcount(), this.maxViewcount(), this.minEngagement())
      .pipe(finalize(() => this.status.set('success')))
      .subscribe({
        next: (data) => this.results.set(data),
        error: (err) => {
          console.error(err);
          this.error.set('Failed to fetch results.');
          this.status.set('error');
        }
      });
  }

  resetFilters() {
    this.searchTerm.set('');
    this.selectedPlatforms.set(new Set());
    this.country.set('');
    this.minFollowers.set(null);
    this.maxFollowers.set(null);
    this.minViewcount.set(null);
    this.maxViewcount.set(null);
    this.minEngagement.set(null);
    this.openDropdown.set(null);
    // Optionally perform a search with reset filters or clear results
    this.results.set([]);
    this.status.set('idle');
    this.selectedInfluencerIds.set(new Set());
  }

  togglePlatform(platform: PlatformName) {
    this.selectedPlatforms.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(platform)) {
        newSet.delete(platform);
      } else {
        newSet.add(platform);
      }
      return newSet;
    });
  }

  selectSizeTier(tier: { min: number, max: number | null }) {
    this.minFollowers.set(tier.min);
    this.maxFollowers.set(tier.max);
    this.openDropdown.set(null);
  }

  selectViewTier(tier: { min: number }) {
    this.minViewcount.set(tier.min);
    this.maxViewcount.set(null); // Tiers are for minimums
    this.openDropdown.set(null);
  }

  selectEngagementTier(tier: { min: number }) {
    this.minEngagement.set(tier.min);
    this.openDropdown.set(null);
  }

  selectCountry(country: string) {
    this.country.set(country);
    this.openDropdown.set(null);
  }

  formatFollowers(followers: number): string {
    if (followers >= 1000000) return (followers / 1000000).toFixed(1) + 'M';
    if (followers >= 1000) return (followers / 1000).toFixed(0) + 'K';
    return followers.toString();
  }

  openAddToCampaignModal(influencer: Influencer | null, isBulk: boolean) {
    if (this.campaigns().length > 0 && !this.selectedCampaignId()) {
      this.selectedCampaignId.set(this.campaigns()[0].id);
    }
    this.isBulkAdd.set(isBulk);
    this.influencerForModal.set(influencer);
    this.showAddToCampaignModal.set(true);
  }

  closeModal() {
    this.showAddToCampaignModal.set(false);
    this.influencerForModal.set(null);
    this.isCampaignModalDropdownOpen.set(false);
    this.showSuccessModal.set(null);
  }

  addToCampaign() {
    const campaignId = this.selectedCampaignId();
    if (!campaignId) {
      this.closeModal();
      return;
    }

    const campaign = this.campaigns().find(c => c.id === campaignId);
    if (!campaign) {
        this.closeModal();
        return;
    }

    if (this.isBulkAdd()) {
        const selectedInfluencers = this.results().filter(inf => this.selectedInfluencerIds().has(inf.id));
        this.influencerService.addMultipleInfluencersToCampaign(selectedInfluencers, campaignId);
    } else {
        const influencerToAdd = this.influencerForModal();
        if (influencerToAdd) {
          this.influencerService.addInfluencerToCampaign(influencerToAdd, campaignId);
        }
    }
    
    // Close the add modal and show the success modal
    this.showAddToCampaignModal.set(false);
    this.influencerForModal.set(null);
    this.isCampaignModalDropdownOpen.set(false);
    this.showSuccessModal.set({ campaignName: campaign.name, campaignId: campaign.id });

    this.selectedInfluencerIds.set(new Set());
  }

  goToCampaign(campaignId: string) {
    this.closeModal();
    this.router.navigate(['/campaigns'], { queryParams: { select_campaign: campaignId } });
  }

  isInfluencerInCampaign(influencerId: string): boolean {
    return this.influencerService.isInfluencerInAnyCampaign(influencerId);
  }

  toggleSelection(id: string) {
    this.selectedInfluencerIds.update(currentSet => {
        const newSet = new Set(currentSet);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  }

  toggleAllSelection() {
    const areAllCurrentlySelected = this.areAllSelected();
    this.selectedInfluencerIds.update(currentSet => {
        const newSet = new Set<string>();
        if (!areAllCurrentlySelected) {
            this.results().forEach(inf => newSet.add(inf.id));
        }
        return newSet;
    });
  }

  toggleCampaignModalDropdown() {
    this.isCampaignModalDropdownOpen.update(v => !v);
  }

  selectCampaignForModal(campaignId: string) {
    this.selectedCampaignId.set(campaignId);
    this.isCampaignModalDropdownOpen.set(false);
  }
}
