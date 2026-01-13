"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { TrailTree } from "@/components/trail/trail-tree"
import { GitBranch, Wand2 } from "lucide-react"
import type { TrailWithCounts } from "@/types/database"

interface MobileTrailSelectorProps {
    trails: TrailWithCounts[]
    currentTrailId?: string
    onTrailSelect: (trailId: string) => void
    onGenerateTopics?: () => void
}

export function MobileTrailSelector({
    trails,
    currentTrailId,
    onTrailSelect,
    onGenerateTopics
}: MobileTrailSelectorProps) {
    const [open, setOpen] = useState(false)

    const handleTrailSelect = (trailId: string) => {
        onTrailSelect(trailId)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-8 gap-2 px-3">
                    <GitBranch className="h-4 w-4" />
                    Trails
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm h-[80vh] p-0 flex flex-col">
                <DialogHeader className="px-4 py-3 border-b bg-accent/30 flex-shrink-0">
                    <DialogTitle className="text-base flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-primary" />
                        Trails
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Navigate your exploration paths
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <TrailTree
                        trails={trails}
                        currentTrailId={currentTrailId}
                        onTrailSelect={handleTrailSelect}
                    />
                </div>

                {onGenerateTopics && (
                    <div className="p-3 border-t bg-accent/20 flex-shrink-0">
                        <Button
                            variant="outline"
                            className="w-full gap-2 text-xs"
                            onClick={() => {
                                onGenerateTopics()
                                setOpen(false)
                            }}
                        >
                            <Wand2 className="h-4 w-4" />
                            Generate Topics
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}