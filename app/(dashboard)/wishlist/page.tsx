"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Trash2, Star, Clock, Loader2 } from "lucide-react"
import { useLearningWishlist, useCreateWishlistItem, useDeleteWishlistItem } from "@/lib/queries"
import { toast } from "sonner"

export default function WishlistPage() {
    const { data: wishlistItems = [], isLoading } = useLearningWishlist()
    const createWishlistItem = useCreateWishlistItem()
    const deleteWishlistItem = useDeleteWishlistItem()
    const [newItem, setNewItem] = useState("")
    const [newDescription, setNewDescription] = useState("")

    const addItem = async () => {
        if (!newItem.trim()) return

        try {
            await createWishlistItem.mutateAsync({
                title: newItem,
                description: newDescription || undefined,
                priority: 3, // Medium priority
            })

            setNewItem("")
            setNewDescription("")
            toast.success("Added to wishlist", {
                description: `"${newItem}" has been added to your learning wishlist.`,
            })
        } catch (error) {
            console.error("Failed to add item:", error)
            toast.error("Failed to add item to wishlist", {
                description: "Please try again.",
            })
        }
    }

    const removeItem = async (id: string) => {
        try {
            await deleteWishlistItem.mutateAsync(id)
            toast.success("Removed from wishlist", {
                description: "Item has been removed from your wishlist.",
            })
        } catch (error) {
            console.error("Failed to remove item:", error)
            toast.error("Failed to remove item", {
                description: "Please try again.",
            })
        }
    }

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            case 2: return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            case 3: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case 4: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            case 5: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }
    }

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 1: return "Urgent"
            case 2: return "High"
            case 3: return "Medium"
            case 4: return "Low"
            case 5: return "Someday"
            default: return "Medium"
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Learning Wishlist</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Keep track of topics you want to explore and turn them into expeditions when you&apos;re ready.
                    </p>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-2/3 mb-3"></div>
                                    <div className="h-3 bg-muted rounded w-1/4"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Learning Wishlist</h1>
                </div>
                <p className="text-muted-foreground">
                    Keep track of topics you want to explore and turn them into expeditions when you&apos;re ready.
                </p>
            </div>

            {/* Add new item */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Add New Learning Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="What do you want to learn?"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    />
                    <Input
                        placeholder="Brief description (optional)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    />
                    <Button onClick={addItem} className="w-full sm:w-auto" disabled={createWishlistItem.isPending}>
                        {createWishlistItem.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        {createWishlistItem.isPending ? "Adding..." : "Add to Wishlist"}
                    </Button>
                </CardContent>
            </Card>

            {/* Wishlist items */}
            <div className="space-y-4">
                {wishlistItems.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                            <p className="text-muted-foreground">
                                Add topics you want to learn about and turn them into expeditions later.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    wishlistItems.map((item) => (
                        <Card key={item.id} className="group hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold truncate">{item.title}</h3>
                                            <Badge className={getPriorityColor(item.priority)}>
                                                {getPriorityLabel(item.priority)}
                                            </Badge>
                                        </div>
                                        {item.description && (
                                            <p className="text-muted-foreground mb-3">{item.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Added {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                            {item.category && (
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" />
                                                    {item.category}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // TODO: Create expedition from wishlist item
                                                console.log("Create expedition:", item.title)
                                            }}
                                        >
                                            <Star className="w-4 h-4 mr-1" />
                                            Start Expedition
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                            disabled={deleteWishlistItem.isPending}
                                        >
                                            {deleteWishlistItem.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}