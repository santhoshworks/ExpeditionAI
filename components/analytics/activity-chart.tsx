"use client"

import { useLearningAnalytics } from "@/hooks/use-analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function ActivityChart() {
  const { data: analytics, isLoading } = useLearningAnalytics()

  if (isLoading) {
    return <ActivityChartSkeleton />
  }

  const recentActivity = analytics?.recent_activity || []
  const maxMessages = Math.max(...recentActivity.map(d => d.messages), 1)

  // Ensure we have 7 days of data (fill missing days with zeros)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const dayData = recentActivity.find(d => d.date === dateStr)
    return {
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      messages: dayData?.messages || 0,
      trails: dayData?.trails || 0,
      minutes: dayData?.minutes || 0,
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Weekly Activity</CardTitle>
        <CardDescription className="text-xs">Your learning activity over the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-24">
          {last7Days.map((day, i) => {
            const height = maxMessages > 0 ? (day.messages / maxMessages) * 100 : 0
            const isToday = i === 6

            return (
              <div key={day.date} className="flex flex-col items-center flex-1">
                <div className="w-full flex justify-center mb-1">
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t-md transition-all",
                      isToday ? "bg-primary" : "bg-primary/30",
                      day.messages === 0 && "bg-muted"
                    )}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.messages} messages, ${day.trails} trails, ${day.minutes} min`}
                  />
                </div>
                <span className={cn(
                  "text-[10px]",
                  isToday ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {day.dayName}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
        <div className="h-3 w-40 bg-muted/30 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-24">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className="w-full max-w-8 bg-muted/30 rounded-t-md animate-pulse"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
              <div className="h-3 w-6 bg-muted/30 rounded animate-pulse mt-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { ActivityChartSkeleton }
