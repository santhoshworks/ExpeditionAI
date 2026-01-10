"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCw, Download, Eye, EyeOff } from "lucide-react"
import { useIllustrations } from "@/hooks/use-illustrations"

interface IllustrationMessageProps {
    trailId: string
    topic: string
    imageUrl?: string
    description?: string
    query?: string
    generatedAt?: string
    onRegenerate?: (newImageUrl: string, newDescription: string) => void
}

export function IllustrationMessage({
    trailId,
    topic,
    imageUrl,
    description,
    query,
    generatedAt,
    onRegenerate
}: IllustrationMessageProps) {
    const [showDetails, setShowDetails] = useState(false)
    const { regenerateIllustration, isRegenerating } = useIllustrations()

    const handleRegenerate = async () => {
        const result = await regenerateIllustration(trailId)
        if (result && onRegenerate) {
            onRegenerate(result.imageUrl, result.description)
        }
    }

    const handleDownload = () => {
        if (!imageUrl) return

        // Create download link for SVG
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `illustration-${topic.replace(/\s+/g, '-').toLowerCase()}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="flex w-full justify-start">
            <div className="max-w-[90%] md:max-w-[85%] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-b border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-sm text-blue-900 dark:text-blue-100">
                                Generated Illustration
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDetails(!showDetails)}
                                className="h-6 px-2 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                                {showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            {imageUrl && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDownload}
                                    className="h-6 px-2 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                                >
                                    <Download className="h-3 w-3" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRegenerate}
                                disabled={isRegenerating}
                                className="h-6 px-2 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                                {isRegenerating ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <RefreshCw className="h-3 w-3" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Topic: {topic}
                    </p>
                </div>

                {/* Image */}
                {imageUrl && (
                    <div className="p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                            <img
                                src={imageUrl}
                                alt={`Illustration: ${topic}`}
                                className="w-full max-w-md mx-auto rounded-lg"
                            />
                        </div>
                    </div>
                )}

                {/* Details */}
                {showDetails && (
                    <div className="px-4 pb-4 space-y-3">
                        {description && (
                            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3">
                                <h4 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    AI Description:
                                </h4>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        )}

                        {query && (
                            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3">
                                <h4 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    Generation Prompt:
                                </h4>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-mono">
                                    {query}
                                </p>
                            </div>
                        )}

                        {generatedAt && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                Generated: {new Date(generatedAt).toLocaleString()}
                            </div>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {!imageUrl && (
                    <div className="p-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                            <div className="flex gap-1">
                                <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span className="text-sm">Generating illustration...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}