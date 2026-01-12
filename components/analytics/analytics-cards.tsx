"use client"

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { useLearningAnalytics, useLearningStreak } from "@/hooks/use-analytics"
import { Flame, Clock, Target, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export function AnalyticsCards() {
  const { data: analytics, isLoading: analyticsLoading } = useLearningAnalytics()
  const { data: streak, isLoading: streakLoading } = useLearningStreak()

  const isLoading = analyticsLoading || streakLoading

  if (isLoading) {
    return <AnalyticsCardsSkeleton />
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {/* Streak Card */}
      <StreakCard
        currentStreak={streak?.current_streak || 0}
        longestStreak={streak?.longest_streak || 0}
      />

      {/* Learning Time Card */}
      <LearningTimeCard
        totalMinutes={analytics?.totals.minutes || 0}
        totalHours={analytics?.totals.hours || 0}
      />

      {/* Progress Card */}
      <ProgressCard
        trails={analytics?.totals.trails || 0}
        expeditions={analytics?.totals.expeditions || 0}
        messages={analytics?.totals.messages || 0}
      />

      {/* Topics Card */}
      <TopicsCard
        uniqueTopics={analytics?.topics.unique_count || 0}
        topicsList={analytics?.topics.list || []}
      />
    </div>
  )
}

function StreakCard({ currentStreak, longestStreak }: { currentStreak: number; longestStreak: number }) {
  const isOnFire = currentStreak >= 3

  return (
    <Card className="relative overflow-hidden">
      <div className={cn(
        "absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl transition-colors",
        isOnFire ? "bg-orange-500/20" : "bg-muted/30"
      )} />
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            isOnFire ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"
          )}>
            <Flame className={cn("w-4 h-4", isOnFire && "animate-pulse")} />
          </div>
          <CardDescription className="text-xs font-medium">Learning Streak</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-2xl md:text-3xl font-bold",
            isOnFire && "text-orange-500"
          )}>
            {currentStreak}
          </span>
          <span className="text-muted-foreground text-sm">days</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Best: {longestStreak} days
        </p>
      </CardContent>
    </Card>
  )
}

function LearningTimeCard({ totalMinutes, totalHours }: { totalMinutes: number; totalHours: number }) {
  const displayValue = totalHours >= 1 ? totalHours : totalMinutes
  const unit = totalHours >= 1 ? 'hours' : 'min'

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl bg-blue-500/10" />
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
            <Clock className="w-4 h-4" />
          </div>
          <CardDescription className="text-xs font-medium">Learning Time</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-bold">{Math.round(displayValue)}</span>
          <span className="text-muted-foreground text-sm">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Total time exploring
        </p>
      </CardContent>
    </Card>
  )
}

function ProgressCard({ trails, expeditions, messages }: { trails: number; expeditions: number; messages: number }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl bg-green-500/10" />
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
            <Target className="w-4 h-4" />
          </div>
          <CardDescription className="text-xs font-medium">Progress</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-bold">{trails}</span>
          <span className="text-muted-foreground text-sm">trails</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {expeditions} expeditions, {messages} messages
        </p>
      </CardContent>
    </Card>
  )
}

function TopicsCard({ uniqueTopics, topicsList }: { uniqueTopics: number; topicsList: string[] }) {
  const displayTopics = topicsList.slice(0, 3)

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl bg-purple-500/10" />
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
            <BookOpen className="w-4 h-4" />
          </div>
          <CardDescription className="text-xs font-medium">Knowledge Growth</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-bold">{uniqueTopics}</span>
          <span className="text-muted-foreground text-sm">topics</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {displayTopics.length > 0 ? displayTopics.join(', ') : 'Start exploring!'}
        </p>
      </CardContent>
    </Card>
  )
}

function AnalyticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-6 w-24 bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-4 w-20 bg-muted/30 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export { StreakCard, LearningTimeCard, ProgressCard, TopicsCard, AnalyticsCardsSkeleton }
