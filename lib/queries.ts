"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Expedition, Trail, Message, ExpeditionWithStats, TrailWithCounts, Journal, UserCredits, UserTier, LearningWishlistItem } from "@/types/database"
import type { Database } from "@/types/supabase"
import { FlagType } from "@/types/flags"
import { useExploreStore } from "@/lib/store"
import { useEffect } from "react"

// Expeditions
export function useExpeditions() {
  return useQuery({
    queryKey: ["expeditions"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("expeditions_with_stats")
        .select("*")
        .eq("is_archived", false)
        .order("updated_at", { ascending: false })

      if (error) throw error
      return data as ExpeditionWithStats[]
    },
  })
}

export function useExpedition(id: string) {
  return useQuery({
    queryKey: ["expedition", id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("expeditions")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data as Expedition
    },
    enabled: !!id,
  })
}

// Trails
export function useTrails(expeditionId: string) {
  return useQuery({
    queryKey: ["trails", expeditionId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("trails_with_counts")
        .select("*")
        .eq("expedition_id", expeditionId)
        .order("created_at")

      if (error) throw error
      return data as TrailWithCounts[]
    },
    enabled: !!expeditionId,
  })
}

// Messages
export function useMessages(trailId: string) {
  return useQuery({
    queryKey: ["messages", trailId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("trail_id", trailId)
        .order("created_at")

      if (error) throw error
      return data as Message[]
    },
    enabled: !!trailId,
  })
}

// Mutations
export function useCreateExpedition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { data: expedition, error } = await supabase
        .from("expeditions")
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
        } as any)
        .select()
        .single()

      if (error) throw error

      // Create base camp trail
      const { error: trailError } = await supabase
        .from("trails")
        .insert({
          expedition_id: (expedition as any).id,
          title: data.title,
          is_base_camp: true,
        } as any)

      if (trailError) throw trailError

      return expedition as Expedition
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expeditions"] })
    },
  })
}

export function useCreateTrail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      expeditionId: string
      parentTrailId?: string
      title: string
      sourceText?: string
    }) => {
      const supabase = createClient()

      // Get position for ordering - use filter for nullable parent_trail_id
      let query = supabase
        .from("trails")
        .select("*", { count: "exact", head: true })
        .eq("expedition_id", data.expeditionId)

      if (data.parentTrailId) {
        query = query.eq("parent_trail_id", data.parentTrailId)
      } else {
        query = query.is("parent_trail_id", null)
      }

      const { count } = await query

      const { data: trail, error } = await supabase
        .from("trails")
        .insert({
          expedition_id: data.expeditionId,
          parent_trail_id: data.parentTrailId || null,
          title: data.title,
          source_text: data.sourceText || null,
          is_base_camp: !data.parentTrailId,
          position: (count || 0) + 1,
        } as any)
        .select()
        .single()

      if (error) throw error
      return trail as Trail
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trails", variables.expeditionId],
      })
      queryClient.invalidateQueries({ queryKey: ["expeditions"] })
    },
  })
}

export function useToggleFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      trailId,
      isFlagged,
    }: {
      trailId: string
      isFlagged: boolean
    }) => {
      const supabase = createClient() as any
      const { error } = await supabase
        .from("trails")
        .update({ is_flagged: isFlagged })
        .eq("id", trailId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trails"] })
      queryClient.invalidateQueries({ queryKey: ["expeditions"] })
    },
  })
}

export function useUpdateTrailFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      trailId,
      flagType,
    }: {
      trailId: string
      flagType: FlagType
    }) => {
      const supabase = createClient() as any
      const { error } = await supabase
        .from("trails")
        .update({
          flag_type: flagType,
          is_flagged: flagType !== FlagType.NOT_EXPLORED // Keep backward compatibility
        })
        .eq("id", trailId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trails"] })
      queryClient.invalidateQueries({ queryKey: ["expeditions"] })
    },
  })
}

export function useDeleteExpedition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from("expeditions")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expeditions"] })
    },
  })
}

