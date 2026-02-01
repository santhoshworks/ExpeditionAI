import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
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

  const cookieStore = await cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    )
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required", redirect: `/signup?redirect=/resources/download?id=${resourceId}` },
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
      email: session.user.email,
      name: session.user.user_metadata?.full_name || session.user.email
    }
  })
}

export { RESOURCES }
