"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    useLearningWishlist,
    useCreateWishlistItem,
    useUpdateWishlistItem,
    useDeleteWishlistItem,
    useConvertToExpedition
} from "@/lib/queries"
import {
    Plus,
    BookOpen,
    Trash2,
    Rocket,
    CheckCircle,
    Circle,
    Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
    "Technology",
    "Science",
    "Arts",
    "Business",
    "Health",
    "History",
    "Philosophy",
    "Language",
    "Other"
]

const PRIORITY_COLORS = {
    1: "bg-red-100 text-red-700 border-red-200",
    2: "bg-orange-100 text-orange-700 border-orange-200"
}

const PRIORITY_LABELS = {
    1: "High",
    2: "Medium",
    3: "Low"
}

export default function LearningWishlistPage() {
    const router = useRouter()
    const { data: wishlistItems, isLoading } = useLearningWishlist()
    const createItem = useCreateWishlistItem()
    const updateItem = useUpdateWishlistItem()
    const deleteItem = useDeleteWishlistItem()
    const convertToExpedition = useConvertToExpedition()

    const [showNewDialog, setShowNewDialog] = useState(false)
    const [filterCategory, setFilterCategory] = useState<string>("all")
    const [showCompleted, setShowCompleted] = useState(false)

    // Form state
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [priority, setPriority] = useState(2)

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setCategory("")
        setPriority(2)
    }

    const handleCreate = async () => {
        if (!title.trim()) return

        try {
            await createItem.mutateAsync({
                title: title.trim(),
                description: description.trim() || undefined,
                category: category || undefined,
                priority,
            })
            setShowNewDialog(false)
            resetForm()
        } catch (error) {
            console.error("Failed to create wishlist item:", error)
        }
    }

    const handleToggleComplete = async (item: any) => {
        try {
            await updateItem.mutateAsync({
                id: item.id,
                is_completed: !item.is_completed,
                completed_at: !item.is_completed ? new Date().toISOString() : null,
            })
        } catch (error) {
            console.error("Failed to update item:", error)
        }
    }

    const handleConvertToExpedition = async (itemId: string) => {
        try {
            const expedition = await convertToExpedition.mutateAsync(itemId)
            router.push(`/expedition/${expedition.id}`)
        } catch (error) {
            console.error("Failed to convert to expedition:", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this learning item?")) {
            try {
                await deleteItem.mutateAsync(id)
            } catch (error) {
                console.error("Failed to delete item:", error)
            }
        }
    }

    const filteredItems = wishlistItems?.filter(item => {
        if (!showCompleted && item.is_completed) return false
        if (filterCategory !== "all" && item.category !== filterCategory) return false
        return true
    }) || []

    return (
        <div className="h-full overflow-y-auto container mx-auto px-4 md:px-6 py-4 md:py-8">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6 md:mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Learning Wishlist
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">
                            Capture topics you want to explore and turn them into expeditions.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-32">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant={showCompleted ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setShowCompleted(!showCompleted)}
                                className="gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Completed
                            </Button>
                        </div>

                        <Button
                            onClick={() => setShowNewDialog(true)}
                            className="rounded-full shadow-lg shadow-primary/20 gap-2 flex-1 md:flex-initial"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Learning Item</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 rounded-lg bg-accent/30 animate-pulse border" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-4 md:p-8 border-2 border-dashed rounded-3xl bg-accent/5">
                    <div className="bg-primary/5 p-4 md:p-6 rounded-full mb-4 md:mb-6">
                        <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-primary/40" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
                        {wishlistItems?.length === 0 ? "Start building your learning wishlist" : "No items match your filters"}
                    </h3>
                    <p className="text-muted-foreground mb-6 md:mb-8 max-w-sm text-sm md:text-base">
                        {wishlistItems?.length === 0
                            ? "Add topics you're curious about and convert them to expeditions when you're ready to explore."
                            : "Try adjusting your category filter or showing completed items."
                        }
                    </p>
                    {wishlistItems?.length === 0 && (
                        <Button onClick={() => setShowNewDialog(true)} size="lg" className="rounded-full px-6 md:px-8">
                            Add Your First Learning Item
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "group flex items-center gap-3 p-3 rounded-lg border bg-card/40 hover:bg-card/60 transition-all",
                                item.is_completed && "opacity-60"
                            )}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 hover:bg-transparent flex-shrink-0"
                                onClick={() => handleToggleComplete(item)}
                            >
                                {item.is_completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                )}
                            </Button>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={cn(
                                        "font-medium text-sm truncate",
                                        item.is_completed && "line-through text-muted-foreground"
                                    )}>
                                        {item.title}
                                    </h3>
                                    {item.priority <= 2 && (
                                        <Badge variant="outline" className={cn("text-xs px-1.5 py-0", PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS])}>
                                            {PRIORITY_LABELS[item.priority as keyof typeof PRIORITY_LABELS]}
                                        </Badge>
                                    )}
                                </div>
                                {item.description && (
                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                                {!item.is_completed && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="h-7 px-3 text-xs rounded-full"
                                        onClick={() => handleConvertToExpedition(item.id)}
                                        disabled={convertToExpedition.isPending}
                                    >
                                        <Rocket className="w-3 h-3 mr-1" />
                                        Start
                                    </Button>
                                )}
                                {item.expedition_id && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-3 text-xs rounded-full"
                                        onClick={() => router.push(`/expedition/${item.expedition_id}`)}
                                    >
                                        View
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(item.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive h-7 w-7 rounded-full"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Item Dialog */}
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogContent className="sm:max-w-[500px] mx-4 rounded-2xl">
                    <div className="p-6 text-center border-b">
                        <div className="bg-primary p-3 rounded-xl w-fit mx-auto mb-3">
                            <BookOpen className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <DialogTitle className="text-xl font-bold">Add to Wishlist</DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-1">
                            Capture something you want to learn
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                What do you want to learn? *
                            </label>
                            <Input
                                placeholder="e.g., Machine Learning, Spanish, Cooking..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="rounded-lg"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Why? (optional)
                            </label>
                            <Textarea
                                placeholder="What specifically interests you about this?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="rounded-lg min-h-[60px] resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={priority.toString()} onValueChange={(v) => setPriority(parseInt(v))}>
                                    <SelectTrigger className="rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">High</SelectItem>
                                        <SelectItem value="2">Medium</SelectItem>
                                        <SelectItem value="3">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="rounded-lg">
                                        <SelectValue placeholder="Optional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-0 flex gap-2">
                        <Button variant="outline" onClick={() => setShowNewDialog(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!title.trim() || createItem.isPending}
                            className="flex-1"
                        >
                            {createItem.isPending ? "Adding..." : "Add to Wishlist"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}