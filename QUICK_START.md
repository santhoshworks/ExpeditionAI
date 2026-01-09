# Quick Start Guide - Test Supabase Connection & Create Database

## Step 1: Install Dependencies

First, install all required packages:

```bash
npm install
```

**Note:** If you encounter issues with `@openrouter/ai-sdk-provider`, you can temporarily remove it from package.json and install it later. The Supabase connection test doesn't need it.

## Step 2: Test Supabase Connection

Run the connection test script:

```bash
npm run test:supabase
```

Or directly:

```bash
node scripts/check-supabase.js
```

This will:
- ✅ Check if your `.env.local` file exists and has valid credentials
- ✅ Test the connection to your Supabase project
- ✅ Check if database tables already exist
- ✅ Provide instructions if migration is needed

## Step 3: Create Database Schema (if needed)

If the script indicates that tables don't exist, follow these steps:

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in and select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Open the file: `supabase/migrations/001_initial_schema.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Tables Were Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `profiles`
     - `expeditions`
     - `trails`
     - `messages`
     - `journals`

### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 4: Verify Setup

Run the test script again to confirm everything is set up:

```bash
npm run test:supabase
```

You should see:
```
✅ Supabase connection successful!
✅ Database schema already exists!
🎉 You can now run: npm run dev
```

## Step 5: Start the Application

```bash
npm run dev
```

Visit http://localhost:3000 in your browser.

## Troubleshooting

### "Missing Supabase credentials" error

- Make sure `.env.local` exists in the project root
- Verify it contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure values are not placeholders

### "Invalid API key" error

- Double-check your Supabase URL and anon key in `.env.local`
- Get fresh keys from: Supabase Dashboard → Project Settings → API

### "Tables don't exist" but migration failed

- Check the SQL Editor for error messages
- Make sure you copied the ENTIRE migration file
- Try running the SQL in smaller chunks if there are errors

### Connection timeout

- Check your internet connection
- Verify your Supabase project is active (not paused)
- Check Supabase status page: https://status.supabase.com

## Next Steps

Once your database is set up:

1. ✅ Set up OpenRouter API key (for AI chat functionality)
2. ✅ Start the dev server: `npm run dev`
3. ✅ Create your first account
4. ✅ Create your first expedition!

---

**Need Help?** Check the full `SETUP.md` file for detailed instructions.
