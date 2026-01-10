// Database types matching Supabase schema

export type UserTier = 'free' | 'basic' | 'pro'

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  default_model: string;
  openrouter_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits: number;
  tier: UserTier;
  trails_today: number;
  last_trail_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deduct' | 'add' | 'purchase' | 'bonus';
  model_id: string | null;
  trail_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Expedition {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpeditionWithStats extends Expedition {
  trail_count: number;
  message_count: number;
  flagged_count: number;
}

export interface Trail {
  id: string;
  expedition_id: string;
  parent_trail_id: string | null;
  title: string;
  source_text: string | null;
  is_flagged: boolean;
  is_base_camp: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TrailWithCounts extends Trail {
  message_count: number;
  last_message_at: string | null;
}

export interface Message {
  id: string;
  trail_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  tokens_used: number | null;
  created_at: string;
}

export interface Journal {
  id: string;
  expedition_id: string;
  content: string;
  trail_ids: string[];
  model: string | null;
  created_at: string;
}

// For React Flow (@xyflow/react)
export interface FlowNode {
  id: string;
  type: "trailNode";
  position: { x: number; y: number };
  data: {
    trail: TrailWithCounts;
    isActive: boolean;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}
