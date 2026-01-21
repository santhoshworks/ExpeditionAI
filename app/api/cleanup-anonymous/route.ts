import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * API route to trigger cleanup of old anonymous expeditions
 * This should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
 * 
 * Usage: POST /api/cleanup-anonymous
 * Headers: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: Request) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = req.headers.get("authorization")
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret) {
            console.warn("CRON_SECRET not configured - skipping auth check")
        } else if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const supabase = await createClient()

        // Call the cleanup function
        const { data, error } = await supabase.rpc("schedule_anonymous_cleanup")

        if (error) {
            console.error("Cleanup error:", error)
            return NextResponse.json(
                { error: "Cleanup failed", details: error.message },
                { status: 500 }
            )
        }

        console.log("Anonymous expeditions cleanup completed:", data)

        return NextResponse.json({
            success: true,
            result: data,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error("Cleanup API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// Allow GET for health check
export async function GET() {
    return NextResponse.json({
        status: "ready",
        endpoint: "cleanup-anonymous",
        description: "Cleans up anonymous expeditions older than 30 days"
    })
}
