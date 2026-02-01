"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicHeader } from "@/components/layout/public-header"
import { Download, FileText, CheckCircle, ArrowRight, Printer, Loader2 } from "lucide-react"

interface ResourceData {
  id: string
  title: string
  description: string
  downloadUrl: string
}

interface DownloadResponse {
  success: boolean
  resource: ResourceData
  user: {
    email: string
    name: string
  }
  error?: string
  redirect?: string
}

export default function DownloadPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const resourceId = searchParams.get("id")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DownloadResponse | null>(null)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    async function fetchResource() {
      if (!resourceId) {
        setError("No resource specified")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/resources/download?id=${resourceId}`)
        const result = await response.json()

        if (!response.ok) {
          if (response.status === 401 && result.redirect) {
            router.push(result.redirect)
            return
          }
          setError(result.error || "Failed to load resource")
          setLoading(false)
          return
        }

        setData(result)
        setLoading(false)
      } catch (err) {
        setError("An error occurred while loading the resource")
        setLoading(false)
      }
    }

    fetchResource()
  }, [resourceId, router])

  const handleDownload = () => {
    if (data?.resource.downloadUrl) {
      window.open(data.resource.downloadUrl, "_blank")
      setDownloaded(true)
    }
  }

  const handlePrint = () => {
    if (data?.resource.downloadUrl) {
      const printWindow = window.open(data.resource.downloadUrl, "_blank")
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your resource...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicHeader currentPage="resources" />
        <main className="container mx-auto px-6 py-20 pt-32">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/resources">Back to Resources</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-white to-slate-50" />

      <PublicHeader currentPage="resources" />

      <main className="container mx-auto px-6 py-20 pt-32">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Your Resource is Ready!</CardTitle>
              <CardDescription className="text-base">
                Hi {data.user.name}, your download is ready.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resource Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{data.resource.title}</h3>
                    <p className="text-sm text-slate-600">{data.resource.description}</p>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-12"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-5 w-5" />
                  {downloaded ? "Download Again" : "Download Template"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12"
                  onClick={handlePrint}
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Print Directly
                </Button>
              </div>

              {downloaded && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 text-sm">
                    Your download should have started. If not, click the download button again.
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-semibold mb-3">How to use this template:</h4>
                <ol className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <span>Open the downloaded file in your browser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <span>Press Ctrl+P (or Cmd+P on Mac) to print or save as PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <span>For digital use, import the PDF into your note-taking app</span>
                  </li>
                </ol>
              </div>

              {/* CTA */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">Want AI-powered learning?</h4>
                <p className="text-sm text-indigo-700 mb-3">
                  ThoughtMap helps you understand any topic with personalized AI tutoring.
                </p>
                <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* More Resources */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-4">Looking for more resources?</p>
            <div className="flex flex-wrap justify-center gap-3">
              {data.resource.id !== "note-taking-template" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/resources/note-taking-template">Note Taking Template</Link>
                </Button>
              )}
              {data.resource.id !== "study-schedule-template" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/resources/study-schedule-template">Study Schedule</Link>
                </Button>
              )}
              {data.resource.id !== "exam-prep-checklist" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/resources/exam-prep-checklist">Exam Checklist</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 ThoughtMap. Designed for the curious.</p>
        </div>
      </footer>
    </div>
  )
}
