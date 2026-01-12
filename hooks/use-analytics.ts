"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { LearningAnalyticsSummary, UserLearningStreak } from "@/types/database"

// Fetch complete analytics summary
export function useLearningAnalytics() {
  return useQuery({
    queryKey: ["learningAnalytics"],
    queryFn: async () => {
      const response = await fetch('/api/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      return response.json() as Promise<LearningAnalyticsSummary>
    },
    staleTime: 60000, // Consider stale after 1 minute
    refetchOnWindowFocus: true,
  })
}

// Fetch just streak data (lighter weight)
export function useLearningStreak() {
  return useQuery({
    queryKey: ["learningStreak"],
    queryFn: async () => {
      const response = await fetch('/api/analytics/streak')
      if (!response.ok) {
        throw new Error('Failed to fetch streak')
      }
      return response.json() as Promise<UserLearningStreak>
    },
    staleTime: 30000, // Refresh more frequently
    refetchOnWindowFocus: true,
  })
}

// Update streak after activity
export function useUpdateStreak() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/analytics/streak', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to update streak')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningStreak"] })
      queryClient.invalidateQueries({ queryKey: ["learningAnalytics"] })
    },
  })
}

// Refresh analytics
export function useRefreshAnalytics() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ["learningAnalytics"] })
    queryClient.invalidateQueries({ queryKey: ["learningStreak"] })
  }
}
