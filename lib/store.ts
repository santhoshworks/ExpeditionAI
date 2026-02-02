import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserTier } from "./constants"
import { DEFAULT_MODELS, getModelById } from "./constants"
import type { Flashcard, FlashcardProgress } from "@/types/flashcard"

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // index of correct option
  explanation: string
  userAnswer: number | null
}

export interface QuizState {
  isQuizMode: boolean
  quizQuestions: QuizQuestion[]
  currentQuestionIndex: number
  quizLoading: boolean
  quizError: string | null
  selectedQuestionCount: number | null
  scope: 'trail' | 'expedition' | null
  sourceId: string | null
}

export interface FlashcardState {
  isFlashcardMode: boolean
  flashcards: Flashcard[]
  currentCardIndex: number
  cardProgress: Record<string, FlashcardProgress>
  flashcardLoading: boolean
  flashcardError: string | null
  scope: 'trail' | 'expedition' | null
  sourceId: string | null
}

interface ExploreState {
  // Current expedition context
  currentExpeditionId: string | null
  currentTrailId: string | null

  // UI state
  selectedText: string | null
  selectedTextPosition: { x: number; y: number } | null
  showExploreButton: boolean
  sidebarCollapsed: boolean
  mapExpanded: boolean

  // Auto-message for new trails
  autoMessageData: {
    trailId: string
    selectedText: string
  } | null

  // Trails with pending responses (loading in background)
  trailsWithNewResponse: Set<string>

  // Model selection
  selectedModel: string

  // User tier (simplified from credits)
  userTier: UserTier

  // Quiz state
  quizState: QuizState

  // Flashcard state
  flashcardState: FlashcardState

  // Actions
  setCurrentExpedition: (id: string | null) => void
  setCurrentTrail: (id: string | null) => void
  setSelectedText: (
    text: string | null,
    position?: { x: number; y: number }
  ) => void
  setAutoMessageData: (data: { trailId: string; selectedText: string } | null) => void
  addTrailWithNewResponse: (trailId: string) => void
  clearTrailNewResponse: (trailId: string) => void
  toggleSidebar: () => void
  toggleMapExpanded: () => void
  setSelectedModel: (model: string) => void
  setUserTier: (tier: UserTier) => void
  reset: () => void

  // Quiz actions
  setQuizMode: (isActive: boolean) => void
  setQuizQuestions: (questions: QuizQuestion[]) => void
  setCurrentQuestionIndex: (index: number) => void
  answerQuestion: (questionIndex: number, answerIndex: number) => void
  setQuizLoading: (loading: boolean) => void
  setQuizError: (error: string | null) => void
  setSelectedQuestionCount: (count: number | null) => void
  setQuizScope: (scope: 'trail' | 'expedition', sourceId: string) => void
  resetQuiz: () => void

  // Flashcard actions
  setFlashcardMode: (isActive: boolean) => void
  setFlashcards: (cards: Flashcard[]) => void
  setCurrentCardIndex: (index: number) => void
  markCardProgress: (cardId: string, status: 'got_it' | 'missed') => void
  setFlashcardLoading: (loading: boolean) => void
  setFlashcardError: (error: string | null) => void
  setFlashcardScope: (scope: 'trail' | 'expedition', sourceId: string) => void
  resetFlashcards: () => void
}

