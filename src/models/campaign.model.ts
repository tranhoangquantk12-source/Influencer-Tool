import { Influencer, InfluencerSource, ProgressStatus, ContentDeliveryStatus, PaymentStatus, Budget } from './influencer.model';

export type CustomColumnType = 'text' | 'link' | 'date' | 'number';

export interface CustomColumn {
  id: string;
  name: string;
  type: CustomColumnType;
}

export interface Campaign {
  id:string;
  name: string;
  description: string;
  budget: number;
  avatarUrl: string;
  bannerUrl: string;
  influencerIds: Set<string>;
  customColumns: CustomColumn[];
  kanbanColumns: string[];
}

export interface CampaignInfluencerDetails {
    source: InfluencerSource;
    progressStatus: ProgressStatus;
    contentDeliveryStatus: ContentDeliveryStatus;
    paymentStatus: PaymentStatus;
    documents: { name: string, url: string }[];
    deliverables: string[];
    budget: Budget | null;
    notes: string;
    customFields: Record<string, any>;
}
