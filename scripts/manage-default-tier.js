#!/usr/bin/env node

/**
 * Script to manage default tier configuration
 * Usage:
 *   node scripts/manage-default-tier.js get
 *   node scripts/manage-default-tier.js set pro
 *   node scripts/manage-default-tier.js set-credits free 0 basic 50 pro 150
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getCurrentConfig() {
    try {
        const { data: configs, error } = await supabase
            .from('system_config')
            .select('key, value, description')
            .in('key', ['default_user_tier', 'default_tier_credits'])

        if (error) {
            throw error
        }

        const configMap = configs.reduce((acc, config) => {
            acc[config.key] = {
                value: config.value,
                description: config.description
            }
            return acc
        }, {})

        return {
            defaultTier: configMap.default_user_tier?.value || 'free',
            defaultCredits: configMap.default_tier_credits?.value || { free: 0, basic: 50, pro: 150 }
        }
    } catch (error) {
        console.error('❌ Error fetching configuration:', error.message)
        return null
    }
}

async function setDefaultTier(tier) {
    if (!['free', 'basic', 'pro'].includes(tier)) {
        console.error('❌ Invalid tier. Must be one of: free, basic, pro')
        return false
    }

    try {
        const { error } = await supabase
            .from('system_config')
            .upsert({
                key: 'default_user_tier',
                value: JSON.stringify(tier),
                description: 'Default tier assigned to new users (free, basic, pro)',
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' })

        if (error) {
            throw error
        }

        console.log(`✅ Default tier set to: ${tier}`)
        return true
    } catch (error) {
        console.error('❌ Error setting default tier:', error.message)
        return false
    }
}

async function setDefaultCredits(creditsConfig) {
    try {
        const { error } = await supabase
            .from('system_config')
            .upsert({
                key: 'default_tier_credits',
                value: JSON.stringify(creditsConfig),
                description: 'Default credits given to new users by tier',
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' })

        if (error) {
            throw error
        }

        console.log('✅ Default credits configuration updated:')
        Object.entries(creditsConfig).forEach(([tier, credits]) => {
            console.log(`   ${tier}: ${credits} credits`)
        })
        return true
    } catch (error) {
        console.error('❌ Error setting default credits:', error.message)
        return false
    }
}

async function main() {
    const command = process.argv[2]

    switch (command) {
        case 'get':
            console.log('📋 Current Default Tier Configuration:')
            const config = await getCurrentConfig()
            if (config) {
                console.log(`   Default Tier: ${config.defaultTier}`)
                console.log('   Default Credits:')
                Object.entries(config.defaultCredits).forEach(([tier, credits]) => {
                    console.log(`     ${tier}: ${credits} credits`)
                })
            }
            break

        case 'set':
            const tier = process.argv[3]
            if (!tier) {
                console.error('❌ Please specify a tier: free, basic, or pro')
                console.error('Usage: node scripts/manage-default-tier.js set <tier>')
                process.exit(1)
            }
            await setDefaultTier(tier)
            break

        case 'set-credits':
            const args = process.argv.slice(3)
            if (args.length !== 6) {
                console.error('❌ Please specify credits for all tiers')
                console.error('Usage: node scripts/manage-default-tier.js set-credits free <credits> basic <credits> pro <credits>')
                console.error('Example: node scripts/manage-default-tier.js set-credits free 0 basic 50 pro 150')
                process.exit(1)
            }

            const creditsConfig = {
                [args[0]]: parseInt(args[1]),
                [args[2]]: parseInt(args[3]),
                [args[4]]: parseInt(args[5])
            }

            // Validate
            for (const [tier, credits] of Object.entries(creditsConfig)) {
                if (!['free', 'basic', 'pro'].includes(tier)) {
                    console.error(`❌ Invalid tier: ${tier}`)
                    process.exit(1)
                }
                if (isNaN(credits) || credits < 0) {
                    console.error(`❌ Invalid credits for ${tier}: ${credits}`)
                    process.exit(1)
                }
            }

            await setDefaultCredits(creditsConfig)
            break

        default:
            console.log('🔧 Default Tier Management Script')
            console.log('')
            console.log('Usage:')
            console.log('  node scripts/manage-default-tier.js get')
            console.log('  node scripts/manage-default-tier.js set <tier>')
            console.log('  node scripts/manage-default-tier.js set-credits free <n> basic <n> pro <n>')
            console.log('')
            console.log('Examples:')
            console.log('  node scripts/manage-default-tier.js get')
            console.log('  node scripts/manage-default-tier.js set pro')
            console.log('  node scripts/manage-default-tier.js set-credits free 0 basic 50 pro 150')
            break
    }
}

main().catch(console.error)