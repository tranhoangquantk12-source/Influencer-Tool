export type PlatformName = 'YouTube' | 'Instagram' | 'TikTok' | 'X' | 'Facebook';

export interface Platform {
  name: PlatformName;
  url: string;
}

// FIX: Add Budget interface here to resolve type conflicts and avoid circular dependencies.
export interface Budget {
    value: number;
    currency: string;
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platforms: Platform[];
  followers: number;
  avatarUrl: string;
  categories: string[];
  engagementRate: number;
  country: string;
  email: string;
  averageViewcount?: number;

  // These properties are now part of CampaignInfluencerDetails
  // FIX: Update budget type to be compatible with CampaignInfluencerDetails.
  budget?: Budget | null;
  notes?: string;
  source?: InfluencerSource;
  progressStatus?: ProgressStatus;
  contentDeliveryStatus?: ContentDeliveryStatus;
  paymentStatus?: PaymentStatus;
  documents?: { name: string, url: string }[];
  deliverables?: string[];
  customFields?: Record<string, any>;
}

export type InfluencerSource = 'Inbound' | 'Outbound';

export type ProgressStatus = string;
export type ContentDeliveryStatus = 'Live' | 'Not Live Yet' | 'Partially Done';
export type PaymentStatus = 'Awaiting' | 'Partially Made' | 'Fulfilled';

// The types below can be deprecated in favor of the new ones, but are kept for now for compatibility during refactoring.
export type OutreachStatus = 'Not Contacted' | 'Contacted' | 'Negotiating' | 'Signed' | 'Declined';
export type EmailStatus = 'Not Sent' | 'Outreach Sent' | 'New Message';
export type CollabStatus = 'Negotiating' | 'Contract Sent' | 'Contract Signed';
export type ContentStatus = 'Awaiting Content' | 'Content Submitted' | 'Live';
