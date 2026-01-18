"use client"

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { useLearningAnalytics, useLearningStreak } from "@/hooks/use-analytics"
import { Flame, Clock, Target, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export function AnalyticsCards() {
  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError } = useLearningAnalytics()
  const { data: streak, isLoading: streakLoading, isError: streakError } = useLearningStreak()

  const isLoading = analyticsLoading || streakLoading

  if (isLoading) {
    return <AnalyticsCardsSkeleton />
  }

  // If there's an error, we still want to show the cards but with zeroed values
  // instead of crashing the whole dashboard

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Streak Card */}
      <StreakCard
        currentStreak={streak?.current_streak || 0}
        longestStreak={streak?.longest_streak || 0}
      />

      {/* Learning Time Card */}
      <LearningTimeCard
        totalMinutes={analytics?.totals?.minutes || 0}
        totalHours={analytics?.totals?.hours || 0}
      />

      {/* Progress Card */}
      <ProgressCard
        trails={analytics?.totals?.trails || 0}
        expeditions={analytics?.totals?.expeditions || 0}
        messages={analytics?.totals?.messages || 0}
      />

      {/* Topics Card */}
      <TopicsCard
        uniqueTopics={analytics?.topics?.unique_count || 0}
        topicsList={analytics?.topics?.list || []}
      />
    </div>
  )
}

function StreakCard({ currentStreak, longestStreak }: { currentStreak: number; longestStreak: number }) {
  const isOnFire = currentStreak >= 3

  return (
    <Card className="relative overflow-hidden group border-none bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
      <div className={cn(
        "absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl transition-colors opacity-50",
        isOnFire ? "bg-orange-400/30" : "bg-indigo-400/10"
      )} />
      <CardHeader className="pb-2 space-y-0 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-2xl transition-all duration-500",
            isOnFire ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "bg-white dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 shadow-sm"
          )}>
            <Flame className={cn("w-5 h-5", isOnFire && "animate-pulse")} />
          </div>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Streak</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-3xl font-bold tracking-tight",
            isOnFire ? "text-orange-600" : "text-slate-900 dark:text-white"
          )}>
            {currentStreak}
          </span>
          <span className="text-slate-400 font-bold text-sm">days</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-2">
          Record: {longestStreak} days
        </p>
      </CardContent>
    </Card>
  )
}

function LearningTimeCard({ totalMinutes, totalHours }: { totalMinutes: number; totalHours: number }) {
  const displayValue = totalHours >= 1 ? totalHours : totalMinutes
  const unit = totalHours >= 1 ? 'hours' : 'min'

  return (
    <Card className="relative overflow-hidden group border-none bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl bg-indigo-400/10 opacity-50" />
      <CardHeader className="pb-2 space-y-0 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 shadow-sm transition-all duration-300">
            <Clock className="w-5 h-5" />
          </div>
          <CardDescription className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Total Dive</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{Math.round(displayValue)}</span>
          <span className="text-slate-400 font-semibold text-sm tracking-tight">{unit}</span>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-2">
          Collective Focus
        </p>
      </CardContent>
    </Card>
  )
}

function ProgressCard({ trails, expeditions, messages }: { trails: number; expeditions: number; messages: number }) {
  return (
    <Card className="relative overflow-hidden group border-none bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl bg-indigo-400/10 opacity-50" />
      <CardHeader className="pb-2 space-y-0 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 shadow-sm transition-all duration-300">
            <Target className="w-5 h-5" />
          </div>
          <CardDescription className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Impact</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{trails}</span>
          <span className="text-slate-400 font-semibold text-sm tracking-tight">milestones</span>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-2">
          {expeditions} Dives, {messages} Ideas
        </p>
      </CardContent>
    </Card>
  )
}

function TopicsCard({ uniqueTopics, topicsList }: { uniqueTopics: number; topicsList: string[] }) {
  const displayTopics = topicsList.slice(0, 2)

  return (
    <Card className="relative overflow-hidden group border-none bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl bg-indigo-400/10 opacity-50" />
      <CardHeader className="pb-2 space-y-0 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 shadow-sm transition-all duration-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <CardDescription className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Expansion</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{uniqueTopics}</span>
          <span className="text-slate-400 font-semibold text-sm tracking-tight">domains</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 truncate max-w-full">
          {displayTopics.length > 0 ? displayTopics.join(', ') : 'Beginning...'}
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
