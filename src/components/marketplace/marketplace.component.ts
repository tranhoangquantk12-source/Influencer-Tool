import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InfluencerService } from '../../services/influencer.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class MarketplaceComponent {
  private influencerService = inject(InfluencerService);
  
  // For now, we use the campaign data as offers. In a real app, this would be a separate data model.
  allOffers = toSignal(this.influencerService.getCampaigns(), { initialValue: [] });

  formatBudget(budget: number): string {
      return `$${budget.toLocaleString()}`;
  }
}
