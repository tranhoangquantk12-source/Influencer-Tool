import { Injectable, signal } from '@angular/core';
// FIX: Import Budget directly from influencer.model.ts
import { Influencer, PlatformName, Budget } from '../models/influencer.model';
import { Campaign, CampaignInfluencerDetails, CustomColumn, CustomColumnType } from '../models/campaign.model';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const MOCK_INFLUENCERS: Influencer[] = [
    { id: '1', name: 'Alex Tech', handle: 'alextech', platforms: [{ name: 'YouTube', url: '#' }], followers: 1200000, avatarUrl: 'https://picsum.photos/id/1011/200/200', categories: ['Tech & Gaming', 'Education & How-To'], engagementRate: 4.5, country: 'USA', email: 'alex.tech@example.com', averageViewcount: 150000 },
    { id: '2', name: 'Bella Cooks', handle: 'bellacooks', platforms: [{ name: 'Instagram', url: '#' }, { name: 'TikTok', url: '#' }], followers: 750000, avatarUrl: 'https://picsum.photos/id/1025/200/200', categories: ['Food & Cooking', 'Lifestyle & Daily Vlogs'], engagementRate: 3.2, country: 'Canada', email: 'bella.cooks@example.com', averageViewcount: 45000 },
    { id: '3', name: 'Charlie Travels', handle: 'charlie_travels', platforms: [{ name: 'TikTok', url: '#' }], followers: 2500000, avatarUrl: 'https://picsum.photos/id/1040/200/200', categories: ['Travel & Adventure', 'Art & Creativity'], engagementRate: 12.1, country: 'United Kingdom', email: 'charlie.travels@example.com', averageViewcount: 300000 },
    { id: '4', name: 'Diana Fit', handle: 'diana_fit', platforms: [{ name: 'Instagram', url: '#' }], followers: 450000, avatarUrl: 'https://picsum.photos/id/1074/200/200', categories: ['Fitness & Health', 'Lifestyle & Daily Vlogs'], engagementRate: 5.8, country: 'Australia', email: 'diana.fit@example.com', averageViewcount: 25000 },
    { id: '5', name: 'Evan Gamer', handle: 'evangames', platforms: [{ name: 'YouTube', url: '#' }, { name: 'X', url: '#' }], followers: 3100000, avatarUrl: 'https://picsum.photos/id/237/200/200', categories: ['Tech & Gaming', 'Entertainment & Pop Culture'], engagementRate: 6.2, country: 'USA', email: 'evan.games@example.com', averageViewcount: 450000 },
    { id: '6', name: 'Fiona Fashion', handle: 'fionafashion', platforms: [{ name: 'Instagram', url: '#' }], followers: 980000, avatarUrl: 'https://picsum.photos/id/1084/200/200', categories: ['Fashion & Beauty', 'Luxury & High-End Living'], engagementRate: 7.1, country: 'France', email: 'fiona.fashion@example.com', averageViewcount: 80000 },
];

const DEFAULT_KANBAN_COLUMNS = ['Negotiating', 'Pending', 'Agreement Signed', 'Preparing Content', 'Scope Done', 'Rejected'];

@Injectable({ providedIn: 'root' })
export class InfluencerService {
    private allInfluencers = signal<Influencer[]>(MOCK_INFLUENCERS);
    private campaigns = signal<Campaign[]>([
        { id: 'campaign1', name: 'Q4 Tech Campaign', description: 'Launch campaign for the new T-800 series headphones.', budget: 25000, avatarUrl: 'https://picsum.photos/id/1/40/40', bannerUrl: 'https://picsum.photos/id/1/600/300', influencerIds: new Set(['1', '5']), customColumns: [{ id: 'col1', name: 'Product Status', type: 'text'}], kanbanColumns: [...DEFAULT_KANBAN_COLUMNS] },
        { id: 'campaign2', name: 'Summer Wellness Promo', description: 'Promoting our new line of organic protein shakes.', budget: 15000, avatarUrl: 'https://picsum.photos/id/11/40/40', bannerUrl: 'https://picsum.photos/id/103/600/300', influencerIds: new Set(['2', '4']), customColumns: [], kanbanColumns: [...DEFAULT_KANBAN_COLUMNS] },
        { id: 'campaign3', name: 'Global Travel Series', description: 'A campaign to highlight hidden travel gems around the world.', budget: 50000, avatarUrl: 'https://picsum.photos/id/12/40/40', bannerUrl: 'https://picsum.photos/id/102/600/300', influencerIds: new Set(['3']), customColumns: [], kanbanColumns: [...DEFAULT_KANBAN_COLUMNS] }
    ]);
    
