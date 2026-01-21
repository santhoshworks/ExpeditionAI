"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Sparkles, ArrowRight } from "lucide-react"

interface YouTubeToExpeditionProps {
    onSuccess?: (expeditionId: string) => void
}

export function YouTubeToExpedition({ onSuccess }: YouTubeToExpeditionProps) {
    const [youtubeUrl, setYoutubeUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const isValidYouTubeUrl = (url: string) => {
        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
        ]
        return patterns.some(pattern => pattern.test(url))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!youtubeUrl.trim()) {
            toast.error("Please enter a YouTube URL")
            return
        }

        if (!isValidYouTubeUrl(youtubeUrl)) {
            toast.error("Please enter a valid YouTube URL")
            return
        }

        setLoading(true)

        try {
            console.log('Submitting YouTube URL:', youtubeUrl)

            const response = await fetch('/api/youtube-to-expedition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ youtubeUrl }),
            })

            console.log('Response status:', response.status)

            const data = await response.json()
            console.log('Response data:', data)

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create expedition')
            }

            toast.success(`Created expedition with ${data.trails} trails!`)

            if (onSuccess) {
                onSuccess(data.expedition.id)
            } else {
                router.push(`/expedition/${data.expedition.id}`)
            }

        } catch (error) {
            console.error('Error creating expedition:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create expedition')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                    <label htmlFor="youtube-url" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                        YouTube Video URL
                    </label>
                    <Input
                        id="youtube-url"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        disabled={loading}
                        className="rounded-2xl h-14 px-6 text-base border-slate-200 dark:border-slate-800 focus:ring-red-500/20 focus:border-red-500 font-medium"
                    />
                    <p className="text-xs text-muted-foreground ml-2">
                        Paste any YouTube video URL with captions enabled
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 space-y-4 border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                        <Sparkles className="h-4 w-4 text-red-500" />
                        What happens next?
                    </h4>
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-red-600">1</span>
                            </div>
                            <span>AI analyzes the video transcript and content</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-red-600">2</span>
                            </div>
                            <span>Creates multiple learning trails for different topics</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-red-600">3</span>
                            </div>
                            <span>Generates suggested questions and exploration paths</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-red-600">4</span>
                            </div>
                            <span>You can dive deeper into any concept that interests you</span>
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading || !youtubeUrl.trim() || !isValidYouTubeUrl(youtubeUrl)}
                    className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-base shadow-xl shadow-red-100 dark:shadow-none transition-all active:scale-95"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Creating Your Expedition...
                        </>
                    ) : (
                        <>
                            Create Learning Expedition
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                    )}
                </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                        Try these popular educational videos:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {[
                            { label: "Quantum Physics", url: "https://www.youtube.com/watch?v=p7bzE1E5DUY" },
                            { label: "History of AI", url: "https://www.youtube.com/watch?v=ad79nYk2keg" },
                            { label: "Climate Science", url: "https://www.youtube.com/watch?v=dcBXmj1nMTQ" }
                        ].map((example) => (
                            <Button
                                key={example.label}
                                variant="outline"
                                size="sm"
                                className="text-xs rounded-xl border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                onClick={() => setYoutubeUrl(example.url)}
                                disabled={loading}
                            >
                                {example.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}