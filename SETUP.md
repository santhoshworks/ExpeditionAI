# ExplorerAI - Setup Guide

This guide will help you set up and run ExplorerAI on your local machine.

## Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Supabase** account (free tier works)
- **OpenRouter** account (for AI models)

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Supabase client libraries
- Vercel AI SDK
- OpenRouter provider
- @xyflow/react for map visualization
- All UI components (shadcn/ui)

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details (name, database password, region)
4. Wait for project to be created

### 2.2 Get Your Supabase Credentials

1. Go to Project Settings → API
2. Copy the following:
   - **Project URL** (under Project URL)
   - **anon/public key** (under Project API keys → anon public)

### 2.3 Set Up Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL script
4. This creates:
   - All tables (profiles, expeditions, trails, messages, journals)
   - Row Level Security (RLS) policies
   - Database triggers
   - Helper views

### 2.4 Enable Email Authentication

1. Go to Authentication → Providers
2. Make sure Email is enabled
3. (Optional) Configure OAuth providers (Google, GitHub, etc.)

## Step 3: Set Up OpenRouter

### 3.1 Create an OpenRouter Account

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Add credits to your account (required for API calls)

### 3.2 Get Your API Key

1. Go to [OpenRouter Keys](https://openrouter.ai/keys)
2. Click "Create Key"
3. Copy the API key

**Note**: OpenRouter uses a pay-per-use model. You'll need to add credits to use the API.

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Next.js App URL (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Replace the placeholder values with your actual keys

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 5: Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 6: Create Your First Account

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Get Started" or "Sign up"
3. Create an account with email/password
4. You'll be automatically logged in and redirected to the dashboard

## Step 7: Test the Application

### Create Your First Expedition

1. Click "New Expedition" on the dashboard
2. Enter a title (e.g., "Understanding Kubernetes")
3. Optionally add a description
4. Click "Create"

### Start a Conversation

1. You'll be taken to the expedition view
2. Type a question in the chat input
3. Select an AI model from the dropdown (top right)
4. Press Enter or click Send
5. Wait for the AI response (streaming)

### Branch into a New Trail

1. Select text in the AI's response (at least 10 characters)
2. A dialog will appear asking for a trail title
3. Enter a title and click "Create Trail"
4. Continue the conversation in the new trail

### Flag a Trail

1. Click the flag icon (🚩) next to any trail
2. Flagged trails are marked with a yellow flag
3. View flagged trails in the trail list

### View the Map

1. Click "Map" button in the header
2. See a visual representation of all trails
3. Click on any node to navigate to that trail

## Troubleshooting

### Database Connection Issues

- Verify your Supabase URL and key are correct
- Check that you ran the migration SQL script
- Ensure RLS policies are enabled

### OpenRouter API Errors

- Verify your API key is correct
- Check that you have credits in your OpenRouter account
- Ensure the model ID is valid (see `lib/constants.ts` for supported models)

### Authentication Issues

- Check Supabase Authentication settings
- Verify email provider is enabled
- Check browser console for error messages

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScript Errors

```bash
# Type check
npm run type-check
```

## Common Issues

### "Module not found" errors

Run `npm install` again to ensure all dependencies are installed.

### Chat not streaming

- Check OpenRouter API key is set correctly
- Verify you have credits in OpenRouter
- Check browser network tab for API errors

### Messages not saving

- Verify Supabase RLS policies are correctly set
- Check browser console for errors
- Ensure user is authenticated

## Next Steps

- Customize the UI themes in `tailwind.config.ts`
- Add more AI models in `lib/constants.ts`
- Implement journal generation feature
- Add export functionality
- Deploy to production (Vercel recommended)

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to add all environment variables in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Support

For issues:
1. Check this guide first
2. Review error messages in browser console
3. Check Supabase and OpenRouter dashboards for service status
4. Open an issue on GitHub

---

**Happy Exploring! 🧭**
