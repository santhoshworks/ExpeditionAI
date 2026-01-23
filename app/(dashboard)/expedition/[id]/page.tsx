"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useExpedition, useTrails, useUserCredits } from "@/lib/queries"
import { useExploreStore } from "@/lib/store"
import { getDisplayFlagType } from "@/lib/flag-migration"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ModelSelector } from "@/components/chat/model-selector"
import { ExploreButton } from "@/components/chat/explore-button"
import { MultiFlagButton } from "@/components/trail/multi-flag-button"
import { GenerateTopicsModal } from "@/components/trail/generate-topics-modal"
import { MobileTrailSelector } from "@/components/trail/mobile-trail-selector"
import { TrailTree } from "@/components/trail/trail-tree"
import { useTextSelection } from "@/hooks/use-text-selection"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Wand2, GitBranch, Compass, Zap, Brain } from "lucide-react"
import Link from "next/link"
import { QuizSelectionModal } from "@/components/quiz/quiz-selection-modal"
import { QuizInterface } from "@/components/quiz/quiz-interface"

export default function ExpeditionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const expeditionId = params.id as string
  const trailIdParam = searchParams.get("trailId")

  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [quizModalOpen, setQuizModalOpen] = useState(false)

  const {
    setCurrentExpedition,
    currentTrailId,
    setCurrentTrail,
    userTier,
    userCredits,
    quizState,
    setQuizMode,
    setSelectedQuestionCount,
  } = useExploreStore()
  const { data: expedition, isLoading: expeditionLoading } = useExpedition(expeditionId)
  const { data: trails, isLoading: trailsLoading } = useTrails(expeditionId)

  // Fetch and sync user credits
  useUserCredits()

  // Enable text selection for explore feature
  useTextSelection()

  useEffect(() => {
    if (expeditionId) {
      setCurrentExpedition(expeditionId)
    }
    return () => {
      setCurrentExpedition(null)
      setCurrentTrail(null)
    }
  }, [expeditionId, setCurrentExpedition, setCurrentTrail])

  // Sync trail ID from URL param if present
  useEffect(() => {
    if (trailIdParam) {
      setCurrentTrail(trailIdParam)
    }
  }, [trailIdParam, setCurrentTrail])

  // Set default trail to base camp if no trail is selected
  useEffect(() => {
    if (trails && trails.length > 0 && !currentTrailId && !trailIdParam) {
      const baseCamp = trails.find((t) => t.is_base_camp)
      if (baseCamp) {
        setCurrentTrail(baseCamp.id)
      } else {
        setCurrentTrail(trails[0].id)
      }
    }
  }, [trails, currentTrailId, setCurrentTrail, trailIdParam])

  const handleStartQuiz = (questionCount: number) => {
    setSelectedQuestionCount(questionCount)
    setQuizMode(true)
  }

  const handleExitQuiz = () => {
    setQuizMode(false)
  }

  if (expeditionLoading || trailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading expedition...</p>
      </div>
    )
  }

  if (!expedition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Expedition not found</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentTrail = trails?.find((t) => t.id === currentTrailId)

  return (
    <div className="h-full bg-slate-50/50 dark:bg-slate-950/20 flex flex-col overflow-hidden">
      {/* Main Content - Full width for better chat visibility */}
      <div className="flex-1 flex overflow-hidden">
        {/* Trail Navigation - Premium Glass Sidebar */}
        <aside className="hidden lg:flex w-60 border-r bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl flex-col transition-all duration-300">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-indigo-500" />
                Trails
              </h3>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-[10px] px-1.5 py-0">
                {trails?.length || 0}
              </Badge>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-1 py-3">
            <TrailTree
              trails={trails || []}
              currentTrailId={currentTrailId || undefined}
              onTrailSelect={setCurrentTrail}
            />
          </div>
          {/* Generate Topics Button */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Button
              className="w-full gap-2 h-10 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 font-bold text-xs shadow-lg shadow-slate-200 dark:shadow-none hover:scale-[1.01] active:scale-98 transition-all"
              onClick={() => setGenerateModalOpen(true)}
            >
              <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
              Generate Dives
            </Button>
          </div>
        </aside>

        {/* Main Chat Area - Maximized for better visibility */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Chat Header - Minimal design focused on current trail */}
          <div className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl px-4 py-2.5 flex-shrink-0 flex items-center justify-between gap-4 z-10">
            {/* Current Trail Info - Only show trail name, not expedition */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {currentTrail && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md shadow-indigo-100 dark:shadow-none">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{currentTrail.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Active</span>
                      <MultiFlagButton
                        trailId={currentTrail.id}
                        currentFlag={getDisplayFlagType(currentTrail)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden md:block scale-90 origin-right">
                <ModelSelector userTier={userTier} userCredits={userCredits} />
              </div>

              {/* Mobile trail selector */}
              <MobileTrailSelector
                trails={trails || []}
                currentTrailId={currentTrailId || undefined}
                onTrailSelect={setCurrentTrail}
                onGenerateTopics={() => setGenerateModalOpen(true)}
              />

              {/* Quick actions */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setQuizModalOpen(true)}
                  className="h-9 rounded-lg border-slate-200 dark:border-slate-800 font-bold text-xs gap-2 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                >
                  <Brain className="h-3.5 w-3.5 text-purple-500" />
                  Quiz Me
                </Button>
                <Link href={`/expedition/${expeditionId}/journal`}>
                  <Button variant="outline" className="h-9 rounded-lg border-slate-200 dark:border-slate-800 font-bold text-xs gap-2 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                    Journal
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Model Selector */}
          <div className="md:hidden border-b bg-white p-3 flex-shrink-0">
            <ModelSelector userTier={userTier} userCredits={userCredits} />
          </div>

          {currentTrailId ? (
            quizState.isQuizMode ? (
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/10">
                <QuizInterface
                  expeditionId={expeditionId}
                  onExit={handleExitQuiz}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/10">
                <ChatInterface
                  trailId={currentTrailId}
                  expeditionId={expeditionId}
                  trailTitle={currentTrail?.title}
                  trailSourceText={currentTrail?.source_text}
                  onOpenGenerateModal={() => setGenerateModalOpen(true)}
                />
                <ExploreButton
                  expeditionId={expeditionId}
                  parentTrailId={currentTrailId}
                />
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 p-12 bg-white/50">
              <div className="text-center space-y-6 max-w-sm">
                <div className="bg-indigo-50 p-6 rounded-[2.5rem] w-fit mx-auto">
                  <Zap className="w-10 h-10 text-indigo-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Select a Trail</h3>
                  <p className="font-medium text-slate-500">Pick a starting point or a branch to begin your deep dive into this topic.</p>
                </div>
                <MobileTrailSelector
                  trails={trails || []}
                  currentTrailId={currentTrailId || undefined}
                  onTrailSelect={setCurrentTrail}
                  onGenerateTopics={() => setGenerateModalOpen(true)}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Generate Topics Modal */}
      <GenerateTopicsModal
        open={generateModalOpen}
        onOpenChange={setGenerateModalOpen}
        expeditionId={expeditionId}
        expeditionTitle={expedition.title}
        trails={trails || []}
      />

      {/* Quiz Selection Modal */}
      <QuizSelectionModal
        open={quizModalOpen}
        onOpenChange={setQuizModalOpen}
        onStartQuiz={handleStartQuiz}
      />
    </div>
  )
}
