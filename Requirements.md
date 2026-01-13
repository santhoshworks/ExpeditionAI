# Explore: Technical Specification Document

## Branching AI Learning Tool - Complete Development Blueprint

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Libraries & OSS Tools](#libraries--oss-tools)
3. [Application Pages](#application-pages)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Authentication Plan](#authentication-plan)
7. [State Management](#state-management)
8. [Electron Desktop Packaging](#electron-desktop-packaging)
9. [Project Structure](#project-structure)
10. [Development Timeline](#development-timeline)
11. [Cost Estimates](#cost-estimates)

---

## Executive Summary

**ExplorerAI** is a branching AI learning tool that allows users to:

- Start learning expeditions on any topic
- Branch into new trails when encountering interesting concepts
- Flag topics for later exploration
- Visualize their learning journey as a map
- Generate summaries (journals) of their learning sessions
- Choose between multiple LLMs via OpenRouter

**Target Market:** Students, educators, self-learners

**Tech Stack:** Next.js 14 + TypeScript + Tailwind + Supabase + OpenRouter + Electron

---

## Libraries & OSS Tools

### Core Framework

| Library          | Purpose         | Why This One                     |
| ---------------- | --------------- | -------------------------------- |
| **Next.js 14**   | React framework | App Router, RSC, API routes      |
| **TypeScript**   | Type safety     | Industry standard                |
| **Tailwind CSS** | Styling         | Rapid UI development             |
| **shadcn/ui**    | UI components   | Customizable, accessible, modern |

### AI & Chat

| Library                         | Purpose                | Why This One                                  |
| ------------------------------- | ---------------------- | --------------------------------------------- |
| **Vercel AI SDK**               | LLM integration        | Streaming, useChat hook, multi-provider       |
| **@openrouter/ai-sdk-provider** | OpenRouter integration | 300+ models, single API                       |
| **assistant-ui**                | Chat UI components     | Production-ready, handles streaming/scrolling |

**Alternative Chat UIs (if assistant-ui doesn't fit):**

- `@chatscope/chat-ui-kit-react` — Full-featured, framework agnostic
- `reachat` — Tailwind-based, LLM-focused

### Tree Visualization

| Library                        | Purpose                | Why This One                                |
| ------------------------------ | ---------------------- | ------------------------------------------- |
| **react-d3-tree**              | Tree/map visualization | Interactive, customizable nodes, D3-powered |
| **@xyflow/react** (React Flow) | Alternative node graph | More flexible for complex layouts           |

**react-d3-tree is recommended** for the expedition map because:

- Hierarchical data fits our trail structure perfectly
- Custom node rendering (can show trail title, status, message count)
- Pan/zoom built-in
- Click handlers for navigation

### Database & Auth

| Library                           | Purpose                    | Why This One                    |
| --------------------------------- | -------------------------- | ------------------------------- |
| **Supabase**                      | Database + Auth + Realtime | Free tier, Postgres, easy setup |
| **@supabase/supabase-js**         | Client SDK                 | Official SDK                    |
| **@supabase/auth-helpers-nextjs** | Next.js auth helpers       | SSR-compatible                  |

**Alternative:** Clerk (if you want more auth features, social logins)

### State Management

| Library                   | Purpose              | Why This One                        |
| ------------------------- | -------------------- | ----------------------------------- |
| **Zustand**               | Client state         | Lightweight, simple, no boilerplate |
| **@tanstack/react-query** | Server state/caching | Data fetching, mutations, caching   |

### Utilities

| Library                      | Purpose                         |
| ---------------------------- | ------------------------------- |
| **nanoid**                   | Generate unique IDs             |
| **date-fns**                 | Date formatting                 |
| **zod**                      | Schema validation               |
| **react-markdown**           | Render AI responses as markdown |
| **remark-gfm**               | GitHub flavored markdown        |
| **react-syntax-highlighter** | Code blocks in responses        |

### Electron (Desktop)

| Library              | Purpose                          |
| -------------------- | -------------------------------- |
| **Nextron**          | Next.js + Electron integration   |
| **electron-builder** | Package for Win/Mac/Linux        |
| **electron-serve**   | Serve static files in production |
| **electron-store**   | Local storage for settings       |

---

## Application Pages

### Public Pages (No Auth Required)

| Route      | Page    | Description                            |
| ---------- | ------- | -------------------------------------- |
| `/`        | Landing | Marketing page, features, pricing, CTA |
| `/login`   | Login   | Email/password or OAuth                |
| `/signup`  | Signup  | Registration form                      |
| `/pricing` | Pricing | Plans comparison                       |

### Protected Pages (Auth Required)

| Route                      | Page            | Description                    |
| -------------------------- | --------------- | ------------------------------ |
| `/dashboard`               | Dashboard       | List of all expeditions, stats |
| `/expedition/new`          | New Expedition  | Start a new learning session   |
| `/expedition/[id]`         | Expedition View | Main learning interface        |
| `/expedition/[id]/map`     | Full Map View   | Expanded tree visualization    |
| `/expedition/[id]/journal` | Journal View    | Generated summary              |
| `/settings`                | Settings        | Account, API keys, preferences |
| `/settings/models`         | Model Settings  | LLM preferences, default model |

### Page Details

#### `/dashboard`

```
┌─────────────────────────────────────────────────────────────┐
│  🧭 Explore                              [+ New Expedition] │
├─────────────────────────────────────────────────────────────┤
│  Recent Expeditions                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📚 Kubernetes Deep Dive                              │   │
│  │    5 trails • Last active: 2 hours ago               │   │
│  │    [Continue] [View Map] [Journal]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🧠 Neural Networks Basics                            │   │
│  │    3 trails • Last active: Yesterday                 │   │
│  │    [Continue] [View Map] [Journal]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Stats: 12 expeditions • 47 trails • 156 messages          │
└─────────────────────────────────────────────────────────────┘
```

#### `/expedition/[id]` (Main Interface)

```
┌─────────────────────────────────────────────────────────────────┐
│  🧭 Kubernetes Deep Dive                    [Map] [Journal] [⚙]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌────────────────────────────────────┐│
│  │   🗺️ MAP          │    │  💬 TRAIL: etcd Consensus          ││
│  │                  │    │                                    ││
│  │   Base Camp      │    │  [Model: Claude 3.5 ▼]             ││
│  │   └── etcd ◄     │    │                                    ││
│  │       └── Raft   │    │  You: How does etcd achieve        ││
│  │                  │    │  consensus?                        ││
│  │   🚩 Flagged     │    │                                    ││
│  │   • Scheduler    │    │  AI: etcd uses the Raft consensus  ││
│  │   • Pods         │    │  algorithm...                      ││
│  │                  │    │  [🧭 Explore] [🚩 Flag]             ││
│  │                  │    │                                    ││
│  │  [Expand Map]    │    │  ──────────────────────────────    ││
│  └──────────────────┘    │  [Ask follow-up...]                ││
│                          └────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Authentication (Handled by Supabase)

```
POST   /auth/signup          # Supabase handles
POST   /auth/login           # Supabase handles
POST   /auth/logout          # Supabase handles
GET    /auth/callback        # OAuth callback
```

### Expeditions

| Method   | Endpoint                | Description                | Request Body         |
| -------- | ----------------------- | -------------------------- | -------------------- |
| `GET`    | `/api/expeditions`      | List user's expeditions    | —                    |
| `POST`   | `/api/expeditions`      | Create new expedition      | `{ title: string }`  |
| `GET`    | `/api/expeditions/[id]` | Get expedition with trails | —                    |
| `PATCH`  | `/api/expeditions/[id]` | Update expedition          | `{ title?: string }` |
| `DELETE` | `/api/expeditions/[id]` | Delete expedition          | —                    |

### Trails

| Method   | Endpoint                       | Description                   | Request Body                              |
| -------- | ------------------------------ | ----------------------------- | ----------------------------------------- |
| `GET`    | `/api/expeditions/[id]/trails` | Get all trails for expedition | —                                         |
| `POST`   | `/api/expeditions/[id]/trails` | Create new trail              | `{ parentTrailId?, title, sourceText? }`  |
| `PATCH`  | `/api/trails/[id]`             | Update trail (flag, title)    | `{ isFlagged?: boolean, title?: string }` |
| `DELETE` | `/api/trails/[id]`             | Delete trail and children     | —                                         |

### Messages

| Method | Endpoint                    | Description                               | Request Body                  |
| ------ | --------------------------- | ----------------------------------------- | ----------------------------- |
| `GET`  | `/api/trails/[id]/messages` | Get messages for trail                    | —                             |
| `POST` | `/api/chat`                 | Send message, get AI response (streaming) | `{ trailId, message, model }` |

### Journal

| Method | Endpoint                        | Description              | Request Body                     |
| ------ | ------------------------------- | ------------------------ | -------------------------------- |
| `POST` | `/api/expeditions/[id]/journal` | Generate journal summary | `{ includeTrailIds?: string[] }` |
| `GET`  | `/api/expeditions/[id]/journal` | Get saved journal        | —                                |

### Settings

| Method  | Endpoint        | Description       | Request Body                 |
| ------- | --------------- | ----------------- | ---------------------------- |
| `GET`   | `/api/settings` | Get user settings | —                            |
| `PATCH` | `/api/settings` | Update settings   | `{ defaultModel?, apiKey? }` |

### Models (OpenRouter)

| Method | Endpoint      | Description                           |
| ------ | ------------- | ------------------------------------- |
| `GET`  | `/api/models` | List available models from OpenRouter |

---

## Database Schema

### Supabase/PostgreSQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  default_model TEXT DEFAULT 'anthropic/claude-3.5-sonnet',
  openrouter_api_key TEXT, -- encrypted, for BYOK users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- EXPEDITIONS (Learning Sessions)
-- ============================================
CREATE TABLE public.expeditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_expeditions_user_id ON public.expeditions(user_id);
CREATE INDEX idx_expeditions_updated_at ON public.expeditions(updated_at DESC);

-- RLS
ALTER TABLE public.expeditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own expeditions" ON public.expeditions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRAILS (Conversation Threads)
-- ============================================
CREATE TABLE public.trails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
  parent_trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_text TEXT, -- The text that spawned this trail
  is_flagged BOOLEAN DEFAULT FALSE,
  is_base_camp BOOLEAN DEFAULT FALSE, -- True for the root trail
  position INTEGER DEFAULT 0, -- For ordering siblings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trails_expedition_id ON public.trails(expedition_id);
CREATE INDEX idx_trails_parent_id ON public.trails(parent_trail_id);

-- RLS (via expedition ownership)
ALTER TABLE public.trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD trails in own expeditions" ON public.trails
  FOR ALL USING (
    expedition_id IN (
      SELECT id FROM public.expeditions WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trail_id UUID NOT NULL REFERENCES public.trails(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT, -- Which LLM was used (for assistant messages)
  tokens_used INTEGER, -- Track usage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_trail_id ON public.messages(trail_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD messages in own trails" ON public.messages
  FOR ALL USING (
    trail_id IN (
      SELECT t.id FROM public.trails t
      JOIN public.expeditions e ON t.expedition_id = e.id
      WHERE e.user_id = auth.uid()
    )
  );

-- ============================================
-- JOURNALS (Generated Summaries)
-- ============================================
CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- Markdown content
  trail_ids UUID[], -- Which trails were included
  model TEXT, -- Which model generated it
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD journals in own expeditions" ON public.journals
  FOR ALL USING (
    expedition_id IN (
      SELECT id FROM public.expeditions WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_expeditions_updated_at
  BEFORE UPDATE ON public.expeditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trails_updated_at
  BEFORE UPDATE ON public.trails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS (Optional, for convenience)
-- ============================================

-- Trail with message count
CREATE VIEW public.trails_with_counts AS
SELECT
  t.*,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM public.trails t
LEFT JOIN public.messages m ON t.id = m.trail_id
GROUP BY t.id;

-- Expedition with stats
CREATE VIEW public.expeditions_with_stats AS
SELECT
  e.*,
  COUNT(DISTINCT t.id) as trail_count,
  COUNT(DISTINCT m.id) as message_count,
  COUNT(DISTINCT CASE WHEN t.is_flagged THEN t.id END) as flagged_count
FROM public.expeditions e
LEFT JOIN public.trails t ON e.id = t.expedition_id
LEFT JOIN public.messages m ON t.id = m.trail_id
GROUP BY e.id;
```

### TypeScript Types

```typescript
// types/database.ts

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  default_model: string;
  openrouter_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expedition {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpeditionWithStats extends Expedition {
  trail_count: number;
  message_count: number;
  flagged_count: number;
}

export interface Trail {
  id: string;
  expedition_id: string;
  parent_trail_id: string | null;
  title: string;
  source_text: string | null;
  is_flagged: boolean;
  is_base_camp: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TrailWithCounts extends Trail {
  message_count: number;
  last_message_at: string | null;
}

export interface Message {
  id: string;
  trail_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  tokens_used: number | null;
  created_at: string;
}

export interface Journal {
  id: string;
  expedition_id: string;
  content: string;
  trail_ids: string[];
  model: string | null;
  created_at: string;
}

// Tree structure for react-d3-tree
export interface TrailTreeNode {
  name: string;
  attributes?: {
    id: string;
    messageCount: number;
    isFlagged: boolean;
    isBaseCamp: boolean;
  };
  children?: TrailTreeNode[];
}
```

---

## Authentication Plan

### Strategy: Supabase Auth

**Why Supabase Auth:**

- Free tier includes unlimited users
- Email/password + OAuth providers
- Built-in RLS integration
- SSR-compatible with Next.js helpers

### Auth Flow

```
1. User visits /login or /signup
2. Submits credentials → Supabase Auth
3. Supabase returns session + JWT
4. JWT stored in httpOnly cookie (via auth-helpers)
5. Middleware checks session on protected routes
6. RLS policies use auth.uid() for data access
```

### Implementation

```typescript
// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedPaths = ["/dashboard", "/expedition", "/settings"];
  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users from auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.includes(req.nextUrl.pathname);

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### OAuth Providers (Optional)

- Google (most common for students)
- GitHub (for developer users)

Configure in Supabase Dashboard → Authentication → Providers

---

## State Management

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     State Architecture                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐     ┌──────────────────────────────┐  │
│  │   Zustand Store  │     │    React Query Cache         │  │
│  │   (Client State) │     │    (Server State)            │  │
│  ├──────────────────┤     ├──────────────────────────────┤  │
│  │ • currentTrailId │     │ • expeditions list           │  │
│  │ • selectedText   │     │ • trails for expedition      │  │
│  │ • showExploreBtn │     │ • messages for trail         │  │
│  │ • sidebarOpen    │     │ • user profile               │  │
│  │ • selectedModel  │     │                              │  │
│  └──────────────────┘     └──────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Vercel AI SDK (useChat)                  │   │
│  │              • streaming messages                     │   │
│  │              • isLoading state                        │   │
│  │              • error handling                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Zustand Store

```typescript
// lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ExploreState {
  // Current expedition context
  currentExpeditionId: string | null;
  currentTrailId: string | null;

  // UI state
  selectedText: string | null;
  selectedTextPosition: { x: number; y: number } | null;
  showExploreButton: boolean;
  sidebarCollapsed: boolean;
  mapExpanded: boolean;

  // Model selection
  selectedModel: string;

  // Actions
  setCurrentExpedition: (id: string | null) => void;
  setCurrentTrail: (id: string | null) => void;
  setSelectedText: (
    text: string | null,
    position?: { x: number; y: number }
  ) => void;
  toggleSidebar: () => void;
  toggleMapExpanded: () => void;
  setSelectedModel: (model: string) => void;
  reset: () => void;
}

export const useExploreStore = create<ExploreState>()(
  persist(
    (set) => ({
      // Initial state
      currentExpeditionId: null,
      currentTrailId: null,
      selectedText: null,
      selectedTextPosition: null,
      showExploreButton: false,
      sidebarCollapsed: false,
      mapExpanded: false,
      selectedModel: DEFAULT_MODELS.pro, // Use pro tier default for requirements doc

      // Actions
      setCurrentExpedition: (id) => set({ currentExpeditionId: id }),
      setCurrentTrail: (id) => set({ currentTrailId: id }),

      setSelectedText: (text, position) =>
        set({
          selectedText: text,
          selectedTextPosition: position || null,
          showExploreButton: !!text,
        }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      toggleMapExpanded: () =>
        set((state) => ({
          mapExpanded: !state.mapExpanded,
        })),

      setSelectedModel: (model) => set({ selectedModel: model }),

      reset: () =>
        set({
          currentExpeditionId: null,
          currentTrailId: null,
          selectedText: null,
          selectedTextPosition: null,
          showExploreButton: false,
        }),
    }),
    {
      name: "explore-storage",
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
```

### React Query Setup

```typescript
// lib/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

// Expeditions
export function useExpeditions() {
  return useQuery({
    queryKey: ["expeditions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expeditions_with_stats")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useExpedition(id: string) {
  return useQuery({
    queryKey: ["expedition", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expeditions")
        .select("*, trails(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Trails
export function useTrails(expeditionId: string) {
  return useQuery({
    queryKey: ["trails", expeditionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trails_with_counts")
        .select("*")
        .eq("expedition_id", expeditionId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!expeditionId,
  });
}

// Messages
export function useMessages(trailId: string) {
  return useQuery({
    queryKey: ["messages", trailId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("trail_id", trailId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!trailId,
  });
}

// Mutations
export function useCreateTrail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      expeditionId: string;
      parentTrailId?: string;
      title: string;
      sourceText?: string;
    }) => {
      const { data: trail, error } = await supabase
        .from("trails")
        .insert({
          expedition_id: data.expeditionId,
          parent_trail_id: data.parentTrailId || null,
          title: data.title,
          source_text: data.sourceText || null,
          is_base_camp: !data.parentTrailId,
        })
        .select()
        .single();
      if (error) throw error;
      return trail;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trails", variables.expeditionId],
      });
    },
  });
}

export function useToggleFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      trailId,
      isFlagged,
    }: {
      trailId: string;
      isFlagged: boolean;
    }) => {
      const { error } = await supabase
        .from("trails")
        .update({ is_flagged: isFlagged })
        .eq("id", trailId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trails"] });
    },
  });
}
```

---

## Electron Desktop Packaging

### Yes, the app can be wrapped in Electron!

**Recommended Approach: Nextron**

Nextron is the best option for Next.js + Electron because:

- Handles dev/prod environments automatically
- Uses `next export` for static builds
- Integrates with electron-builder
- TypeScript support out of the box

### Setup

```bash
# Create new Nextron app (if starting fresh)
npx create-nextron-app explore-desktop --example with-tailwindcss

# OR add to existing Next.js project
npm install --save-dev electron electron-builder nextron
```

### Project Structure for Electron

```
explore/
├── main/                    # Electron main process
│   ├── background.ts        # Main entry point
│   ├── preload.ts          # Preload scripts
│   └── helpers/
│       └── ipc.ts          # IPC handlers
├── renderer/                # Next.js app (your existing app)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── next.config.js
├── resources/               # App icons
│   ├── icon.icns           # macOS
│   ├── icon.ico            # Windows
│   └── icon.png            # Linux
├── electron-builder.yml     # Build config
├── nextron.config.js       # Nextron config
└── package.json
```

### Main Process (background.ts)

```typescript
// main/background.ts
import path from "path";
import { app, BrowserWindow, ipcMain } from "electron";
import serve from "electron-serve";
import Store from "electron-store";

const isProd = process.env.NODE_ENV === "production";
const store = new Store();

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hiddenInset", // macOS native look
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app://./");
  } else {
    const port = process.argv[2] || 8888;
    await mainWindow.loadURL(`http://localhost:${port}/`);
    mainWindow.webContents.openDevTools();
  }
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for local storage, etc.
ipcMain.handle("store:get", (_, key) => store.get(key));
ipcMain.handle("store:set", (_, key, value) => store.set(key, value));
```

### Preload Script

```typescript
// main/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  store: {
    get: (key: string) => ipcRenderer.invoke("store:get", key),
    set: (key: string, value: any) =>
      ipcRenderer.invoke("store:set", key, value),
  },
  platform: process.platform,
});
```

### Electron Builder Config

```yaml
# electron-builder.yml
appId: com.explore.app
productName: Explore
copyright: Copyright © 2025

directories:
  output: dist
  buildResources: resources

files:
  - from: .
    filter:
      - package.json
      - app

publish: null

mac:
  target:
    - dmg
    - zip
  icon: resources/icon.icns
  category: public.app-category.education

win:
  target:
    - nsis
    - portable
  icon: resources/icon.ico

linux:
  target:
    - AppImage
    - deb
  icon: resources/icon.png
  category: Education

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```

### Build Commands

```json
// package.json scripts
{
  "scripts": {
    "dev": "nextron",
    "build": "nextron build",
    "build:win": "nextron build --win",
    "build:mac": "nextron build --mac",
    "build:linux": "nextron build --linux",
    "build:all": "nextron build --all"
  }
}
```

### Considerations for Electron

1. **Static Export Required**

   - Next.js must use `output: 'export'` in production
   - No SSR/API routes in Electron (use IPC instead)
   - External API calls still work

2. **API Routes Workaround**

   - For Electron: API calls go directly to Supabase
   - For Web: Can use Next.js API routes
   - Use environment detection:

   ```typescript
   const isElectron = typeof window !== "undefined" && window.electronAPI;
   ```

3. **Local Storage**

   - Use `electron-store` for persistent settings
   - Supabase still handles all data (requires internet)

4. **Auto-Updates**
   - Add `electron-updater` for auto-update support
   - Host releases on GitHub Releases

---

## Project Structure

```
explore/
├── main/                           # Electron main process
│   ├── background.ts
│   ├── preload.ts
│   └── helpers/
│       └── ipc.ts
│
├── renderer/                       # Next.js app
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── expedition/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Main expedition view
│   │   │   │       ├── map/
│   │   │   │       │   └── page.tsx    # Full map view
│   │   │   │       └── journal/
│   │   │   │           └── page.tsx    # Journal view
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── models/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx              # Dashboard layout with sidebar
│   │   │
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts            # Streaming chat endpoint
│   │   │   ├── expeditions/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── trails/
│   │   │   │       │   └── route.ts
│   │   │   │       └── journal/
│   │   │   │           └── route.ts
│   │   │   ├── trails/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── models/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── chat-interface.tsx
│   │   │   ├── message.tsx
│   │   │   ├── message-list.tsx
│   │   │   ├── chat-input.tsx
│   │   │   ├── model-selector.tsx
│   │   │   └── explore-button.tsx      # Text selection → new trail
│   │   │
│   │   ├── expedition/
│   │   │   ├── expedition-card.tsx
│   │   │   ├── expedition-list.tsx
│   │   │   └── new-expedition-form.tsx
│   │   │
│   │   ├── map/
│   │   │   ├── expedition-map.tsx      # react-d3-tree wrapper
│   │   │   ├── trail-node.tsx          # Custom node component
│   │   │   └── mini-map.tsx            # Collapsed sidebar map
│   │   │
│   │   ├── trail/
│   │   │   ├── trail-list.tsx
│   │   │   ├── trail-item.tsx
│   │   │   └── flagged-list.tsx
│   │   │
│   │   ├── journal/
│   │   │   ├── journal-view.tsx
│   │   │   └── journal-export.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   └── ui/                         # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── scroll-area.tsx
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       ├── toast.tsx
│   │       └── tooltip.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser client
│   │   │   ├── server.ts               # Server client
│   │   │   └── middleware.ts           # Auth middleware helper
│   │   │
│   │   ├── openrouter.ts               # OpenRouter client
│   │   ├── store.ts                    # Zustand store
│   │   ├── queries.ts                  # React Query hooks
│   │   ├── utils.ts                    # Helper functions
│   │   └── constants.ts                # Models list, etc.
│   │
│   ├── types/
│   │   ├── database.ts                 # Supabase types
│   │   ├── index.ts                    # Shared types
│   │   └── electron.d.ts               # Electron API types
│   │
│   ├── hooks/
│   │   ├── use-text-selection.ts       # Text selection hook
│   │   ├── use-keyboard-shortcuts.ts
│   │   └── use-expedition.ts           # Combined expedition data
│   │
│   ├── middleware.ts                   # Auth middleware
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── postcss.config.js
│
├── resources/                          # Electron icons
│   ├── icon.icns
│   ├── icon.ico
│   └── icon.png
│
├── supabase/
│   ├── migrations/                     # Database migrations
│   │   └── 001_initial_schema.sql
│   └── seed.sql                        # Test data
│
├── electron-builder.yml
├── nextron.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## Development Timeline

### Phase 1: Foundation (Week 1)

| Day | Task                                                    |
| --- | ------------------------------------------------------- |
| 1   | Project setup: Next.js, TypeScript, Tailwind, shadcn/ui |
| 2   | Supabase setup: Database schema, RLS policies           |
| 3   | Authentication: Login, signup, middleware               |
| 4   | Dashboard: Expedition list, create new expedition       |
| 5   | Basic chat: Single trail, OpenRouter integration        |
| 6-7 | Chat polish: Streaming, markdown rendering              |

### Phase 2: Core Features (Week 2-3)

| Day   | Task                                                   |
| ----- | ------------------------------------------------------ |
| 8-9   | Trail branching: Text selection, "Explore this" button |
| 10-11 | Trail management: Switch trails, tree state            |
| 12-13 | Map visualization: react-d3-tree integration           |
| 14-15 | Flags: Flag/unflag trails, flagged list                |
| 16-17 | Model selector: Multiple LLMs via OpenRouter           |
| 18-19 | Persist messages to Supabase                           |
| 20-21 | Testing and bug fixes                                  |

### Phase 3: Polish (Week 4)

| Day   | Task                                          |
| ----- | --------------------------------------------- |
| 22-23 | Journal generation: Summarize expedition      |
| 24    | Export: Markdown export                       |
| 25    | Settings page: Model defaults, API key (BYOK) |
| 26    | Mobile responsiveness                         |
| 27-28 | Final polish, performance optimization        |

### Phase 4: Desktop & Launch (Week 5)

| Day   | Task                                 |
| ----- | ------------------------------------ |
| 29-30 | Electron integration with Nextron    |
| 31-32 | Build for Win/Mac/Linux              |
| 33    | Landing page                         |
| 34    | Stripe integration for subscriptions |
| 35    | Launch! 🚀                           |

---

## Cost Estimates

### Development Infrastructure (Monthly)

| Service         | Free Tier         | Paid Tier                |
| --------------- | ----------------- | ------------------------ |
| **Supabase**    | 500MB DB, 50K MAU | $25/mo (8GB, unlimited)  |
| **Vercel**      | 100GB bandwidth   | $20/mo (1TB)             |
| **OpenRouter**  | Pay-per-use       | ~$0.001-0.01 per message |
| **Domain**      | —                 | $12/year                 |
| **Total (MVP)** | **~$0/mo**        | **~$50/mo**              |

### AI Costs (OpenRouter)

| Model             | Input (1K tokens) | Output (1K tokens) |
| ----------------- | ----------------- | ------------------ |
| GPT-4o-mini       | $0.00015          | $0.0006            |
| Claude 3.5 Sonnet | $0.003            | $0.015             |
| GPT-4o            | $0.005            | $0.015             |
| Llama 3.1 70B     | $0.0008           | $0.0008            |

**Estimated per-user cost:** $0.05-0.20/month (average usage)

### Revenue Model

| Tier        | Price  | Features                                       |
| ----------- | ------ | ---------------------------------------------- |
| **Free**    | $0     | 3 expeditions, 5 trails each, GPT-4o-mini only |
| **Student** | $8/mo  | Unlimited, all models, export                  |
| **Pro**     | $15/mo | Everything + priority support                  |
| **BYOK**    | $5/mo  | Bring your own API key                         |

**Break-even:** ~50 paid users at $10 average = $500 MRR

---

## Quick Start Commands

```bash
# 1. Create project
npx create-nextron-app explore --example with-tailwindcss

# 2. Install dependencies
cd explore
npm install zustand @tanstack/react-query @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install ai @openrouter/ai-sdk-provider
npm install react-d3-tree react-markdown remark-gfm
npm install zod nanoid date-fns
npm install -D @types/d3

# 3. Add shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog dropdown-menu input scroll-area

# 4. Set up environment
cp .env.example .env.local
# Add: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENROUTER_API_KEY

# 5. Run development
npm run dev

# 6. Build for desktop
npm run build:all
```

---

## Summary

This document provides everything needed to build **Explore**:

✅ **Libraries identified** — No building from scratch, leverage OSS
✅ **All pages mapped** — Clear navigation structure  
✅ **API endpoints defined** — RESTful design with streaming support
✅ **Database schema complete** — Ready for Supabase migration
✅ **Auth plan solid** — Supabase Auth with RLS
✅ **State management clear** — Zustand + React Query + AI SDK
✅ **Electron viable** — Nextron for desktop packaging
✅ **Timeline realistic** — 5 weeks to launch

**Ready to start coding!** 🚀