// Journals
export function useJournal(expeditionId: string) {
  return useQuery({
    queryKey: ["journal", expeditionId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("expedition_id", expeditionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data as Journal | null
    },
    enabled: !!expeditionId,
  })
}

export function useGenerateJournal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      expeditionId,
      model = "deepseek/deepseek-chat",
    }: {
      expeditionId: string
      model?: string
    }) => {
      const response = await fetch(`/api/expeditions/${expeditionId}/journal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to generate journal")
      }

      return response.json() as Promise<Journal>
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["journal", variables.expeditionId],
      })
    },
  })
}

// User Credits
export function useUserCredits() {
  const setUserCredits = useExploreStore((state) => state.setUserCredits)

  const query = useQuery({
    queryKey: ["userCredits"],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return { credits: 0, tier: 'free' as UserTier, trails_today: 0 }
      }

      const { data, error } = await supabase
        .from("user_credits")
        .select("credits, tier, trails_today, last_trail_date")
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        // Return default free tier if no record exists
        return { credits: 0, tier: 'free' as UserTier, trails_today: 0 }
      }

      const typedData = data as Database['public']['Tables']['user_credits']['Row']

      // Reset trails_today if it's a new day
      const today = new Date().toISOString().split('T')[0]
      const trailsToday = typedData.last_trail_date === today ? typedData.trails_today : 0

      return {
        credits: typedData.credits,
        tier: typedData.tier as UserTier,
        trails_today: trailsToday,
      }
    },
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true,
  })

  // Sync to Zustand store when data changes
  useEffect(() => {
    if (query.data) {
      setUserCredits(query.data.credits, query.data.tier, query.data.trails_today)
    }
  }, [query.data, setUserCredits])

  return query
}

export function useRefreshCredits() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ["userCredits"] })
  }
}

// Learning Wishlist
export function useLearningWishlist() {
  return useQuery({
    queryKey: ["learningWishlist"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("learning_wishlist")
        .select("*")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as LearningWishlistItem[]
    },
  })
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      title: string
      description?: string
      category?: string
      priority?: number
      source_url?: string
      estimated_time?: string
      tags?: string[]
    }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { data: item, error } = await supabase
        .from("learning_wishlist")
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          category: data.category || null,
          priority: data.priority || 3,
          source_url: data.source_url || null,
          estimated_time: data.estimated_time || null,
          tags: data.tags || null,
        } as any)
        .select()
        .single()

      if (error) throw error
      return item as LearningWishlistItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningWishlist"] })
    },
  })
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<LearningWishlistItem> & { id: string }) => {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from("learning_wishlist")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data as LearningWishlistItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningWishlist"] })
    },
  })
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from("learning_wishlist")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningWishlist"] })
    },
  })
}

export function useConvertToExpedition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (wishlistItemId: string) => {
      const supabase = createClient()

      // Get the wishlist item
      const { data: item, error: fetchError } = await supabase
        .from("learning_wishlist")
        .select("*")
        .eq("id", wishlistItemId)
        .single()

      if (fetchError) throw fetchError
      if (!item) throw new Error("Wishlist item not found")

      const wishlistItem = item as LearningWishlistItem

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create expedition with proper typing
      const expeditionData = {
        user_id: user.id,
        title: wishlistItem.title,
        description: wishlistItem.description,
      }

      const { data: expedition, error: expeditionError } = await (supabase as any)
        .from("expeditions")
        .insert(expeditionData)
        .select()
        .single()

      if (expeditionError) throw expeditionError

      // Create base camp trail with proper typing
      const trailData = {
        expedition_id: expedition.id,
        title: wishlistItem.title,
        is_base_camp: true,
      }

      const { error: trailError } = await (supabase as any)
        .from("trails")
        .insert(trailData)

      if (trailError) throw trailError

      // Update wishlist item to link to expedition and mark as completed
      const updateData = {
        expedition_id: expedition.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      }

      const { error: updateError } = await (supabase as any)
        .from("learning_wishlist")
        .update(updateData)
        .eq("id", wishlistItemId)

      if (updateError) throw updateError

      return expedition as Expedition
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningWishlist"] })
      queryClient.invalidateQueries({ queryKey: ["expeditions"] })
    },
  })
}
