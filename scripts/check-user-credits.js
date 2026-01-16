/**
 * Diagnostic script to check user_credits table
 * Run with: node scripts/check-user-credits.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
        const key = match[1].trim()
        const value = match[2].trim()
        envVars[key] = value
    }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserCredits() {
    console.log('🔍 Checking user_credits table...\n')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('❌ Not authenticated. Please log in first.')
        console.error('Error:', authError?.message)
        return
    }

    console.log('✅ Authenticated as:', user.email)
    console.log('User ID:', user.id)
    console.log('')

    // Check if user_credits table exists and has data
    const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('❌ Error fetching user_credits:')
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.log('')

        if (error.code === 'PGRST116') {
            console.log('💡 This means no user_credits row exists for your user.')
            console.log('💡 The row should be created automatically on signup.')
            console.log('💡 Let\'s try to create it manually...\n')

            // Try to create the row
            const { data: insertData, error: insertError } = await supabase
                .from('user_credits')
                .insert({
                    user_id: user.id,
                    credits: 0,
                    tier: 'free',
                    trails_today: 0,
                    last_trail_date: null
                })
                .select()
                .single()

            if (insertError) {
                console.error('❌ Failed to create user_credits row:')
                console.error('Error:', insertError.message)
                console.log('\n💡 You may need to run the migration manually.')
            } else {
                console.log('✅ Successfully created user_credits row!')
                console.log('Data:', insertData)
            }
        }
        return
    }

    console.log('✅ User credits found!')
    console.log('Credits:', data.credits)
    console.log('Tier:', data.tier)
    console.log('Trails today:', data.trails_today)
    console.log('Last trail date:', data.last_trail_date)
    console.log('Created at:', data.created_at)
    console.log('Updated at:', data.updated_at)
}

checkUserCredits()
    .then(() => {
        console.log('\n✅ Check complete!')
        process.exit(0)
    })
    .catch((err) => {
        console.error('\n❌ Unexpected error:', err)
        process.exit(1)
    })
