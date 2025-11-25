import { Injectable, signal } from '@angular/core';
import { of, delay } from 'rxjs';
import { ContentDeliveryStatus, PaymentStatus, ProgressStatus } from '../models/influencer.model';

export interface Message {
    id: string;
    sender: 'user' | 'influencer';
    content: string;
    timestamp: Date;
}

export interface Conversation {
    id: string;
    influencerId: string;
    influencerName: string;
    influencerAvatar: string;
    subject: string;
    lastMessage: string;
    timestamp: Date;
    unread: boolean;
    messages: Message[];
    isOnline?: boolean;
    // Enriched data
    campaignName?: string;
    progressStatus?: ProgressStatus;
    contentDeliveryStatus?: ContentDeliveryStatus;
    paymentStatus?: PaymentStatus;
    budget?: number;
    deliverables?: string[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv1',
        influencerId: '1',
        influencerName: 'Alex Tech',
        influencerAvatar: 'https://picsum.photos/id/1011/200/200',
        subject: 'Re: Collaboration for Q4 Tech Campaign',
        lastMessage: 'Sounds great! I\'ve reviewed the contract and it looks good.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        unread: false,
        isOnline: true,
        messages: [
            { id: 'm1', sender: 'user', content: 'Hi Alex, here is the contract for our Q4 campaign.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
            { id: 'm2', sender: 'influencer', content: 'Thanks! Taking a look now.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1) },
            { id: 'm3', sender: 'influencer', content: 'Sounds great! I\'ve reviewed the contract and it looks good.', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
        ],
        campaignName: 'Q4 Tech Campaign',
        progressStatus: 'Agreement Signed',
        contentDeliveryStatus: 'Not Live Yet',
        paymentStatus: 'Awaiting',
        budget: 5000,
        deliverables: [],
    },
    {
        id: 'conv2',
        influencerId: '2',
        influencerName: 'Bella Cooks',
        influencerAvatar: 'https://picsum.photos/id/1025/200/200',
        subject: 'Re: Your content for Summer Wellness Promo is live!',
        lastMessage: 'Looks great! We\'ve just processed the payment.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        unread: true,
        isOnline: false,
        messages: [
             { id: 'm4', sender: 'user', content: 'Hi Bella, the video is fantastic! Thanks for the great work.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) },
             { id: 'm5', sender: 'influencer', content: 'So glad you like it! It was a pleasure working with you.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.5) },
             { id: 'm6', sender: 'user', content: 'Looks great! We\'ve just processed the payment.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
        ],
        campaignName: 'Summer Wellness Promo',
        progressStatus: 'Scope Done',
        contentDeliveryStatus: 'Live',
        paymentStatus: 'Fulfilled',
        budget: 3500,
        deliverables: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.instagram.com/p/Cszs0g12345/']
    },
];


@Injectable({ providedIn: 'root' })
export class ConversationService {
    private conversations = signal<Conversation[]>(MOCK_CONVERSATIONS);

    getConversations() {
        // Return as an observable to simulate async fetching
        return of(this.conversations()).pipe(delay(300));
    }

    getConversation(id: string) {
        return of(this.conversations().find(c => c.id === id)).pipe(delay(100));
    }

    sendMessage(conversationId: string, content: string) {
        this.conversations.update(convs => {
            const conversation = convs.find(c => c.id === conversationId);
            if (conversation) {
                const newMessage: Message = {
                    id: `m_${Date.now()}`,
                    sender: 'user',
                    content,
                    timestamp: new Date()
                };
                conversation.messages.push(newMessage);
                conversation.lastMessage = content;
                conversation.timestamp = new Date();
                conversation.unread = false;
            }
            // Sort to bring the latest conversation to the top
            return [...convs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        });
    }

    reorderConversations(startIndex: number, endIndex: number) {
        this.conversations.update(current => {
            const result = Array.from(current);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        });
    }

    syncWithGmail() {
        // This is a placeholder for a real backend integration.
        // In a real application, this would trigger an OAuth flow and use the Gmail API.
        console.log('Attempting to sync with Gmail...');
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Sync complete (mock).');
                resolve(true);
            }, 1500);
        });
    }
}