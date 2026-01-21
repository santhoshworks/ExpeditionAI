"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Share2, Copy, Trophy, Target, Users, Zap } from "lucide-react"

interface QuizChallengeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    expeditionId: string
    expeditionTitle: string
    score: number
    totalQuestions: number
}

export function QuizChallengeModal({
    open,
    onOpenChange,
    expeditionId,
    expeditionTitle,
    score,
    totalQuestions
}: QuizChallengeModalProps) {
    const [challengerName, setChallengerName] = useState("")
    const [loading, setLoading] = useState(false)
    const [challengeUrl, setChallengeUrl] = useState("")
    const [challengeCreated, setChallengeCreated] = useState(false)

    const percentage = Math.round((score / totalQuestions) * 100)

    const handleCreateChallenge = async () => {
        setLoading(true)

        try {
            const response = await fetch('/api/quiz-challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    expeditionId,
                    score,
                    totalQuestions,
                    challengerName: challengerName.trim() || 'Anonymous Explorer'
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create challenge')
            }

            setChallengeUrl(data.challengeUrl)
            setChallengeCreated(true)
            toast.success("Challenge created! Share the link with friends.")

        } catch (error) {
            console.error('Error creating challenge:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create challenge')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success("Link copied to clipboard!")
        } catch (error) {
            toast.error("Failed to copy link")
        }
    }

    const getScoreEmoji = () => {
        if (percentage >= 90) return "🏆"
        if (percentage >= 80) return "🥇"
        if (percentage >= 70) return "🥈"
        if (percentage >= 60) return "🥉"
        return "📚"
    }

    const getScoreMessage = () => {
        if (percentage >= 90) return "Outstanding! You're a true expert!"
        if (percentage >= 80) return "Excellent work! You really know your stuff!"
        if (percentage >= 70) return "Great job! You've got a solid understanding!"
        if (percentage >= 60) return "Good effort! Keep exploring to learn more!"
        return "Nice try! There's always more to discover!"
    }

    const handleClose = () => {
        onOpenChange(false)
        // Reset state after modal closes
        setTimeout(() => {
            setChallengeCreated(false)
            setChallengeUrl("")
            setChallengerName("")
        }, 300)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-white">
                            <Trophy className="h-6 w-6" />
                            Challenge Friends
                        </DialogTitle>
                        <DialogDescription className="text-yellow-100">
                            Share your quiz results and challenge others to beat your score!
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    {/* Score Display */}
                    <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                        <div className="text-5xl mb-3">{getScoreEmoji()}</div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                            {score}/{totalQuestions}
                        </div>
                        <div className="text-xl font-semibold text-indigo-600 mb-2">
                            {percentage}% Correct
                        </div>
                        <p className="text-sm text-slate-600 font-medium">
                            {getScoreMessage()}
                        </p>
                    </div>

                    {!challengeCreated ? (
                        <>
                            {/* Challenger Name */}
                            <div className="space-y-3">
                                <label htmlFor="challenger-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                    Your Name (Optional)
                                </label>
                                <Input
                                    id="challenger-name"
                                    placeholder="Enter your name for the challenge..."
                                    value={challengerName}
                                    onChange={(e) => setChallengerName(e.target.value)}
                                    disabled={loading}
                                    className="rounded-xl h-12 px-4 border-slate-200 dark:border-slate-800"
                                />
                                <p className="text-xs text-muted-foreground ml-2">
                                    This will be shown to people who take your challenge
                                </p>
                            </div>

                            {/* Challenge Preview */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                                    <Target className="h-4 w-4 text-orange-500" />
                                    Challenge Preview
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    "{challengerName.trim() || 'Someone'} scored {percentage}% on the {expeditionTitle} quiz. Can you beat their score?"
                                </p>
                            </div>

                            {/* Create Button */}
                            <Button
                                onClick={handleCreateChallenge}
                                disabled={loading}
                                className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-xl shadow-orange-100 dark:shadow-none transition-all active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <Zap className="h-5 w-5 mr-2 animate-pulse" />
                                        Creating Challenge...
                                    </>
                                ) : (
                                    <>
                                        <Users className="h-5 w-5 mr-2" />
                                        Create Challenge Link
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Challenge Created */}
                            <div className="space-y-4">
                                <div className="text-center p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                                    <div className="text-green-600 dark:text-green-400 font-bold text-lg mb-2">Challenge Created! 🎉</div>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Share this link with friends and see if they can beat your {percentage}% score!
                                    </p>
                                </div>

                                {/* Challenge URL */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                        Challenge Link
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={challengeUrl}
                                            readOnly
                                            className="font-mono text-sm rounded-xl h-12 border-slate-200 dark:border-slate-800"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard(challengeUrl)}
                                            className="h-12 w-12 rounded-xl"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Social Share Buttons */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                        Share Challenge
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const text = `I scored ${percentage}% on the "${expeditionTitle}" quiz! Can you beat my score? ${challengeUrl}`
                                                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
                                                window.open(twitterUrl, '_blank')
                                            }}
                                            className="h-11 rounded-xl text-sm font-bold"
                                        >
                                            Share on X
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => copyToClipboard(challengeUrl)}
                                            className="h-11 rounded-xl text-sm font-bold"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Link
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        className="w-full h-10 text-slate-500"
                    >
                        {challengeCreated ? "Done" : "Cancel"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}