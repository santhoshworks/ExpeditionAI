// This file is auto-generated. Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
// For now, we'll use a basic structure that matches our schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          default_model: string
          openrouter_api_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          default_model?: string
          openrouter_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          default_model?: string
          openrouter_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expeditions: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          is_archived: boolean
          is_public: boolean
          public_slug: string | null
          public_description: string | null
          view_count: number
          last_viewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          is_archived?: boolean
          is_public?: boolean
          public_slug?: string | null
          public_description?: string | null
          view_count?: number
          last_viewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          is_archived?: boolean
          is_public?: boolean
          public_slug?: string | null
          public_description?: string | null
          view_count?: number
          last_viewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trails: {
        Row: {
          id: string
          expedition_id: string
          parent_trail_id: string | null
          title: string
          source_text: string | null
          is_flagged: boolean
          is_base_camp: boolean
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          expedition_id: string
          parent_trail_id?: string | null
          title: string
          source_text?: string | null
          is_flagged?: boolean
          is_base_camp?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          expedition_id?: string
          parent_trail_id?: string | null
          title?: string
          source_text?: string | null
          is_flagged?: boolean
          is_base_camp?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          trail_id: string
          role: "user" | "assistant" | "system" | "illustration"
          content: string
          model: string | null
          tokens_used: number | null
          metadata: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trail_id: string
          role: "user" | "assistant" | "system" | "illustration"
          content: string
          model?: string | null
          tokens_used?: number | null
          metadata?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trail_id?: string
          role?: "user" | "assistant" | "system" | "illustration"
          content?: string
          model?: string | null
          tokens_used?: number | null
          metadata?: string | null
          created_at?: string
        }
      }
      journals: {
        Row: {
          id: string
          expedition_id: string
          content: string
          trail_ids: string[]
          model: string | null
          created_at: string
        }
        Insert: {
          id?: string
          expedition_id: string
          content: string
          trail_ids?: string[]
          model?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          expedition_id?: string
          content?: string
          trail_ids?: string[]
          model?: string | null
          created_at?: string
        }
      }
      user_credits: {
        Row: {
          user_id: string
          credits: number
          tier: string
          trails_today: number
          last_trail_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          credits?: number
          tier?: string
          trails_today?: number
          last_trail_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          credits?: number
          tier?: string
          trails_today?: number
          last_trail_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trail_illustrations: {
        Row: {
          id: string
          trail_id: string
          illustration_query: string
          generated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trail_id: string
          illustration_query: string
          generated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trail_id?: string
          illustration_query?: string
          generated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      quiz_challenges: {
        Row: {
          id: string
          expedition_id: string
          challenger_id: string
          challenger_name: string
          score: number
          total_questions: number
          percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          expedition_id: string
          challenger_id: string
          challenger_name: string
          score: number
          total_questions: number
          percentage: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          expedition_id?: string
          challenger_id?: string
          challenger_name?: string
          score?: number
          total_questions?: number
          percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      trails_with_counts: {
        Row: {
          id: string
          expedition_id: string
          parent_trail_id: string | null
          title: string
          source_text: string | null
          is_flagged: boolean
          is_base_camp: boolean
          position: number
          created_at: string
          updated_at: string
          message_count: number
          last_message_at: string | null
        }
      }
      expeditions_with_stats: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
          trail_count: number
          message_count: number
          flagged_count: number
        }
      }
    }
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: {
          success: boolean
          remaining_credits: number
          error?: string
        }
      }
      add_credits: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: {
          new_balance: number
        }
      }
      increment_trail_count: {
        Args: {
          p_user_id: string
          p_date: string
        }
        Returns: void
      }
      generate_expedition_slug: {
        Args: {
          title: string
        }
        Returns: string
      }
      increment_expedition_views: {
        Args: {
          expedition_slug: string
        }
        Returns: void
      }
    }
  }
}
