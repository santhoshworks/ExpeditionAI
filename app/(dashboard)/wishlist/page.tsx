"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Trash2, Star, Clock } from "lucide-react"

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState([
        {
            id: 1,
            title: "Advanced React Patterns",
            description: "Learn about render props, compound components, and advanced hooks",
            priority: "high",
            addedAt: "2024-01-10"
        },
        {
            id: 2,
            title: "Machine Learning Fundamentals",
            description: "Understanding neural networks and deep learning concepts",
            priority: "medium",
            addedAt: "2024-01-08"
        }
    ])
    const [newItem, setNewItem] = useState("")
    const [newDescription, setNewDescription] = useState("")

    const addItem = () => {
        if (!newItem.trim()) return

        const item = {
            id: Date.now(),
            title: newItem,
            description: newDescription,
            priority: "medium",
            addedAt: new Date().toISOString().split('T')[0]
        }

        setWishlistItems([item, ...wishlistItems])
        setNewItem("")
        setNewDescription("")
    }

    const removeItem = (id: number) => {
        setWishlistItems(wishlistItems.filter(item => item.id !== id))
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }
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
                    <Button onClick={addItem} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Wishlist
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
                                                {item.priority}
                                            </Badge>
                                        </div>
                                        {item.description && (
                                            <p className="text-muted-foreground mb-3">{item.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Added {item.addedAt}
                                            </div>
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
                                        >
                                            <Trash2 className="w-4 h-4" />
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