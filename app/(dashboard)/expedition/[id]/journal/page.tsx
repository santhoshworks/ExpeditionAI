"use client"

import { useParams } from "next/navigation"
import { useExpedition } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function JournalPage() {
  const params = useParams()
  const expeditionId = params.id as string
  const { data: expedition, isLoading } = useExpedition(expeditionId)

  // TODO: Implement journal fetching and generation
  const journal = null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading journal...</p>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={`/expedition/${expeditionId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{expedition.title}</h1>
              <p className="text-sm text-muted-foreground">Learning Journal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {journal ? (
          <Card>
            <CardHeader>
              <CardTitle>Learning Journal</CardTitle>
              <CardDescription>
                Summary of your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {journal}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No journal yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate a summary of your learning journey
              </p>
              <Button disabled>
                Generate Journal (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
