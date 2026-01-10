"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Expedition, Trail, Message, ExpeditionWithStats, TrailWithCounts } from "@/types/database"

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
