"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Users, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Challenge {
    id: string
    expedition_id: string
    challenger_name: string
    score: number
    total_questions: number
    percentage: number
    created_at: string
    expedition: {
        id: string
        title: string
        public_slug: string | null
        is_public: boolean
    }
}

export default function ChallengePage() {
    const params = useParams()
    const challengeId = params.id as string
    const [challenge, setChallenge] = useState<Challenge | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchChallenge() {
            const supabase = createClient()

            try {
                const { data, error } = await supabase
                    .from('quiz_challenges')
                    .select(`
            *,
            expedition:expeditions(id, title, public_slug, is_public)
          `)
                    .eq('id', challengeId)
                    .single()

                if (error) throw error

                setChallenge(data as Challenge)
            } catch (error) {
                console.error('Error fetching challenge:', error)
            } finally {
                setLoading(false)
            }
        }

        if (challengeId) {
            fetchChallenge()
        }
    }, [challengeId])

    const getScoreEmoji = (percentage: number) => {
        if (percentage >= 90) return "🏆"
        if (percentage >= 80) return "🥇"
        if (percentage >= 70) return "🥈"
        if (percentage >= 60) return "🥉"
        return "📚"
    }

    const getScoreColor = (percentage: number) => {
        if (percentage >= 90) return "text-yellow-600 bg-yellow-50 border-yellow-200"
        if (percentage >= 80) return "text-green-600 bg-green-50 border-green-200"
        if (percentage >= 70) return "text-blue-600 bg-blue-50 border-blue-200"
        if (percentage >= 60) return "text-purple-600 bg-purple-50 border-purple-200"
        return "text-slate-600 bg-slate-50 border-slate-200"
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <p className="text-muted-foreground">Loading challenge...</p>
            </div>
        )
    }

    if (!challenge) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Challenge Not Found</h1>
                    <p className="text-muted-foreground">This challenge may have expired or doesn't exist.</p>
                    <Link href="/">
                        <Button>Explore ExpeditionAI</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const expeditionUrl = challenge.expedition.public_slug
        ? `/explore/${challenge.expedition.public_slug}`
        : `/expedition/${challenge.expedition.id}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold text-indigo-600">
                            ExpeditionAI
                        </Link>
                        <Link href="/signup">
                            <Button className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Start Learning
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12 max-w-2xl">
                {/* Challenge Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">{getScoreEmoji(challenge.percentage)}</div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Learning Challenge
                    </h1>
                    <p className="text-lg text-slate-600">
                        {challenge.challenger_name} has challenged you to beat their score!
                    </p>
                </div>

                {/* Challenge Details */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Challenge Details
                        </CardTitle>
                        <CardDescription>
                            Test your knowledge on "{challenge.expedition.title}"
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Score to Beat */}
                        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                            <div className="text-sm font-medium text-slate-600 mb-2">Score to Beat</div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">
                                {challenge.score}/{challenge.total_questions}
                            </div>
                            <Badge className={`text-lg font-semibold px-4 py-1 ${getScoreColor(challenge.percentage)}`}>
                                {challenge.percentage}% Correct
                            </Badge>
                        </div>

                        {/* Challenge Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <div className="text-sm font-medium text-slate-600 mb-1">Challenger</div>
                                <div className="font-bold text-slate-900">{challenge.challenger_name}</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <div className="text-sm font-medium text-slate-600 mb-1">Questions</div>
                                <div className="font-bold text-slate-900">{challenge.total_questions}</div>
                            </div>
                        </div>

                        {/* Expedition Link */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <h4 className="font-medium text-blue-900 mb-2">About this Topic</h4>
                            <p className="text-sm text-blue-800 mb-3">
                                This challenge is based on the learning expedition: "{challenge.expedition.title}"
                            </p>
                            <Link href={expeditionUrl}>
                                <Button variant="outline" className="w-full text-blue-600 border-blue-300 hover:bg-blue-100">
                                    <Target className="h-4 w-4 mr-2" />
                                    Explore the Full Expedition
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Call to Action */}
                <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                            <Users className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Ready to Take the Challenge?</h2>
                        <p className="text-indigo-100 mb-6">
                            Create your own learning expedition, explore this topic, and then take the quiz to see if you can beat {challenge.challenger_name}'s score of {challenge.percentage}%!
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                                    Start Learning Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href={expeditionUrl}>
                                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white/10">
                                    View Expedition
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* How it Works */}
                <div className="mt-12 text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">How Learning Challenges Work</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mx-auto">1</div>
                            <p className="font-medium text-slate-900">Explore the Topic</p>
                            <p className="text-slate-600">Learn about the subject through interactive AI conversations</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mx-auto">2</div>
                            <p className="font-medium text-slate-900">Take the Quiz</p>
                            <p className="text-slate-600">Test your knowledge with AI-generated questions</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mx-auto">3</div>
                            <p className="font-medium text-slate-900">Challenge Others</p>
                            <p className="text-slate-600">Share your score and see who can beat it</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}