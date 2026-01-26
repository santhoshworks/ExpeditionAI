/**
 * Script to check and fix the default tier configuration
 * This will verify the current database state and apply fixes if needed
 */

const { createClient } = require('@supabase/supabase-js')

async function checkAndFixDefaultTier() {
    console.log('🔍 Checking Default Tier Configuration')
    console.log('=====================================')
    console.log('')

    // You'll need to set these environment variables or replace with actual values
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'your_service_role_key_here') {
        console.log('❌ Missing Supabase credentials')
        console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
        console.log('')
        console.log('Manual fix instructions:')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Open SQL Editor')
        console.log('3. Run these queries:')
        console.log('')
        console.log("UPDATE system_config SET value = '\"pro\"' WHERE key = 'default_user_tier';")
        console.log("UPDATE system_config SET value = '{\"free\": 0, \"basic\": 200, \"pro\": 700}' WHERE key = 'default_tier_credits';")
        console.log('')
        console.log('4. Verify with:')
        console.log("SELECT key, value FROM system_config WHERE key IN ('default_user_tier', 'default_tier_credits');")
        return
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    try {
        // Check current configuration
        console.log('📋 Current Configuration:')
        const { data: currentConfig, error: configError } = await supabase
            .from('system_config')
            .select('key, value, updated_at')
            .in('key', ['default_user_tier', 'default_tier_credits'])

        if (configError) {
            console.error('❌ Error fetching config:', configError)
            return
        }

        if (!currentConfig || currentConfig.length === 0) {
            console.log('❌ No system config found. Creating initial config...')

            // Create the config
            const { error: insertError } = await supabase
                .from('system_config')
                .insert([
                    {
                        key: 'default_user_tier',
                        value: '"pro"',
                        description: 'Default tier assigned to new users (free, basic, pro)'
                    },
                    {
                        key: 'default_tier_credits',
                        value: '{"free": 0, "basic": 200, "pro": 700}',
                        description: 'Default credits given to new users by tier'
                    }
                ])

            if (insertError) {
                console.error('❌ Error creating config:', insertError)
                return
            }

            console.log('✅ Created initial pro tier configuration')
        } else {
            currentConfig.forEach(config => {
                console.log(`  ${config.key}: ${JSON.stringify(config.value)}`)
                console.log(`  Updated: ${config.updated_at}`)
                console.log('')
            })

            // Check if we need to update
            const tierConfig = currentConfig.find(c => c.key === 'default_user_tier')
            const creditsConfig = currentConfig.find(c => c.key === 'default_tier_credits')

            let needsUpdate = false

            if (!tierConfig || tierConfig.value !== 'pro') {
                console.log('⚠️  Default tier is not set to "pro"')
                needsUpdate = true
            }

            if (!creditsConfig || !creditsConfig.value.pro || creditsConfig.value.pro < 700) {
                console.log('⚠️  Pro tier credits are not set to 700')
                needsUpdate = true
            }

            if (needsUpdate) {
                console.log('')
                console.log('🔧 Applying fixes...')

                // Update default tier
                const { error: tierError } = await supabase
                    .from('system_config')
                    .update({ value: '"pro"', updated_at: new Date().toISOString() })
                    .eq('key', 'default_user_tier')

                if (tierError) {
                    console.error('❌ Error updating tier:', tierError)
                } else {
                    console.log('✅ Updated default tier to "pro"')
                }

                // Update default credits
                const { error: creditsError } = await supabase
                    .from('system_config')
                    .update({
                        value: '{"free": 0, "basic": 200, "pro": 700}',
                        updated_at: new Date().toISOString()
                    })
                    .eq('key', 'default_tier_credits')

                if (creditsError) {
                    console.error('❌ Error updating credits:', creditsError)
                } else {
                    console.log('✅ Updated pro tier credits to 700')
                }
            } else {
                console.log('✅ Configuration is already correct!')
            }
        }

        // Test the trigger function
        console.log('')
        console.log('🧪 Testing trigger function...')

        const { data: testResult, error: testError } = await supabase
            .rpc('get_system_config', { config_key: 'default_user_tier' })

        if (testError) {
            console.error('❌ Error testing function:', testError)
        } else {
            console.log(`✅ Function returns: ${JSON.stringify(testResult)}`)
        }

        // Check recent users
        console.log('')
        console.log('👥 Recent Users (last 5):')
        const { data: recentUsers, error: usersError } = await supabase
            .from('user_credits')
            .select('user_id, tier, credits, created_at')
            .order('created_at', { ascending: false })
            .limit(5)

        if (usersError) {
            console.error('❌ Error fetching users:', usersError)
        } else {
            recentUsers.forEach(user => {
                console.log(`  ${user.user_id.slice(0, 8)}: ${user.tier} tier, ${user.credits} credits`)
            })
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error)
    }

    console.log('')
    console.log('🎯 Next Steps:')
    console.log('1. Create a new test user account')
    console.log('2. Check if they get "pro" tier with 700 credits')
    console.log('3. If still getting "free" tier, check server logs for trigger errors')
}

checkAndFixDefaultTier().catch(console.error)