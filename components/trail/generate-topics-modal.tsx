"use client"

import { useState, useCallback } from "react"
import { TrailWithCounts } from "@/types/database"
import { FlagType } from "@/types/flags"
import { useCreateTrail } from "@/lib/queries"
import { useExploreStore } from "@/lib/store"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Sparkles,
    Loader2,
    CheckSquare,
    Square,
    Wand2,
    ArrowRight,
    ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface GeneratedTopic {
    topic: string
    description: string
    selected: boolean
}

interface GenerateTopicsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    expeditionId: string
    expeditionTitle: string
    trails: TrailWithCounts[]
}

type Step = "count" | "generating" | "select" | "creating"

export function GenerateTopicsModal({
    open,
    onOpenChange,
    expeditionId,
    expeditionTitle,
    trails,
}: GenerateTopicsModalProps) {
    const [step, setStep] = useState<Step>("count")
    const [topicCount, setTopicCount] = useState(5)
    const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([])
    const [error, setError] = useState<string | null>(null)
    const [creatingIndex, setCreatingIndex] = useState(-1)

    const createTrail = useCreateTrail()
    const { setCurrentTrail } = useExploreStore()

    const resetModal = useCallback(() => {
        setStep("count")
        setTopicCount(5)
        setGeneratedTopics([])
        setError(null)
        setCreatingIndex(-1)
    }, [])

    const handleClose = useCallback(() => {
        onOpenChange(false)
        // Reset after animation completes
        setTimeout(resetModal, 200)
    }, [onOpenChange, resetModal])

    const generateTopics = useCallback(async () => {
        setStep("generating")
        setError(null)

        try {
            const existingTopics = trails
                .filter(t => !t.is_base_camp)
                .map(t => t.title)

            const response = await fetch("/api/generate-topics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    expeditionTitle,
                    existingTopics,
                    count: topicCount,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to generate topics")
            }

            const topics = await response.json() as Array<{
                topic: string
                description: string
            }>

            setGeneratedTopics(
                topics.map(t => ({
                    ...t,
                    selected: true, // All selected by default
                }))
            )
            setStep("select")
        } catch (err) {
            console.error("Failed to generate topics:", err)
            setError(err instanceof Error ? err.message : "Failed to generate topics")
            setStep("count")
        }
    }, [expeditionTitle, trails, topicCount])

    const toggleTopic = useCallback((index: number) => {
        setGeneratedTopics(prev =>
            prev.map((t, i) =>
                i === index ? { ...t, selected: !t.selected } : t
            )
        )
    }, [])

    const selectAll = useCallback(() => {
        setGeneratedTopics(prev => prev.map(t => ({ ...t, selected: true })))
    }, [])

    const deselectAll = useCallback(() => {
        setGeneratedTopics(prev => prev.map(t => ({ ...t, selected: false })))
    }, [])

    const selectedCount = generatedTopics.filter(t => t.selected).length

    const createTrails = useCallback(async () => {
        const selectedTopics = generatedTopics.filter(t => t.selected)
        if (selectedTopics.length === 0) {
            handleClose()
            return
        }

        setStep("creating")

        // Find the base camp to use as parent
        const baseCamp = trails.find(t => t.is_base_camp)

        let lastCreatedTrailId: string | null = null

        for (let i = 0; i < selectedTopics.length; i++) {
            setCreatingIndex(i)
            const topic = selectedTopics[i]

            try {
                const newTrail = await createTrail.mutateAsync({
                    expeditionId,
                    parentTrailId: baseCamp?.id,
                    title: topic.topic,
                    sourceText: topic.description,
                    flagType: FlagType.NOT_EXPLORED,
                })
                lastCreatedTrailId = newTrail.id
            } catch (err) {
                console.error(`Failed to create trail for topic: ${topic.topic}`, err)
            }
        }

        // Navigate to the last created trail
        // Auto-message will be triggered by ChatInterface when it detects sourceText
        if (lastCreatedTrailId) {
            setCurrentTrail(lastCreatedTrailId)
        }

        handleClose()
    }, [generatedTopics, trails, expeditionId, createTrail, setCurrentTrail, handleClose])

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                {/* Step 1: Topic Count Input */}
                {step === "count" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-primary" />
                                Generate Topics to Learn
                            </DialogTitle>
                            <DialogDescription>
                                AI will suggest new topics based on your current learning journey in &ldquo;{expeditionTitle}&rdquo;.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="topicCount">
                                    How many topics would you like to generate?
                                </Label>
                                <Input
                                    id="topicCount"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={topicCount}
                                    onChange={(e) => setTopicCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="w-32"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Choose between 1 and 20 topics
                                </p>
                            </div>

                            {trails.length > 1 && (
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{trails.length - 1}</span> topics already in your expedition will be used as context.
                                    </p>
                                </div>
                            )}

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={generateTopics}>
                                Generate
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* Step 2: Generating */}
                {step === "generating" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                                Generating Topics
                            </DialogTitle>
                            <DialogDescription>
                                AI is analyzing your learning journey and finding relevant topics...
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-8 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                                This may take a few seconds...
                            </p>
                        </div>
                    </>
                )}

                {/* Step 3: Select Topics */}
                {step === "select" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Select Topics to Add
                            </DialogTitle>
                            <DialogDescription>
                                Choose which topics you&apos;d like to add to your expedition. All topics are selected by default.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">
                                    {selectedCount} of {generatedTopics.length} selected
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={selectAll}
                                        className="h-8 text-xs"
                                    >
                                        <CheckSquare className="h-3 w-3 mr-1" />
                                        Select All
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={deselectAll}
                                        className="h-8 text-xs"
                                    >
                                        <Square className="h-3 w-3 mr-1" />
                                        Deselect All
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-2">
                                    {generatedTopics.map((topic, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                                topic.selected
                                                    ? "bg-primary/5 border-primary/30"
                                                    : "bg-card hover:bg-accent/50"
                                            )}
                                            onClick={() => toggleTopic(index)}
                                        >
                                            <Checkbox
                                                checked={topic.selected}
                                                onCheckedChange={() => toggleTopic(index)}
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium line-clamp-2">
                                                    {topic.topic}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {topic.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setStep("count")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button
                                onClick={createTrails}
                                disabled={selectedCount === 0}
                            >
                                {selectedCount === 0
                                    ? "Skip"
                                    : `Add ${selectedCount} Topic${selectedCount !== 1 ? "s" : ""}`}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* Step 4: Creating Trails */}
                {step === "creating" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                Creating Trails
                            </DialogTitle>
                            <DialogDescription>
                                Adding your selected topics to the expedition...
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <div className="space-y-2">
                                {generatedTopics
                                    .filter(t => t.selected)
                                    .map((topic, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-lg text-sm",
                                                index < creatingIndex
                                                    ? "text-green-600 bg-green-50 dark:bg-green-950/30"
                                                    : index === creatingIndex
                                                        ? "text-primary bg-primary/10"
                                                        : "text-muted-foreground"
                                            )}
                                        >
                                            {index < creatingIndex ? (
                                                <CheckSquare className="h-4 w-4" />
                                            ) : index === creatingIndex ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Square className="h-4 w-4" />
                                            )}
                                            <span className="line-clamp-1">{topic.topic}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
