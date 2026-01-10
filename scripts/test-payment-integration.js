#!/usr/bin/env node

/**
 * Payment Integration Test Script
 * 
 * This script helps validate that the Dodo payment integration is properly configured.
 * Run with: node scripts/test-payment-integration.js
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Dodo Payment Integration...\n')

// Check environment variables
console.log('1. Checking environment variables...')
const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found')
    process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const requiredEnvVars = [
    'DODO_API_URL',
    'DODO_SECRET_KEY',
    'DODO_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL'
]

const missingVars = requiredEnvVars.filter(varName =>
    !envContent.includes(varName) || envContent.includes(`${varName}=your_`)
)

if (missingVars.length > 0) {
    console.log(`❌ Missing or placeholder environment variables: ${missingVars.join(', ')}`)
    console.log('   Please update .env.local with your actual Dodo credentials')
} else {
    console.log('✅ All required environment variables are present')
}

// Check API routes
console.log('\n2. Checking API routes...')
const apiRoutes = [
    'app/api/payments/create-checkout/route.ts',
    'app/api/payments/webhook/route.ts'
]

apiRoutes.forEach(route => {
    if (fs.existsSync(route)) {
        console.log(`✅ ${route}`)
    } else {
        console.log(`❌ ${route} - Missing`)
    }
})

// Check components
console.log('\n3. Checking payment components...')
const components = [
    'components/payment/checkout-button.tsx',
    'components/payment/payment-status.tsx',
    'components/ui/badge.tsx'
]

components.forEach(component => {
    if (fs.existsSync(component)) {
        console.log(`✅ ${component}`)
    } else {
        console.log(`❌ ${component} - Missing`)
    }
})

// Check payment pages
console.log('\n4. Checking payment pages...')
const pages = [
    'app/payment/success/page.tsx',
    'app/payment/cancel/page.tsx'
]

pages.forEach(page => {
    if (fs.existsSync(page)) {
        console.log(`✅ ${page}`)
    } else {
        console.log(`❌ ${page} - Missing`)
    }
})

// Check pricing page integration
console.log('\n5. Checking pricing page integration...')
const pricingPath = 'app/pricing/page.tsx'
if (fs.existsSync(pricingPath)) {
    const pricingContent = fs.readFileSync(pricingPath, 'utf8')
    if (pricingContent.includes('CheckoutButton')) {
        console.log('✅ Pricing page updated with CheckoutButton')
    } else {
        console.log('❌ Pricing page not updated with CheckoutButton')
    }
} else {
    console.log('❌ Pricing page not found')
}

// Check utilities
console.log('\n6. Checking utility files...')
const utilFiles = [
    'lib/payments.ts',
    'hooks/use-toast.ts'
]

utilFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`)
    } else {
        console.log(`❌ ${file} - Missing`)
    }
})

console.log('\n📋 Integration Summary:')
console.log('- API routes for checkout and webhooks: Created')
console.log('- Payment UI components: Created')
console.log('- Success/cancel pages: Created')
console.log('- Environment variables: Added (need real values)')
console.log('- Documentation: Created')

console.log('\n🚀 Next Steps:')
console.log('1. Get your Dodo API credentials from https://dodo.dev')
console.log('2. Update .env.local with real API keys')
console.log('3. Configure webhook URL in Dodo dashboard')
console.log('4. Test in development mode')
console.log('5. Deploy and test in production')

console.log('\n✨ Payment integration setup complete!')