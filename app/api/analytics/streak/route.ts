import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET current streak info
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_learning_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is ok
      console.error("Streak fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 })
    }

    return NextResponse.json(data || {
      current_streak: 0,
      longest_streak: 0,
      total_active_days: 0,
      last_activity_date: null,
      streak_start_date: null
    })
  } catch (error) {
    console.error("Streak API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST to manually trigger streak update (called after chat messages)
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Note: Type assertion needed until Supabase types are regenerated after migration
    const { data, error } = await (supabase.rpc as any)('update_learning_streak', {
      p_user_id: user.id
    })

    if (error) {
      console.error("Streak update error:", error)
      return NextResponse.json({ error: "Failed to update streak" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Streak update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