    // Map key is `campaignId_influencerId`
    private campaignInfluencerDetails = signal<Map<string, CampaignInfluencerDetails>>(new Map([
        ['campaign1_1', { source: 'Outbound', progressStatus: 'Agreement Signed', contentDeliveryStatus: 'Not Live Yet', paymentStatus: 'Awaiting', documents: [{name: 'Contract_Alex.pdf', url: '#'}], deliverables: [], budget: { value: 5000, currency: 'USD' }, notes: 'Initial contact made. Contract signed.', customFields: { col1: 'Shipped', startDate: '2024-05-10' } }],
        ['campaign1_5', { source: 'Outbound', progressStatus: 'Negotiating', contentDeliveryStatus: 'Not Live Yet', paymentStatus: 'Awaiting', documents: [], deliverables: [], budget: { value: 8000, currency: 'USD' }, notes: 'Positive reply, scheduled a call.', customFields: { col1: 'Pending', startDate: '2024-05-12' } }],
        ['campaign2_2', { source: 'Inbound', progressStatus: 'Scope Done', contentDeliveryStatus: 'Live', paymentStatus: 'Fulfilled', documents: [{name: 'Contract_Bella.pdf', url: '#'}], deliverables: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'], budget: { value: 3500, currency: 'USD' }, notes: 'Great collaboration. High engagement.', customFields: {} }],
        ['campaign2_4', { source: 'Outbound', progressStatus: 'Scope Done', contentDeliveryStatus: 'Partially Done', paymentStatus: 'Partially Made', documents: [], deliverables: ['https://www.youtube.com/watch?v=mock_video_id_2'], budget: { value: 2000, currency: 'USD' }, notes: 'First post is live, awaiting second post.', customFields: {} }],
        ['campaign3_3', { source: 'Inbound', progressStatus: 'Preparing Content', contentDeliveryStatus: 'Not Live Yet', paymentStatus: 'Awaiting', documents: [], deliverables: [], budget: { value: 12000, currency: 'USD' }, notes: 'World tour promotion.', customFields: {} }],
    ]));

    getAllInfluencers() {
        return this.allInfluencers.asReadonly();
    }

    search(term: string, platforms: Set<PlatformName>, country: string, minFollowers: number | null, maxFollowers: number | null, minViewcount: number | null, maxViewcount: number | null, minEngagement: number | null): Observable<Influencer[]> {
        const filtered = this.allInfluencers().filter(inf => {
            const termMatch = term ? inf.name.toLowerCase().includes(term.toLowerCase()) || inf.handle.toLowerCase().includes(term.toLowerCase()) || inf.categories.some(t => t.toLowerCase().includes(t.toLowerCase())) : true;
            const platformMatch = platforms.size > 0 ? inf.platforms.some(p => platforms.has(p.name)) : true;
            const countryMatch = country ? inf.country === country : true;
            const minFollowersMatch = minFollowers !== null ? inf.followers >= minFollowers : true;
            const maxFollowersMatch = maxFollowers !== null ? inf.followers <= maxFollowers : true;
            const minViewcountMatch = minViewcount !== null ? (inf.averageViewcount ?? 0) >= minViewcount : true;
            const maxViewcountMatch = maxViewcount !== null ? (inf.averageViewcount ?? Infinity) <= maxViewcount : true;
            const engagementMatch = minEngagement !== null ? inf.engagementRate >= minEngagement : true;
            return termMatch && platformMatch && countryMatch && minFollowersMatch && maxFollowersMatch && minViewcountMatch && maxViewcountMatch && engagementMatch;
        });
        return of(filtered).pipe(delay(500)); // Simulate network latency
    }
    
    getCampaigns() {
        return toObservable(this.campaigns);
    }

    reorderCampaigns(startIndex: number, endIndex: number) {
        this.campaigns.update(currentCampaigns => {
            const result = Array.from(currentCampaigns);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        });
    }

    getInfluencerWithDetails(id: string): { influencer: Influencer, campaignDetails: ({ campaignId: string, campaignName: string } & CampaignInfluencerDetails)[] } | undefined {
        const influencer = this.allInfluencers().find(inf => inf.id === id);
        if (!influencer) return undefined;

        const campaignDetails: ({ campaignId: string, campaignName: string } & CampaignInfluencerDetails)[] = [];
        this.campaigns().forEach(campaign => {
            if (campaign.influencerIds.has(id)) {
                const details = this.campaignInfluencerDetails().get(`${campaign.id}_${id}`);
                if (details) {
                    campaignDetails.push({
                        campaignId: campaign.id,
                        campaignName: campaign.name,
                        ...details
                    });
                }
            }
        });

        return { influencer, campaignDetails };
    }

    createCampaign(campaignData: Omit<Campaign, 'id' | 'influencerIds' | 'customColumns' | 'kanbanColumns'>): Campaign {
        const newCampaign: Campaign = {
            ...campaignData,
            id: `campaign_${Date.now()}`,
            influencerIds: new Set(),
            customColumns: [],
            kanbanColumns: [...DEFAULT_KANBAN_COLUMNS]
        };
        this.campaigns.update(campaigns => [...campaigns, newCampaign]);
        return newCampaign;
    }

    createBlankCampaign(): Campaign {
        const newCampaignData: Omit<Campaign, 'id' | 'influencerIds' | 'customColumns' | 'kanbanColumns'> = {
            name: `New Campaign ${new Date().toLocaleDateString()}`,
            description: '',
            budget: 0,
            avatarUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 50)}/40/40`,
            bannerUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 50)}/600/300`,
        };
        return this.createCampaign(newCampaignData);
    }

