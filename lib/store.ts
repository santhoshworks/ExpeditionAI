import { create } from "zustand"
import { persist } from "zustand/middleware"

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

  // Model selection
  selectedModel: string

  // Actions
  setCurrentExpedition: (id: string | null) => void
  setCurrentTrail: (id: string | null) => void
  setSelectedText: (
    text: string | null,
    position?: { x: number; y: number }
  ) => void
  setAutoMessageData: (data: { trailId: string; selectedText: string } | null) => void
  toggleSidebar: () => void
  toggleMapExpanded: () => void
  setSelectedModel: (model: string) => void
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
      selectedModel: "anthropic/claude-3.5-sonnet",

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

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      toggleMapExpanded: () =>
        set((state) => ({
          mapExpanded: !state.mapExpanded,
        })),

      setSelectedModel: (model) => set({ selectedModel: model }),

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
