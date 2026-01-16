import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserTier } from "./constants"
import { DEFAULT_MODELS } from "./constants"

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
