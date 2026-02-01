// Flashcard types for the flashcard feature

export interface Flashcard {
  id: string
  front: string              // Question or concept prompt
  back: string               // Answer or explanation
  sourceTrailId: string      // Which trail it came from
  sourceTrailTitle: string   // Trail title for context
  sourceType: 'concept' | 'question'  // How it was extracted
  importance: number         // 1-5 based on discussion depth
  createdAt: string
}

export interface FlashcardProgress {
  flashcardId: string
  status: 'new' | 'got_it' | 'missed'
  reviewCount: number
  lastReviewedAt: string | null
}

export interface FlashcardDeck {
  id: string
  expeditionId: string
  trailId: string | null     // null = expedition-wide
  title: string
  cards: Flashcard[]
  progress: Map<string, FlashcardProgress>
  createdAt: string
}

export interface FlashcardState {
  isFlashcardMode: boolean
  flashcards: Flashcard[]
  currentCardIndex: number
  cardProgress: Record<string, FlashcardProgress>
  flashcardLoading: boolean
  flashcardError: string | null
  scope: 'trail' | 'expedition' | null
  sourceId: string | null  // trailId or expeditionId depending on scope
}

// API request/response types
export interface GenerateFlashcardsRequest {
  expeditionId: string
  trailId?: string  // Optional - if not provided, generate from all trails
  cardCount?: number  // Default 10
}

export interface GenerateFlashcardsResponse {
  cards: Omit<Flashcard, 'id' | 'createdAt'>[]
}
