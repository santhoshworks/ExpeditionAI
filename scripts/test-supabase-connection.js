// Test Supabase connection and create database schema
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
console.log('📍 URL:', supabaseUrl.replace(/\/\/.*@/, '//***@')); // Hide sensitive parts

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection by fetching auth user (this works even without auth)
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message.includes('Invalid API key')) {
      console.error('❌ Connection failed: Invalid API key');
      console.error('Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function checkExistingTables() {
  try {
    // Try to query a table that should exist after migration
    const { data, error } = await supabase
      .from('expeditions')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('ℹ️  Database tables do not exist yet - migration needed');
        return false;
      }
      throw error;
    }
    
    console.log('✅ Database tables already exist');
    return true;
  } catch (error) {
    if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('ℹ️  Database tables do not exist yet - migration needed');
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
  
  const tablesExist = await checkExistingTables();
  
  if (tablesExist) {
    console.log('\n✅ Database schema already exists. No migration needed.');
  } else {
    console.log('\n📋 Next steps to create the database schema:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy the contents of: supabase/migrations/001_initial_schema.sql');
    console.log('5. Paste and run the SQL script');
    console.log('\nAlternatively, if you have Supabase CLI installed:');
    console.log('  npx supabase db push');
  }
  
  process.exit(0);
}

main();