    deleteCampaign(campaignId: string) {
        this.campaigns.update(campaigns => campaigns.filter(c => c.id !== campaignId));
        this.campaignInfluencerDetails.update(detailsMap => {
            const newMap = new Map<string, CampaignInfluencerDetails>();
            detailsMap.forEach((value, key) => {
                if (!key.startsWith(`${campaignId}_`)) {
                    newMap.set(key, value);
                }
            });
            return newMap;
        });
    }

    getInfluencersForCampaign(campaignId: string): Observable<Influencer[]> {
        const campaign = this.campaigns().find(c => c.id === campaignId);
        if (!campaign) return of([]);

        const influencerIds = Array.from(campaign.influencerIds);
        const influencers = this.allInfluencers().filter(inf => influencerIds.includes(inf.id));
        
        const detailedInfluencers = influencers.map(inf => {
            const details = this.campaignInfluencerDetails().get(`${campaignId}_${inf.id}`);
            return {
                ...inf,
                ...details
            };
        });
        
        return of(detailedInfluencers);
    }

    getAllInfluencersWithCampaignDetails(): (Influencer & { campaignId: string; campaignName: string })[] {
        const allDetailedInfluencers: (Influencer & { campaignId: string; campaignName: string })[] = [];
        this.campaigns().forEach(campaign => {
             campaign.influencerIds.forEach(infId => {
                const baseInfluencer = this.allInfluencers().find(i => i.id === infId);
                const details = this.campaignInfluencerDetails().get(`${campaign.id}_${infId}`);
                if (baseInfluencer && details) {
                    allDetailedInfluencers.push({
                        ...baseInfluencer,
                        ...details,
                        campaignId: campaign.id,
                        campaignName: campaign.name
                    });
                }
             });
        });
        return allDetailedInfluencers;
    }
    
