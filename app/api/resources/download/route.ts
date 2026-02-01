import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

const RESOURCES = {
  "note-taking-template": {
    title: "AI-Powered Note Taking Template",
    filename: "note-taking-template.pdf.html",
    description: "Cornell note-taking template with AI prompts"
  },
  "study-schedule-template": {
    title: "Weekly Study Schedule Template",
    filename: "study-schedule-template.pdf.html",
    description: "Comprehensive weekly study planner"
  },
  "exam-prep-checklist": {
    title: "Exam Preparation Checklist",
    filename: "exam-prep-checklist.pdf.html",
    description: "Complete exam preparation guide"
  }
} as const

export type ResourceId = keyof typeof RESOURCES

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const resourceId = searchParams.get("id") as ResourceId | null

  if (!resourceId || !RESOURCES[resourceId]) {
    return NextResponse.json(
      { error: "Invalid resource ID" },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", redirect: `/signup?redirect=${encodeURIComponent(`/resources/download?id=${resourceId}`)}` },
        { status: 401 }
      )
    }

    const resource = RESOURCES[resourceId]

    return NextResponse.json({
      success: true,
      resource: {
        id: resourceId,
        title: resource.title,
        description: resource.description,
        downloadUrl: `/resources/${resource.filename}`,
      },
      user: {
        email: user.email,
        name: user.user_metadata?.full_name || user.email
      }
    })
  } catch (error) {
    console.error("Download API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export { RESOURCES }
