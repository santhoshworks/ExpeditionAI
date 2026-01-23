import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserTier } from "./constants"
import { DEFAULT_MODELS } from "./constants"

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

  // User credits and tier
  userTier: UserTier
  userCredits: number
  trailsToday: number

  // Quiz state
  quizState: QuizState

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
  setUserCredits: (credits: number, tier: UserTier, trailsToday?: number) => void
  deductCreditsLocally: (amount: number) => void
  reset: () => void

  // Quiz actions
  setQuizMode: (isActive: boolean) => void
  setQuizQuestions: (questions: QuizQuestion[]) => void
  setCurrentQuestionIndex: (index: number) => void
  answerQuestion: (questionIndex: number, answerIndex: number) => void
  setQuizLoading: (loading: boolean) => void
  setQuizError: (error: string | null) => void
  setSelectedQuestionCount: (count: number | null) => void
  resetQuiz: () => void
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
      userCredits: 0,
      trailsToday: 0,

      // Initial quiz state
      quizState: {
        isQuizMode: false,
        quizQuestions: [],
        currentQuestionIndex: 0,
        quizLoading: false,
        quizError: null,
        selectedQuestionCount: null,
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

      setUserCredits: (credits, tier, trailsToday = 0) =>
        set({
          userCredits: credits,
          userTier: tier,
          trailsToday,
        }),

      deductCreditsLocally: (amount) =>
        set((state) => ({
          userCredits: Math.max(0, state.userCredits - amount),
        })),

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

      resetQuiz: () =>
        set((state) => ({
          quizState: {
            isQuizMode: false,
            quizQuestions: [],
            currentQuestionIndex: 0,
            quizLoading: false,
            quizError: null,
            selectedQuestionCount: null,
          },
        })),
    }),
    {
      name: "explore-storage",
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
