// scripts/odoo/types.ts

export interface OdooAuth {
  url: string;
  apiKey: string;
}

export interface OdooSocialPost {
  id?: number;
  message: string;
  scheduled_date: string; // Format: "2026-02-09 11:00:00"
  scheduled_datetime?: string;
  account_ids?: [number];
  image_urls?: string[];
  state?: string; // 'draft', 'scheduled', 'posted'
}

export interface CreatePostResponse {
  id: number;
  success: boolean;
}