    updateInfluencerDetail(campaignId: string, influencerId: string, updatedDetails: Partial<CampaignInfluencerDetails>) {
        const key = `${campaignId}_${influencerId}`;
        this.campaignInfluencerDetails.update(detailsMap => {
            const existingDetails = detailsMap.get(key) || { source: 'Outbound', progressStatus: 'Negotiating', contentDeliveryStatus: 'Not Live Yet', paymentStatus: 'Awaiting', documents: [], deliverables: [], budget: null, notes: '', customFields: {} };
            const newDetails = { ...existingDetails, ...updatedDetails };
            detailsMap.set(key, newDetails);
            return new Map(detailsMap);
        });
    }

    addInfluencerToCampaign(influencer: Influencer, campaignId: string, initialDetails?: Partial<CampaignInfluencerDetails>) {
        this.allInfluencers.update(all => {
            if (!all.find(i => i.id === influencer.id)) {
                return [...all, influencer];
            }
            return all;
        });
        
        this.campaigns.update(campaigns => {
            const campaign = campaigns.find(c => c.id === campaignId);
            if(campaign) {
                campaign.influencerIds.add(influencer.id);

                const customFields: Record<string, any> = {};
                // Auto-populate special columns like 'Start Date'
                campaign.customColumns.forEach(col => {
                    if (col.name.toLowerCase() === 'start date' || col.type === 'date') {
                        customFields[col.id] = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                    }
                });

                this.updateInfluencerDetail(campaignId, influencer.id, {
                    source: 'Outbound',
                    progressStatus: initialDetails?.progressStatus || 'Negotiating',
                    contentDeliveryStatus: 'Not Live Yet',
                    paymentStatus: 'Awaiting',
                    budget: null,
                    notes: influencer.notes || '',
                    customFields,
                    ...initialDetails,
                });
            }
            return campaigns.map(c => c.id === campaignId ? { ...c, influencerIds: new Set(c.influencerIds) } : c);
        });
    }

    addMultipleInfluencersToCampaign(influencers: Influencer[], campaignId: string) {
        influencers.forEach(inf => this.addInfluencerToCampaign(inf, campaignId));
    }

    removeInfluencersFromCampaign(influencerIds: string[], campaignId: string) {
        this.campaigns.update(campaigns => {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (campaign) {
                influencerIds.forEach(id => campaign.influencerIds.delete(id));
            }
            return campaigns.map(c => c.id === campaignId ? { ...c, influencerIds: new Set(c.influencerIds) } : c);
        });

        this.campaignInfluencerDetails.update(detailsMap => {
            influencerIds.forEach(infId => {
                detailsMap.delete(`${campaignId}_${infId}`);
            });
            return new Map(detailsMap);
        });
    }

    moveInfluencersToCampaign(influencerIds: string[], fromCampaignId: string, toCampaignId: string) {
        this.campaigns.update(campaigns => {
            const fromCampaign = campaigns.find(l => l.id === fromCampaignId);
            const toCampaign = campaigns.find(l => l.id === toCampaignId);
            if (fromCampaign && toCampaign) {
                influencerIds.forEach(id => {
                    if (fromCampaign.influencerIds.has(id)) {
                        fromCampaign.influencerIds.delete(id);
                        toCampaign.influencerIds.add(id);
                    }
                });
            }
            return campaigns.map(c => ({ ...c, influencerIds: new Set(c.influencerIds) }));
        });

        this.campaignInfluencerDetails.update(detailsMap => {
            influencerIds.forEach(id => {
                const fromKey = `${fromCampaignId}_${id}`;
                const toKey = `${toCampaignId}_${id}`;
                const details = detailsMap.get(fromKey);

                if (details) {
                    detailsMap.delete(fromKey);
                    detailsMap.set(toKey, details);
                }
            });
            return new Map(detailsMap);
        });
    }

