import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Call the analytics summary function
    // Note: Type assertion needed until Supabase types are regenerated after migration
    const { data, error } = await (supabase.rpc as any)('get_user_analytics_summary', {
      p_user_id: user.id
    })

    if (error) {
      console.error("Analytics fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
