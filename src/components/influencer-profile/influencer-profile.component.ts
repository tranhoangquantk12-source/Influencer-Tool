import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { InfluencerService } from '../../services/influencer.service';
import { CampaignInfluencerDetails } from '../../models/campaign.model';
import { GeminiService } from '../../services/gemini.service';
import { Influencer } from '../../models/influencer.model';
import { Location } from '@angular/common';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PLATFORM_LOGOS } from '../../constants';
import { IconComponent } from '../shared/icon/icon.component';

type InfluencerData = { 
  influencer: Influencer, 
  campaignDetails: ({ campaignId: string; campaignName: string; } & CampaignInfluencerDetails)[] 
};
type AiSummaryStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-influencer-profile',
  templateUrl: './influencer-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, SafeHtmlPipe, IconComponent],
})
export class InfluencerProfileComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private influencerService: InfluencerService = inject(InfluencerService);
  private geminiService: GeminiService = inject(GeminiService);
  // FIX: Explicitly typed the injected `Location` service to fix a type inference issue.
  // The service was being inferred as `unknown`, preventing access to the `.back()` method.
  private locationService: Location = inject(Location);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  // FIX: Explicitly type the 'params' in the map operator to resolve type inference issues.
  private influencerId = toSignal(this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))));
  
  influencerData = signal<InfluencerData | null | undefined>(undefined);
  aiSummary = signal<string>('');
  aiSummaryStatus = signal<AiSummaryStatus>('idle');

  readonly platformLogos = PLATFORM_LOGOS;

  liveCampaigns = computed(() => {
    return this.influencerData()?.campaignDetails.filter(c => c.deliverables && c.deliverables.length > 0) || [];
  });

  contactStatus = computed(() => {
    const details = this.influencerData()?.campaignDetails;
    if (!details || details.length === 0) return 'Not Contacted';
    // A more robust check would be needed here based on specific progress statuses
    return 'Contacted';
  });

  constructor() {
    effect(() => {
      const id = this.influencerId();
      if (id) {
        // FIX: Cast 'id' to string as type inference is failing and treating it as 'unknown'.
        const data = this.influencerService.getInfluencerWithDetails(id as string);
        this.influencerData.set(data);
      }
    }, { allowSignalWrites: true });
  }

  goBack(): void {
    this.locationService.back();
  }

  getAiSummary() {
    const data = this.influencerData();
    if (!data) return;
    
    this.aiSummaryStatus.set('loading');
    this.geminiService.getAiSummaryForInfluencer(data.influencer)
      .then(summary => {
        this.aiSummary.set(summary);
        this.aiSummaryStatus.set('success');
      })
      .catch(() => this.aiSummaryStatus.set('error'));
  }

  getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getSafeYouTubeUrl(url: string): SafeResourceUrl | null {
    const videoId = this.getYouTubeVideoId(url);
    if (!videoId) {
        return null;
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getContactStatusColor(): string {
    switch (this.contactStatus()) {
      case 'Contacted':
        return 'bg-blue-100 text-blue-800';
      case 'Not Contacted':
      default:
        return 'bg-slate-100 text-slate-800';
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
        case 'Pending':
        case 'Awaiting':
            return 'bg-amber-100 text-amber-800';
        case 'Rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-slate-100 text-slate-600';
    }
  }
}