export const useExploreStore = create<ExploreState>()(
  persist(
    (set) => ({
      // Initial state
      currentExpeditionId: null,
      currentTrailId: null,
      selectedText: null,
      selectedTextPosition: null,
      showExploreButton: false,
      sidebarCollapsed: false,
      mapExpanded: false,
      autoMessageData: null,
      trailsWithNewResponse: new Set<string>(),
      selectedModel: DEFAULT_MODELS.free,
      userTier: "free",

      // Initial quiz state
      quizState: {
        isQuizMode: false,
        quizQuestions: [],
        currentQuestionIndex: 0,
        quizLoading: false,
        quizError: null,
        selectedQuestionCount: null,
        scope: null,
        sourceId: null,
      },

      // Initial flashcard state
      flashcardState: {
        isFlashcardMode: false,
        flashcards: [],
        currentCardIndex: 0,
        cardProgress: {},
        flashcardLoading: false,
        flashcardError: null,
        scope: null,
        sourceId: null,
      },

      // Actions
      setCurrentExpedition: (id) => set({ currentExpeditionId: id }),
      setCurrentTrail: (id) => set({ currentTrailId: id }),

      setSelectedText: (text, position) =>
        set({
          selectedText: text,
          selectedTextPosition: position || null,
          showExploreButton: !!text,
        }),

      setAutoMessageData: (data) => set({ autoMessageData: data }),

      addTrailWithNewResponse: (trailId) =>
        set((state) => ({
          trailsWithNewResponse: new Set(state.trailsWithNewResponse).add(trailId),
        })),

      clearTrailNewResponse: (trailId) =>
        set((state) => {
          const newSet = new Set(state.trailsWithNewResponse)
          newSet.delete(trailId)
          return { trailsWithNewResponse: newSet }
        }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      toggleMapExpanded: () =>
        set((state) => ({
          mapExpanded: !state.mapExpanded,
        })),

      setSelectedModel: (model) => set({ selectedModel: model }),

      setUserTier: (tier) => set({ userTier: tier }),

      reset: () =>
        set({
          currentExpeditionId: null,
          currentTrailId: null,
          selectedText: null,
          selectedTextPosition: null,
          showExploreButton: false,
        }),

      // Quiz actions
      setQuizMode: (isActive) =>
        set((state) => ({
          quizState: { ...state.quizState, isQuizMode: isActive },
        })),

      setQuizQuestions: (questions) =>
        set((state) => ({
          quizState: { ...state.quizState, quizQuestions: questions },
        })),

      setCurrentQuestionIndex: (index) =>
        set((state) => ({
          quizState: { ...state.quizState, currentQuestionIndex: index },
        })),

      answerQuestion: (questionIndex, answerIndex) =>
        set((state) => {
          const newQuestions = [...state.quizState.quizQuestions]
          newQuestions[questionIndex] = {
            ...newQuestions[questionIndex],
            userAnswer: answerIndex,
          }
          return {
            quizState: { ...state.quizState, quizQuestions: newQuestions },
          }
        }),

      setQuizLoading: (loading) =>
        set((state) => ({
          quizState: { ...state.quizState, quizLoading: loading },
        })),

      setQuizError: (error) =>
        set((state) => ({
          quizState: { ...state.quizState, quizError: error },
        })),

      setSelectedQuestionCount: (count) =>
        set((state) => ({
          quizState: { ...state.quizState, selectedQuestionCount: count },
        })),

      setQuizScope: (scope, sourceId) =>
        set((state) => ({
          quizState: { ...state.quizState, scope, sourceId },
        })),

      resetQuiz: () =>
        set((state) => ({
          quizState: {
            isQuizMode: false,
            quizQuestions: [],
            currentQuestionIndex: 0,
            quizLoading: false,
            quizError: null,
            selectedQuestionCount: null,
            scope: null,
            sourceId: null,
          },
        })),

      // Flashcard actions
      setFlashcardMode: (isActive) =>
        set((state) => ({
          flashcardState: { ...state.flashcardState, isFlashcardMode: isActive },
        })),

      setFlashcards: (cards) =>
        set((state) => ({
          flashcardState: { ...state.flashcardState, flashcards: cards },
        })),

      setCurrentCardIndex: (index) =>
        set((state) => ({
          flashcardState: { ...state.flashcardState, currentCardIndex: index },
        })),

      markCardProgress: (cardId, status) =>
        set((state) => {
          const existingProgress = state.flashcardState.cardProgress[cardId]
          const newProgress = {
            flashcardId: cardId,
            status,
            reviewCount: (existingProgress?.reviewCount || 0) + 1,
            lastReviewedAt: new Date().toISOString(),
          }
          return {
            flashcardState: {
              ...state.flashcardState,
              cardProgress: {
                ...state.flashcardState.cardProgress,
                [cardId]: newProgress,
              },
            },
          }
        }),

      setFlashcardLoading: (loading) =>
        set((state) => ({
          flashcardState: { ...state.flashcardState, flashcardLoading: loading },
        })),

      setFlashcardError: (error) =>
        set((state) => ({
          flashcardState: { ...state.flashcardState, flashcardError: error },
        })),

      setFlashcardScope: (scope, sourceId) =>
        set((state) => ({
          flashcardState: { ...state.flashcardState, scope, sourceId },
        })),

      resetFlashcards: () =>
        set((state) => ({
          flashcardState: {
            isFlashcardMode: false,
            flashcards: [],
            currentCardIndex: 0,
            cardProgress: {},
            flashcardLoading: false,
            flashcardError: null,
            scope: null,
            sourceId: null,
          },
        })),
    }),
    {
      name: "explore-storage",
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      // Validate persisted model on load - reset to default if invalid
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ExploreState>
        const validModel = persisted.selectedModel && getModelById(persisted.selectedModel)
          ? persisted.selectedModel
          : DEFAULT_MODELS.free
        return {
          ...currentState,
          ...persisted,
          selectedModel: validModel,
        }
      },
    }
  )
)
