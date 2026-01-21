import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

export async function GET() {
    try {
        // Test environment variables
        const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY

        // Test Supabase connection
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        // Test OpenRouter connection (if key exists)
        let openRouterTest = null
        if (hasOpenRouterKey) {
            try {
                const openrouter = createOpenRouter({
                    apiKey: process.env.OPENROUTER_API_KEY!,
                })
                openRouterTest = "Available"
            } catch (error) {
                openRouterTest = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }

        return NextResponse.json({
            environment: {
                hasOpenRouterKey,
                openRouterTest,
                nodeEnv: process.env.NODE_ENV
            },
            auth: {
                hasUser: !!user,
                authError: authError?.message || null
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}