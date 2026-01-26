import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"

/**
 * Create a Supabase client with admin privileges (service role key)
 * This client can perform admin operations like deleting users
 */
export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase admin credentials')
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}