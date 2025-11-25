import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InfluencerService } from '../../services/influencer.service';
import { Influencer } from '../../models/influencer.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { PLATFORM_LOGOS } from '../../constants';

type InfluencerWithCampaign = Influencer & { campaignId: string; campaignName: string };

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeHtmlPipe, RouterLink, RouterLinkActive]
})
export class PerformanceComponent {
  private influencerService = inject(InfluencerService);
  // FIX: Explicitly type the injected DomSanitizer to resolve type inference issues.
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  
  campaigns = toSignal(this.influencerService.getCampaigns(), { initialValue: [] });
  selectedCampaignId = signal<string>('all');

  // Drag & Drop for Campaigns
  draggedCampaignIndex = signal<number | null>(null);

  private allInfluencers = computed<InfluencerWithCampaign[]>(() => 
    this.influencerService.getAllInfluencersWithCampaignDetails() as InfluencerWithCampaign[]
  );

  private displayedInfluencers = computed(() => {
    const campaignId = this.selectedCampaignId();
    if (campaignId === 'all') {
      return this.allInfluencers();
    }
    return this.allInfluencers().filter(inf => inf.campaignId === campaignId);
  });

  liveContentInfluencers = computed(() => 
    this.displayedInfluencers().filter(inf => (inf.contentDeliveryStatus === 'Live' || inf.contentDeliveryStatus === 'Partially Done') && inf.deliverables && inf.deliverables.length > 0)
  );

  awaitingContentInfluencers = computed(() =>
    this.displayedInfluencers().filter(inf => inf.contentDeliveryStatus === 'Not Live Yet')
  );

  readonly platformLogos = PLATFORM_LOGOS;
  
  isGeneratingInsights = signal(false);
  aiInsights = signal('');

  onCampaignDragStart(index: number) {
    this.draggedCampaignIndex.set(index);
  }

  onCampaignDrop(dropIndex: number) {
    const startIndex = this.draggedCampaignIndex();
    if (startIndex !== null && startIndex !== dropIndex) {
      this.influencerService.reorderCampaigns(startIndex, dropIndex);
    }
    this.draggedCampaignIndex.set(null);
  }

  getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getSafeYouTubeUrl(url: string): SafeResourceUrl | null {
    const videoId = this.getYouTubeVideoId(url);
    if (!videoId) return null;
    
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  generateAiInsights() {
    this.isGeneratingInsights.set(true);
    this.aiInsights.set('');
    // Simulate API call to Gemini
    setTimeout(() => {
      const campaignName = this.selectedCampaignId() === 'all' 
        ? 'all campaigns' 
        : this.campaigns().find(c => c.id === this.selectedCampaignId())?.name;
        
      this.aiInsights.set(`Analysis for ${campaignName}: The campaign shows strong performance on YouTube, with an average engagement rate of 5.8%. Content from Alex Tech is outperforming others by 25% in terms of views. However, sentiment analysis on Instagram content from Bella Cooks indicates a neutral audience reaction, suggesting a potential mismatch between the product and her audience. Recommendation: Double down on YouTube content and re-evaluate the target audience for future Instagram collaborations.`);
      this.isGeneratingInsights.set(false);
    }, 1500);
  }
}