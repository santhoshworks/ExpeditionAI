// Simple script to test Supabase connection using existing dependencies
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return env;
  } catch (error) {
    console.error('❌ Could not read .env.local file');
    return null;
  }
}

const env = loadEnvFile();
if (!env) {
  process.exit(1);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

if (supabaseUrl === 'your_supabase_project_url' || supabaseKey === 'your_supabase_anon_key') {
  console.error('❌ Please replace placeholder values in .env.local with your actual Supabase credentials');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log('📍 URL:', supabaseUrl.replace(/https?:\/\/[^@]+@/, 'https://***@'));

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test connection by attempting to get session
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      // Some errors are expected if not authenticated, but invalid keys will fail
      if (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.message.includes('invalid')) {
        console.error('❌ Connection failed: Invalid API key or URL');
        console.error('Error:', error.message);
        return false;
      }
      // Other errors (like no session) are okay - means connection works
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function checkTables() {
  try {
    const { error } = await supabase
      .from('expeditions')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return false; // Tables don't exist
      }
      throw error;
    }
    return true; // Tables exist
  } catch (error) {
    if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
      return false;
    }
    throw error;
  }
}

async function main() {
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  console.log('\n🔍 Checking if database tables exist...');
  const tablesExist = await checkTables();
  
  if (tablesExist) {
    console.log('✅ Database schema already exists!');
    console.log('\n🎉 You can now run: npm run dev');
  } else {
    console.log('ℹ️  Database tables do not exist yet.');
    console.log('\n📋 To create the database schema, follow these steps:');
    console.log('\n1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click on "SQL Editor" in the left sidebar');
    console.log('4. Click "New Query"');
    console.log('5. Copy the contents of: supabase/migrations/001_initial_schema.sql');
    console.log('6. Paste into the SQL Editor');
    console.log('7. Click "Run" or press Cmd/Ctrl + Enter');
    console.log('\nAfter running the migration, start your app with: npm run dev');
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
