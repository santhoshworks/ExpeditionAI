// Setup script to test Supabase connection and guide database creation
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables manually since we're in a script
const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8')
const envVars: Record<string, string> = {}

envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
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
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

if (supabaseUrl === 'your_supabase_project_url' || supabaseKey === 'your_supabase_anon_key') {
  console.error('❌ Please replace placeholder values in .env.local with your actual Supabase credentials')
  process.exit(1)
}

console.log('🔍 Testing Supabase connection...')
console.log('📍 URL:', supabaseUrl.replace(/\/\/.*@/, '//***@'))

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    const { error } = await supabase.auth.getSession()
    
    if (error && (error.message.includes('Invalid API key') || error.message.includes('JWT'))) {
      console.error('❌ Connection failed: Invalid API key')
      console.error('Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    return true
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

async function checkExistingTables() {
  try {
    const { data, error } = await supabase
      .from('expeditions')
      .select('id')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('ℹ️  Database tables do not exist yet - migration needed')
        return false
      }
      throw error
    }
    
    console.log('✅ Database tables already exist')
    return true
  } catch (error: any) {
    if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('ℹ️  Database tables do not exist yet - migration needed')
      return false
    }
    throw error
  }
}

async function main() {
  const connected = await testConnection()
  if (!connected) {
    process.exit(1)
  }
  
  const tablesExist = await checkExistingTables()
  
  if (tablesExist) {
    console.log('\n✅ Database schema already exists. No migration needed.')
    console.log('You can now run: npm run dev')
  } else {
    console.log('\n📋 Database migration needed. Here are your options:\n')
    console.log('OPTION 1: Manual Migration (Recommended)')
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy the contents of: supabase/migrations/001_initial_schema.sql')
    console.log('5. Paste and run the SQL script')
    console.log('\nOPTION 2: Using Supabase CLI (if installed)')
    console.log('  npx supabase db push')
    console.log('\nAfter running the migration, you can start the app with: npm run dev')
  }
  
  process.exit(0)
}

main().catch(console.error)
