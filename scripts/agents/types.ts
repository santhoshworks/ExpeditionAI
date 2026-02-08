// scripts/agents/types.ts

export interface OdooSocialPost {
  id?: number;
  message: string;
  scheduled_date?: string;
  account_ids?: number[];
  image_urls?: string[];
  hashtags?: string[];
  cta_url?: string;
}

export interface GeneratedPost {
  type: 'product' | 'trend';
  content: string;
  hashtags: string[];
  scheduledTime: string;  // ISO format
  ctaUrl: string;
  imagePrompt?: string;
}

export interface TrendingTopic {
  name: string;
  trendingNow: boolean;
  volume?: number;
  relevanceScore?: number;
}

export interface AgentConfig {
  claudeApiKey: string;
  odooUrl: string;
  odooApiKey: string;
  thoughtmapUrl: string;
  features: string[];
}
