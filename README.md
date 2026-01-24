# ThoughtMap - Branching AI Learning Tool

ThoughtMap is a modern web application that enables interactive learning through branching conversations. Start learning expeditions on any topic, branch into new trails when encountering interesting concepts, and visualize your learning journey.

## Features

- 🧭 **Branching Trails**: Create new learning paths from any conversation
- 🗺️ **Visual Map**: Interactive map visualization using React Flow (@xyflow/react)
- 🚩 **Flag Topics**: Mark interesting topics for later exploration
- 📝 **Learning Journals**: Generate summaries of your learning sessions
- 🤖 **Multiple LLMs**: Choose from 300+ AI models via OpenRouter
- 💾 **Persistent Storage**: All your expeditions are saved in Supabase

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database & Auth**: Supabase
- **AI Integration**: OpenRouter + Vercel AI SDK
- **State Management**: Zustand + React Query
- **Visualization**: @xyflow/react

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenRouter API key

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. This will create all necessary tables, RLS policies, and triggers

### 4. Get OpenRouter API Key

1. Sign up at [OpenRouter](https://openrouter.ai)
2. Go to Keys section and create a new API key
3. Add it to your `.env.local` file

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
explore/
├── app/                          # Next.js app directory
│   ├── (auth)/                  # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/             # Protected pages
│   │   ├── dashboard/
│   │   ├── expedition/
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Main expedition view
│   │   │       ├── map/         # Full map view
│   │   │       └── journal/     # Journal view
│   │   └── settings/
│   ├── api/                     # API routes
│   │   └── chat/               # Chat streaming endpoint
│   └── layout.tsx
├── components/                   # React components
│   ├── chat/                   # Chat interface components
│   ├── map/                    # Map visualization
│   ├── trail/                  # Trail management
│   └── ui/                     # shadcn/ui components
├── lib/                         # Utilities and configurations
│   ├── supabase/              # Supabase clients
│   ├── queries.ts             # React Query hooks
│   ├── store.ts               # Zustand store
│   └── constants.ts           # App constants
├── types/                      # TypeScript types
├── hooks/                      # Custom React hooks
└── supabase/                   # Database migrations
    └── migrations/
```

## Usage

### Creating an Expedition

1. Sign up or log in
2. Click "New Expedition" on the dashboard
3. Enter a title and optional description
4. Start chatting to begin your learning journey

### Branching Trails

1. During a conversation, select any text in the AI's response
2. Click the "Explore" button that appears
3. Enter a title for the new trail
4. Continue the conversation in the new trail

### Flagging Topics

Click the flag icon next to any trail to mark it for later exploration.

### Visualizing Your Journey

Click the "Map" button to see a visual representation of all your trails and their relationships.

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Future Enhancements

- [ ] Journal generation with AI
- [ ] Export expeditions to markdown
- [ ] Collaborative expeditions
- [ ] Desktop app with Electron
- [ ] Mobile app
- [ ] Advanced search and filtering
- [ ] Themes and customization

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