    isInfluencerInAnyCampaign(influencerId: string): boolean {
        return this.campaigns().some(campaign => campaign.influencerIds.has(influencerId));
    }

    addCustomColumnToCampaign(campaignId: string, name: string, type: CustomColumnType) {
        this.campaigns.update(campaigns => {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (campaign) {
                const newColumn: CustomColumn = {
                    id: `col_${Date.now()}`,
                    name,
                    type
                };
                campaign.customColumns.push(newColumn);
            }
            return [...campaigns];
        });
    }

    updateCampaignColumns(campaignId: string, columns: string[]) {
        this.campaigns.update(campaigns => {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (campaign) {
                campaign.kanbanColumns = columns;
            }
            return [...campaigns];
        });
    }

    renameCampaignColumn(campaignId: string, oldName: string, newName: string) {
        // 1. Rename in campaign.kanbanColumns
        this.campaigns.update(campaigns => {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (campaign) {
                const index = campaign.kanbanColumns.indexOf(oldName);
                if (index > -1) {
                    campaign.kanbanColumns[index] = newName;
                }
            }
            return [...campaigns];
        });
        // 2. Update all relevant influencers' progressStatus
        this.campaignInfluencerDetails.update(detailsMap => {
            const newMap = new Map(detailsMap);
            // FIX: The for...of loop over map entries was causing a type inference issue,
            // resulting in 'key' and 'details' being of type 'unknown'. Switched to forEach
            // which has stronger type inference in this context. Also, updated to create
            // a new object for immutability, which is better practice with signals.
            // FIX: Add explicit types for callback parameters to resolve type inference issues.
            newMap.forEach((details: CampaignInfluencerDetails, key: string) => {
                if (key.startsWith(`${campaignId}_`) && details.progressStatus === oldName) {
                    newMap.set(key, { ...details, progressStatus: newName });
                }
            });
            return newMap;
        });
    }

    removeCampaignColumn(campaignId: string, columnName: string) {
        // 1. Find influencers to remove
        const influencerIdsToRemove: string[] = [];
        this.campaignInfluencerDetails().forEach((details, key) => {
            if (key.startsWith(`${campaignId}_`) && details.progressStatus === columnName) {
                const influencerId = key.split('_')[1];
                influencerIdsToRemove.push(influencerId);
            }
        });
    
        // 2. Remove influencers from campaign
        if (influencerIdsToRemove.length > 0) {
            this.removeInfluencersFromCampaign(influencerIdsToRemove, campaignId);
        }
        
        // 3. Remove column from campaign object
        this.campaigns.update(campaigns => {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (campaign) {
                campaign.kanbanColumns = campaign.kanbanColumns.filter(c => c !== columnName);
            }
            return [...campaigns];
        });
    }

    getSuggestedInfluencers(campaignId: string, limit = 5): Influencer[] {
        const campaign = this.campaigns().find(c => c.id === campaignId);
        if (!campaign) return [];
    
        const influencersInCurrentCampaign = campaign.influencerIds;
        
        // Find all unique influencers across ALL campaigns
        const allInfluencersInAnyCampaign = new Set<string>();
        this.campaigns().forEach(c => {
            c.influencerIds.forEach(id => allInfluencersInAnyCampaign.add(id));
        });

        // Suggest influencers from other campaigns that aren't in the current one
        const suggestedIds = [...allInfluencersInAnyCampaign].filter(id => !influencersInCurrentCampaign.has(id));

        return this.allInfluencers()
            .filter(inf => suggestedIds.includes(inf.id))
            .slice(0, limit);
    }
}
