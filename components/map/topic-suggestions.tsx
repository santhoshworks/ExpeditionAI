"use client"

import { useState, useEffect, useCallback } from "react"
import { TrailWithCounts } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Lightbulb, Sparkles, ChevronRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCreateTrail } from "@/lib/queries"
import { useExploreStore } from "@/lib/store"

interface TopicSuggestionsProps {
    expeditionId: string
    trails: TrailWithCounts[]
    onCreateTrail?: (trailId: string) => void
}

interface Suggestion {
    topic: string
    description: string
    category: "deep-dive" | "related" | "contrasting" | "practical"
}

const categoryConfig = {
    "deep-dive": {
        label: "Deep Dive",
        icon: "🔍",
        color: "text-blue-500",
    },
    "related": {
        label: "Related Topics",
        icon: "🔗",
        color: "text-green-500",
    },
    "contrasting": {
        label: "Different Perspective",
        icon: "💭",
        color: "text-purple-500",
    },
    "practical": {
        label: "Practical Application",
        icon: "🛠️",
        color: "text-orange-500",
    },
}

export function TopicSuggestions({
    expeditionId,
    trails,
    onCreateTrail,
}: TopicSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const createTrail = useCreateTrail()
    const { setCurrentTrail, setAutoMessageData } = useExploreStore()

    const generateSuggestions = useCallback(() => {
        setIsGenerating(true)

        // Extract topics from trails
        const topics = trails.map(t => t.title)
        const newSuggestions: Suggestion[] = []

        if (trails.length === 0) {
            // Default suggestions if no trails exist
            newSuggestions.push(
                {
                    topic: "Getting Started",
                    description: "Begin your exploration journey",
                    category: "practical",
                },
                {
                    topic: "Core Concepts",
                    description: "Understand the fundamentals",
                    category: "deep-dive",
                },
                {
                    topic: "Related Ideas",
                    description: "Explore connected topics",
                    category: "related",
                }
            )
        } else {
            // Generate contextual suggestions based on existing trails
            const lastTrail = trails[trails.length - 1]

            // Deep dive suggestions
            newSuggestions.push({
                topic: `${lastTrail.title} - Advanced Concepts`,
                description: "Explore deeper aspects and nuances",
                category: "deep-dive",
            })

            // Related topic suggestions
            newSuggestions.push({
                topic: `How ${lastTrail.title} relates to other fields`,
                description: "Cross-disciplinary connections",
                category: "related",
            })

            // Contrasting perspective
            newSuggestions.push({
                topic: `Challenges and limitations of ${lastTrail.title}`,
                description: "Critical analysis and counterpoints",
                category: "contrasting",
            })

            // Practical application
            newSuggestions.push({
                topic: `Real-world applications of ${lastTrail.title}`,
                description: "Apply concepts to practical scenarios",
                category: "practical",
            })

            // Add suggestions for other prominent trails
            const sortedTrails = [...trails].sort((a, b) =>
                (b.message_count || 0) - (a.message_count || 0)
            ).slice(0, 3)

            sortedTrails.forEach((trail) => {
                if (trail.id !== lastTrail.id && trail.message_count && trail.message_count > 2) {
                    newSuggestions.push({
                        topic: `Comparing ${lastTrail.title} with ${trail.title}`,
                        description: "Understand similarities and differences",
                        category: "contrasting",
                    })
                }
            })
        }

        setSuggestions(newSuggestions)
        setIsGenerating(false)
    }, [trails])

    // Generate suggestions based on existing trails
    useEffect(() => {
        generateSuggestions()
    }, [generateSuggestions])

    const handleCreateTrail = async (suggestion: Suggestion) => {
        try {
            // Priority: Current active trail > Most active trail as parent
            const activeTrailId = useExploreStore.getState().currentTrailId
            const activeTrail = trails.find(t => t.id === activeTrailId)

            const parentTrail = activeTrail || (trails.length > 0
                ? trails.reduce((prev, current) =>
                    (current.message_count || 0) > (prev.message_count || 0) ? current : prev
                )
                : undefined)

            const newTrail = await createTrail.mutateAsync({
                expeditionId,
                parentTrailId: parentTrail?.id,
                title: suggestion.topic,
            })

            setCurrentTrail(newTrail.id)
            setAutoMessageData({
                trailId: newTrail.id,
                selectedText: suggestion.topic,
            })
            onCreateTrail?.(newTrail.id)
        } catch (error) {
            console.error("Failed to create trail:", error)
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold">Explore More</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={generateSuggestions}
                        disabled={isGenerating}
                        className="h-8 w-8"
                    >
                        <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Suggested topics based on your current exploration
                </p>
            </div>

            {/* Current Topics Overview */}
            <div className="p-4 border-b bg-muted/30">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Topics Explored ({trails.length})
                </h3>
                <div className="space-y-1">
                    {trails.slice(0, 5).map((trail) => (
                        <div
                            key={trail.id}
                            className="text-xs flex items-start gap-1 text-muted-foreground"
                        >
                            <span className="mt-1">•</span>
                            <span className="flex-1 line-clamp-1">{trail.title}</span>
                            <span className="text-[10px] opacity-70">
                                {trail.message_count || 0}
                            </span>
                        </div>
                    ))}
                    {trails.length > 5 && (
                        <p className="text-xs text-muted-foreground italic">
                            +{trails.length - 5} more...
                        </p>
                    )}
                </div>
            </div>

            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h3 className="text-sm font-medium mb-3">Suggestions</h3>

                {suggestions.map((suggestion, index) => {
                    const config = categoryConfig[suggestion.category]
                    return (
                        <div
                            key={index}
                            className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => handleCreateTrail(suggestion)}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-lg flex-shrink-0">{config.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="text-sm font-medium line-clamp-2">
                                            {suggestion.topic}
                                        </h4>
                                        <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                        {suggestion.description}
                                    </p>
                                    <span
                                        className={cn(
                                            "text-[10px] font-medium uppercase tracking-wide",
                                            config.color
                                        )}
                                    >
                                        {config.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                    Click any suggestion to create a new trail
                </p>
            </div>
        </div>
    )
}
