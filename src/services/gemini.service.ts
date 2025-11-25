import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { Influencer } from '../models/influencer.model';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  
  constructor() {
    // IMPORTANT: This relies on the `process.env.API_KEY` being available in the execution environment.
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.error("API_KEY environment variable not found.");
    }
  }

  async findInfluencersByDescription(description: string): Promise<Influencer[]> {
    if (!this.ai) {
      throw new Error('Gemini AI client is not initialized. Check API_KEY.');
    }

    const INFLUENCER_SCHEMA = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'A unique UUID for the influencer.' },
          name: { type: Type.STRING, description: 'The full name of the influencer.' },
          handle: { type: Type.STRING, description: 'The social media handle, without the @ sign.' },
          platforms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Platform name (YouTube, Instagram, TikTok, X, or Facebook).' },
                url: { type: Type.STRING, description: 'A placeholder "#" for the channel URL.' }
              },
              required: ["name", "url"]
            },
            description: 'An array of the influencer\'s social media platforms.'
          },
          followers: { type: Type.INTEGER, description: 'The total number of followers or subscribers across all platforms.' },
          avatarUrl: { type: Type.STRING, description: 'A URL to a plausible fictional avatar image from picsum.photos.' },
          categories: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of 2-3 main categories or niches (e.g., "Tech", "Lifestyle", "Fitness").'
          },
          engagementRate: { type: Type.NUMBER, description: 'A plausible engagement rate as a percentage, e.g., 2.5.' },
          country: { type: Type.STRING, description: 'A plausible country of origin for the influencer.' },
          email: { type: Type.STRING, description: 'A plausible fictional email address for the influencer.' },
        },
        required: ["id", "name", "handle", "platforms", "followers", "avatarUrl", "categories", "engagementRate", "country", "email"]
      }
    };
    
    const prompt = `Based on the following description, generate a list of 5 fictional influencer profiles that are a good match.
    Description: "${description}"
    Ensure each profile has a unique ID, a realistic avatar from picsum.photos, a plausible country, email, and at least one platform with a '#' for the URL. The categories should be common influencer niches.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: INFLUENCER_SCHEMA,
          temperature: 0.8
        },
      });
      
      const jsonString = response.text;
      const influencers = JSON.parse(jsonString) as Influencer[];
      return influencers.map(inf => ({ ...inf, platforms: inf.platforms || [] })); // Ensure platforms is always an array

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Failed to generate influencer profiles from AI.");
    }
  }

  async getAiSummaryForInfluencer(influencer: Influencer): Promise<string> {
    // In a real app, this would use the Gemini API with conversation history.
    // For this demo, we'll return a plausible, mock summary.
    // FIX: Add generic type to new Promise to ensure correct type inference for the resolved value.
    return new Promise<string>(resolve => {
        setTimeout(() => {
            resolve(`Based on recent interactions, ${influencer.name} is highly interested in a potential collaboration. They have responded positively to outreach, showing particular excitement about creative freedom. Key negotiation points will likely be the budget, which they feel is slightly below their usual rate, and the content approval timeline. They are professional, responsive, and seem like a strong partner for this campaign.`);
        }, 1200); // Simulate API call
    });
  }
}
