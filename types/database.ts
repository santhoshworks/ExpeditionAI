// Database types matching Supabase schema

export type UserTier = 'free' | 'basic' | 'pro'

// Learning context types for personalized coaching
export type LearningPurpose = 'interview' | 'exam' | 'research' | 'work' | 'curiosity' | 'teaching' | 'building'
export type LearnerLevel = 'beginner' | 'familiar' | 'intermediate' | 'advanced'
export type TeachingStyle = 'content' | 'coach'

// Teaching style display metadata
export const TEACHING_STYLES: Record<TeachingStyle, { label: string; description: string }> = {
  content: { label: 'Content Mode', description: 'Deep, comprehensive explanations you can read and absorb - like a well-written article' },
  coach: { label: 'Coach Mode', description: 'Interactive style with questions to check understanding and guide discovery' },
}

// Learning purpose display metadata
export const LEARNING_PURPOSES: Record<LearningPurpose, { label: string; description: string; icon: string }> = {
  interview: { label: 'Interview Prep', description: 'Prepare to explain concepts clearly and handle follow-up questions', icon: '🎯' },
  exam: { label: 'Exam Study', description: 'Comprehensive coverage with focus on retention and test patterns', icon: '📝' },
  research: { label: 'Research', description: 'Deep dive with nuances, current developments, and academic rigor', icon: '🔬' },
  work: { label: 'Work Application', description: 'Practical implementation, best practices, and real-world trade-offs', icon: '💼' },
  curiosity: { label: 'Personal Curiosity', description: 'Engaging exploration at your own pace, no pressure', icon: '✨' },
  teaching: { label: 'Teaching Others', description: 'Learn how to explain concepts and address common misconceptions', icon: '👨‍🏫' },
  building: { label: 'Building Something', description: 'Hands-on guidance with implementation focus', icon: '🛠️' },
}

// Learner level display metadata
export const LEARNER_LEVELS: Record<LearnerLevel, { label: string; description: string }> = {
  beginner: { label: 'Complete Beginner', description: 'New to this topic, need fundamentals explained simply' },
  familiar: { label: 'Some Familiarity', description: 'Know the basics, ready for more depth' },
  intermediate: { label: 'Intermediate', description: 'Solid foundation, can handle complexity' },
  advanced: { label: 'Advanced', description: 'Deep knowledge, looking for nuances and edge cases' },
}

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
  learning_purpose: LearningPurpose | null;
  learner_level: LearnerLevel | null;
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
  is_flagged: boolean; // Keep for backward compatibility
  flag_type: string | null; // New flag system - can be null for existing records
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
  role: "user" | "assistant" | "system" | "illustration";
  content: string;
  model: string | null;
  tokens_used: number | null;
  metadata: string | null;
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


export interface LearningWishlistItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: number;
  source_url: string | null;
  estimated_time: string | null;
  tags: string[] | null;
  is_completed: boolean;
  completed_at: string | null;
  expedition_id: string | null;
  created_at: string;
  updated_at: string;
}

// Learning Analytics types
export interface UserLearningStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_start_date: string | null;
  total_active_days: number;
  created_at: string;
  updated_at: string;
}

export interface DailyLearningActivity {
  id: string;
  user_id: string;
  activity_date: string;
  message_count: number;
  trail_count: number;
  expedition_count: number;
  total_tokens: number;
  estimated_minutes: number;
  topics_explored: string[];
  created_at: string;
  updated_at: string;
}

export interface LearningAnalyticsSummary {
  streaks: {
    current: number;
    longest: number;
    total_active_days: number;
    streak_start_date: string | null;
  };
  totals: {
    messages: number;
    trails: number;
    expeditions: number;
    tokens: number;
    minutes: number;
    hours: number;
  };
  topics: {
    unique_count: number;
    list: string[];
  };
  recent_activity: Array<{
    date: string;
    messages: number;
    trails: number;
    minutes: number;
  }>;
  activity_by_hour: Record<string, number>;
}

export interface EmailSubscription {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  source: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}
