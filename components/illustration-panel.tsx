'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Image, RefreshCw, Sparkles } from 'lucide-react'
import { useIllustrations, type IllustrationData } from '@/hooks/use-illustrations'
import { toast } from 'sonner'

interface IllustrationPanelProps {
    trailId: string
    trailTitle: string
    defaultTopic?: string
}

export function IllustrationPanel({
    trailId,
    trailTitle,
    defaultTopic = ''
}: IllustrationPanelProps) {
    const [topic, setTopic] = useState(defaultTopic)
    const [currentImage, setCurrentImage] = useState<string | null>(null)
    const [currentDescription, setCurrentDescription] = useState<string | null>(null)
    const [illustration, setIllustration] = useState<IllustrationData | null>(null)

    const {
        generateIllustration,
        regenerateIllustration,
        getIllustration,
        isGenerating,
        isRegenerating,
        error,
    } = useIllustrations()

    // Load existing illustration on mount
    useEffect(() => {
        const loadExistingIllustration = async () => {
            const existing = await getIllustration(trailId)
            if (existing) {
                setIllustration(existing)
                // Set topic from existing query if no default provided
                if (!defaultTopic && existing.query) {
                    const topicMatch = existing.query.match(/representing: (.+?)\./);
                    if (topicMatch) {
                        setTopic(topicMatch[1])
                    }
                }
            }
        }

        loadExistingIllustration()
    }, [trailId, defaultTopic, getIllustration])

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Please enter a topic for the illustration')
            return
        }

        const result = await generateIllustration(trailId, topic.trim())

        if (result) {
            setCurrentImage(result.imageUrl)
            setCurrentDescription(result.description)
            setIllustration({
                id: trailId, // Temporary ID
                query: result.query,
                generatedAt: new Date().toISOString(),
                trailTitle,
            })
            toast.success(`Illustration generated! Used ${result.creditsUsed} credits`)
        } else if (error) {
            toast.error(error)
        }
    }

    const handleRegenerate = async () => {
        if (!illustration) {
            toast.error('No existing illustration to regenerate')
            return
        }

        const result = await regenerateIllustration(trailId)

        if (result) {
            setCurrentImage(result.imageUrl)
            setCurrentDescription(result.description)
            setIllustration({
                ...illustration,
                generatedAt: new Date().toISOString(),
            })
            toast.success(`Illustration regenerated! Used ${result.creditsUsed} credits`)
        } else if (error) {
            toast.error(error)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Trail Illustration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Topic Input */}
                <div className="space-y-2">
                    <Label htmlFor="topic">Illustration Topic</Label>
                    <Input
                        id="topic"
                        placeholder="Describe what you'd like to illustrate..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={isGenerating || isRegenerating}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || isRegenerating || !topic.trim()}
                        className="flex-1"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Image className="mr-2 h-4 w-4" />
                                Generate (2 credits)
                            </>
                        )}
                    </Button>

                    {illustration && (
                        <Button
                            variant="outline"
                            onClick={handleRegenerate}
                            disabled={isGenerating || isRegenerating}
                        >
                            {isRegenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Regenerating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Regenerate
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Generated Image Display */}
                {currentImage && (
                    <div className="space-y-2">
                        <Label>Generated Illustration</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <img
                                src={currentImage}
                                alt="Generated illustration"
                                className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                            />
                        </div>
                        {currentDescription && (
                            <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                <strong>AI Description:</strong> {currentDescription}
                            </div>
                        )}
                    </div>
                )}

                {/* Illustration Info */}
                {illustration && (
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Query:</strong> {illustration.query}</p>
                        <p><strong>Generated:</strong> {new Date(illustration.generatedAt).toLocaleString()}</p>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        {error}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}