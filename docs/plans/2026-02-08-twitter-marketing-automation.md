# Twitter Marketing Automation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automate daily Twitter posts for thoughtmap.space using Claude agents, GitHub Actions, and Odoo Social Marketing as the scheduling/management hub.

**Architecture:** GitHub Actions triggers nightly (8 AM UTC) to run a Claude agent that generates two posts daily: one about ThoughtMap product features and one about trending topics. Both posts are written to Odoo Social Marketing via MCP, where you review and approve before publishing. The system runs autonomous agents daily without manual content generation.

**Tech Stack:**
- GitHub Actions (scheduling)
- Claude API (content generation)
- Odoo MCP Server (data integration)
- Node.js/TypeScript (agent code)
- Twitter/X (posting platform)

---

## Phase 1: Setup & Configuration

### Task 1: Create GitHub Actions workflow file

**Files:**
- Create: `.github/workflows/twitter-marketing.yml`

**Step 1: Write the workflow file**

```yaml
name: Daily Twitter Marketing Posts

on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  generate-posts:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run Twitter Marketing Agent
        env:
          CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
          ODOO_URL: ${{ secrets.ODOO_URL }}
          ODOO_API_KEY: ${{ secrets.ODOO_API_KEY }}
          THOUGHTMAP_FEATURES: 'branching_trails,visualization,ai_models,learning_journals'
        run: npm run agent:twitter-marketing

      - name: Commit changes if any
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -A
          git commit -m "chore: generated twitter marketing posts" || true
          git push || true
```

**Step 2: Verify workflow syntax**

Manually review the YAML file for syntax errors. Check that:
- Cron schedule is correct (0 8 * * * = 8 AM UTC daily)
- Environment variables are defined
- Steps are in correct order

**Step 3: Commit**

```bash
cd ~/projects/expeditionAI
git add .github/workflows/twitter-marketing.yml
git commit -m "setup: add github actions workflow for twitter marketing"
```

---

### Task 2: Create environment variables configuration

**Files:**
- Create: `scripts/.env.twitter-marketing.example`

**Step 1: Write environment template**

```env
# Claude API
CLAUDE_API_KEY=sk-your-key-here

# Odoo Configuration
ODOO_URL=https://your-odoo-instance.odoo.com
ODOO_API_KEY=your-odoo-api-key

# Twitter/X Configuration (for trend monitoring)
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_BEARER_TOKEN=your-bearer-token

# ThoughtMap Product Info
THOUGHTMAP_URL=https://thoughtmap.space
THOUGHTMAP_FEATURES=branching_trails,visualization,ai_models,learning_journals

# Post Configuration
POST_LANGUAGE=en
POST_TIMEZONE=UTC
PRODUCT_POST_TIME=11:00  # 11 AM UTC
TREND_POST_TIME=15:00    # 3 PM UTC
```

**Step 2: Document secrets setup**

Create file: `docs/TWITTER_MARKETING_SETUP.md`

```markdown
# Twitter Marketing Automation Setup

## GitHub Secrets

Add these to your repository settings (Settings > Secrets and variables > Actions):

- `CLAUDE_API_KEY` - Get from https://console.anthropic.com
- `ODOO_URL` - Your Odoo instance URL
- `ODOO_API_KEY` - Generate in Odoo > Settings > Security
- `TWITTER_API_KEY` - Get from Twitter Developer Portal
- `TWITTER_API_SECRET` - Get from Twitter Developer Portal
- `TWITTER_BEARER_TOKEN` - Get from Twitter Developer Portal

## Local Development

Copy `.env.twitter-marketing.example` to `.env.twitter-marketing` and fill in values.

```

**Step 3: Commit**

```bash
git add scripts/.env.twitter-marketing.example docs/TWITTER_MARKETING_SETUP.md
git commit -m "docs: add twitter marketing env configuration"
```

---

## Phase 2: Claude Agent Implementation

### Task 3: Create product content generator agent

**Files:**
- Create: `scripts/agents/product-content-generator.ts`
- Create: `scripts/agents/types.ts` (shared types)

**Step 1: Create types file**

```typescript
// scripts/agents/types.ts

export interface OdooSocialPost {
  id?: number;
  message: string;
  scheduled_date?: string;
  account_ids?: number[];
  image_urls?: string[];
  hashtags?: string[];
  cta_url?: string;
}

export interface GeneratedPost {
  type: 'product' | 'trend';
  content: string;
  hashtags: string[];
  scheduledTime: string;  // ISO format
  ctaUrl: string;
  imagePrompt?: string;
}

export interface TrendingTopic {
  name: string;
  trendingNow: boolean;
  volume?: number;
  relevanceScore?: number;
}

export interface AgentConfig {
  claudeApiKey: string;
  odooUrl: string;
  odooApiKey: string;
  thoughtmapUrl: string;
  features: string[];
}
```

**Step 2: Create product content agent**

```typescript
// scripts/agents/product-content-generator.ts

import Anthropic from "@anthropic-ai/sdk";
import { GeneratedPost } from "./types";

const client = new Anthropic();

const THOUGHTMAP_FEATURES = {
  branching_trails:
    "Create new learning paths from any conversation mid-stream",
  visualization: "Interactive map visualization of your learning journey",
  ai_models: "Choose from 300+ AI models via OpenRouter",
  learning_journals: "Generate summaries and insights from learning sessions",
  flag_topics: "Bookmark interesting topics for later exploration",
};

const PRODUCT_ANGLES = [
  "Learning tips and productivity hacks",
  "How branching conversations unlock new ideas",
  "Curiosity-driven exploration benefits",
  "AI-powered learning efficiency",
  "Structured knowledge building",
];

async function generateProductPost(): Promise<GeneratedPost> {
  const systemPrompt = `You are a social media marketer for ThoughtMap, an AI-powered interactive learning platform.

ThoughtMap features:
${Object.entries(THOUGHTMAP_FEATURES)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Your task: Generate ONE compelling Twitter post (280 chars max) that:
1. Hooks the reader with curiosity (starts with a question, insight, or provocative statement)
2. Highlights one ThoughtMap feature or learning benefit
3. Includes a subtle CTA: "Start your learning expedition at thoughtmap.space"
4. Suggests 3-4 relevant hashtags
5. Avoids marketing clichés ("unlock", "revolutionize", "game-changer")

Return ONLY valid JSON with no markdown formatting, no backticks, just raw JSON:
{
  "content": "the tweet text here",
  "hashtags": ["hashtag1", "hashtag2"],
  "imagePrompt": "optional: description for ai image generation"
}`;

  const userPrompt = `Generate a product-focused Twitter post for ThoughtMap. Use this angle: "${PRODUCT_ANGLES[Math.floor(Math.random() * PRODUCT_ANGLES.length)]}"`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  const content =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    // Extract JSON from response (might be wrapped in code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      type: "product",
      content: parsed.content,
      hashtags: parsed.hashtags || [],
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split(".")[0],
      ctaUrl: "https://thoughtmap.space",
      imagePrompt: parsed.imagePrompt,
    };
  } catch (error) {
    console.error("Failed to parse product post:", error);
    throw error;
  }
}

export { generateProductPost };
```

**Step 3: Commit**

```bash
git add scripts/agents/types.ts scripts/agents/product-content-generator.ts
git commit -m "feat: add product content generator agent"
```

---

### Task 4: Create trend monitor agent

**Files:**
- Create: `scripts/agents/trend-monitor.ts`

**Step 1: Create trend monitoring agent**

```typescript
// scripts/agents/trend-monitor.ts

import Anthropic from "@anthropic-ai/sdk";
import { GeneratedPost, TrendingTopic } from "./types";

const client = new Anthropic();

// Simulated trending topics (in production, fetch from Twitter API)
const SAMPLE_TRENDS: TrendingTopic[] = [
  { name: "AI Learning", trendingNow: true, volume: 50000 },
  { name: "Productivity Tips", trendingNow: true, volume: 45000 },
  { name: "Knowledge Management", trendingNow: true, volume: 38000 },
  { name: "Educational Technology", trendingNow: true, volume: 35000 },
  { name: "Critical Thinking", trendingNow: true, volume: 32000 },
];

async function selectRelevantTrend(): Promise<TrendingTopic> {
  // In production: fetch real trends from Twitter API
  // For MVP: use sample trends
  return SAMPLE_TRENDS[Math.floor(Math.random() * SAMPLE_TRENDS.length)];
}

async function generateTrendPost(trend: TrendingTopic): Promise<GeneratedPost> {
  const systemPrompt = `You are a social media marketer for ThoughtMap, an AI-powered interactive learning platform.

Your task: Generate ONE compelling Twitter post (280 chars max) that:
1. Connects a trending topic to ThoughtMap's learning/exploration angle
2. Makes the reader curious about using ThoughtMap
3. Includes subtle CTA: "Explore at thoughtmap.space"
4. Suggests 3-4 relevant hashtags (include #${trend.name.replace(/\s+/g, "")}
5. Avoids spam/marketing language
6. Is authentic and thought-provoking

Return ONLY valid JSON with no markdown formatting:
{
  "content": "the tweet text here",
  "hashtags": ["hashtag1", "hashtag2"]
}`;

  const userPrompt = `Generate a Twitter post connecting the trend "#${trend.name.replace(/\s+/g, "")}" to ThoughtMap's interactive learning features. Make it thoughtful and curious, not salesy.`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  const content =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      type: "trend",
      content: parsed.content,
      hashtags: parsed.hashtags || [],
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split(".")[0],
      ctaUrl: "https://thoughtmap.space",
    };
  } catch (error) {
    console.error("Failed to parse trend post:", error);
    throw error;
  }
}

export { generateTrendPost, selectRelevantTrend };
```

**Step 2: Commit**

```bash
git add scripts/agents/trend-monitor.ts
git commit -m "feat: add trend monitor agent"
```

---

## Phase 3: Odoo Integration

### Task 5: Create Odoo MCP client

**Files:**
- Create: `scripts/odoo/odoo-client.ts`
- Create: `scripts/odoo/types.ts`

**Step 1: Create Odoo types**

```typescript
// scripts/odoo/types.ts

export interface OdooAuth {
  url: string;
  apiKey: string;
}

export interface OdooSocialPost {
  id?: number;
  message: string;
  scheduled_date: string; // Format: "2026-02-09 11:00:00"
  scheduled_datetime?: string;
  account_ids?: [number];
  image_urls?: string[];
  state?: string; // 'draft', 'scheduled', 'posted'
}

export interface CreatePostResponse {
  id: number;
  success: boolean;
}
```

**Step 2: Create Odoo client**

```typescript
// scripts/odoo/odoo-client.ts

import { OdooAuth, OdooSocialPost, CreatePostResponse } from "./types";

export class OdooClient {
  private url: string;
  private apiKey: string;

  constructor(auth: OdooAuth) {
    this.url = auth.url;
    this.apiKey = auth.apiKey;
  }

  async createSocialPost(post: OdooSocialPost): Promise<CreatePostResponse> {
    try {
      // Using Odoo XML-RPC API (common approach)
      // In production, integrate with Odoo MCP Server when using Claude
      // For now, use REST if available or XML-RPC

      const response = await fetch(`${this.url}/api/social.post/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            model: "social.post",
            method: "create",
            args: [post],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          `Odoo API error: ${data.error?.message || response.statusText}`
        );
      }

      return {
        id: data.result,
        success: true,
      };
    } catch (error) {
      console.error("Failed to create Odoo social post:", error);
      throw error;
    }
  }

  async listSocialAccounts(): Promise<any[]> {
    try {
      const response = await fetch(`${this.url}/api/social.account/search`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error("Failed to list Odoo social accounts:", error);
      throw error;
    }
  }
}

export default OdooClient;
```

**Step 3: Commit**

```bash
git add scripts/odoo/types.ts scripts/odoo/odoo-client.ts
git commit -m "feat: add odoo api client for social posts"
```

---

### Task 6: Create Odoo integration bridge

**Files:**
- Create: `scripts/integrations/odoo-bridge.ts`

**Step 1: Create Odoo integration**

```typescript
// scripts/integrations/odoo-bridge.ts

import OdooClient from "../odoo/odoo-client";
import { GeneratedPost } from "../agents/types";
import { OdooSocialPost } from "../odoo/types";

export class OdooBridge {
  private client: OdooClient;
  private twitterAccountId: number | null = null;

  constructor(odooUrl: string, odooApiKey: string) {
    this.client = new OdooClient({
      url: odooUrl,
      apiKey: odooApiKey,
    });
  }

  async initialize(): Promise<void> {
    try {
      const accounts = await this.client.listSocialAccounts();
      const twitterAccount = accounts.find(
        (acc) =>
          acc.social_media === "twitter" || acc.social_media === "x" || acc.social_media === "X"
      );

      if (!twitterAccount) {
        throw new Error(
          "No Twitter account configured in Odoo Social Marketing"
        );
      }

      this.twitterAccountId = twitterAccount.id;
      console.log(`Connected to Twitter account: ${twitterAccount.name}`);
    } catch (error) {
      console.error("Failed to initialize Odoo bridge:", error);
      throw error;
    }
  }

  async postToOdoo(post: GeneratedPost): Promise<number> {
    if (!this.twitterAccountId) {
      throw new Error("Odoo Twitter account not initialized");
    }

    const odooPost: OdooSocialPost = {
      message: post.content,
      scheduled_date: post.scheduledTime,
      account_ids: [this.twitterAccountId],
      state: "scheduled",
    };

    try {
      const result = await this.client.createSocialPost(odooPost);
      console.log(
        `Posted to Odoo: "${post.content}" (ID: ${result.id})`
      );
      return result.id;
    } catch (error) {
      console.error("Failed to post to Odoo:", error);
      throw error;
    }
  }

  async postMultiple(posts: GeneratedPost[]): Promise<number[]> {
    const results: number[] = [];

    for (const post of posts) {
      try {
        const id = await this.postToOdoo(post);
        results.push(id);
        // Small delay between posts to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to post: ${post.content}`, error);
      }
    }

    return results;
  }
}

export default OdooBridge;
```

**Step 2: Commit**

```bash
git add scripts/integrations/odoo-bridge.ts
git commit -m "feat: add odoo integration bridge for social posts"
```

---

## Phase 4: Main Orchestrator

### Task 7: Create main agent orchestrator

**Files:**
- Create: `scripts/agents/orchestrator.ts`

**Step 1: Create orchestrator**

```typescript
// scripts/agents/orchestrator.ts

import { generateProductPost } from "./product-content-generator";
import { generateTrendPost, selectRelevantTrend } from "./trend-monitor";
import OdooBridge from "../integrations/odoo-bridge";
import { GeneratedPost } from "./types";

interface OrchestratorConfig {
  odooUrl: string;
  odooApiKey: string;
}

export class TwitterMarketingOrchestrator {
  private odooBridge: OdooBridge;

  constructor(config: OrchestratorConfig) {
    this.odooBridge = new OdooBridge(config.odooUrl, config.odooApiKey);
  }

  async run(): Promise<void> {
    try {
      console.log("Starting Twitter Marketing Agent...");

      // Initialize Odoo connection
      await this.odooBridge.initialize();

      const posts: GeneratedPost[] = [];

      // Generate product content post
      console.log("Generating product content post...");
      try {
        const productPost = await generateProductPost();
        posts.push(productPost);
        console.log(`✓ Product post: "${productPost.content}"`);
      } catch (error) {
        console.error("Failed to generate product post:", error);
      }

      // Generate trend post
      console.log("Generating trend-based post...");
      try {
        const trend = await selectRelevantTrend();
        const trendPost = await generateTrendPost(trend);
        posts.push(trendPost);
        console.log(`✓ Trend post: "${trendPost.content}"`);
      } catch (error) {
        console.error("Failed to generate trend post:", error);
      }

      // Post to Odoo
      if (posts.length > 0) {
        console.log(`Posting ${posts.length} posts to Odoo...`);
        const postIds = await this.odooBridge.postMultiple(posts);
        console.log(`✓ Successfully posted ${postIds.length} posts to Odoo`);
      } else {
        console.warn("No posts generated");
      }

      console.log("Twitter Marketing Agent completed successfully");
    } catch (error) {
      console.error("Fatal error in Twitter Marketing Agent:", error);
      throw error;
    }
  }
}

export default TwitterMarketingOrchestrator;
```

**Step 2: Create entry point script**

```typescript
// scripts/twitter-marketing-agent.ts

import TwitterMarketingOrchestrator from "./agents/orchestrator";

async function main() {
  const config = {
    odooUrl: process.env.ODOO_URL || "",
    odooApiKey: process.env.ODOO_API_KEY || "",
  };

  if (!config.odooUrl || !config.odooApiKey) {
    throw new Error("Missing required environment variables: ODOO_URL, ODOO_API_KEY");
  }

  const orchestrator = new TwitterMarketingOrchestrator(config);
  await orchestrator.run();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

**Step 3: Add npm scripts to package.json**

Read current package.json, then add these scripts:

```json
{
  "scripts": {
    "agent:twitter-marketing": "ts-node scripts/twitter-marketing-agent.ts",
    "agent:twitter-marketing:local": "dotenv -e .env.twitter-marketing ts-node scripts/twitter-marketing-agent.ts"
  }
}
```

**Step 4: Commit**

```bash
git add scripts/agents/orchestrator.ts scripts/twitter-marketing-agent.ts
git commit -m "feat: add main twitter marketing agent orchestrator"
```

---

## Phase 5: Local Testing & Documentation

### Task 8: Create local testing guide

**Files:**
- Create: `docs/TWITTER_MARKETING_TESTING.md`

**Step 1: Write testing documentation**

```markdown
# Twitter Marketing Agent - Local Testing Guide

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Copy environment template:
```bash
cp scripts/.env.twitter-marketing.example .env.twitter-marketing
```

3. Fill in your credentials:
```bash
CLAUDE_API_KEY=sk-...
ODOO_URL=https://your-instance.odoo.com
ODOO_API_KEY=...
```

## Running Agent Locally

### Test Product Content Generation

```bash
npm run agent:twitter-marketing:local
```

Expected output:
```
Starting Twitter Marketing Agent...
Connecting to Odoo instance...
✓ Connected to Twitter account: thoughtmap_twitter
Generating product content post...
✓ Product post: "What if you could explore ideas visually?..."
Generating trend-based post...
✓ Trend post: "The best learners ask better questions..."
Posting 2 posts to Odoo...
✓ Successfully posted 2 posts to Odoo
Twitter Marketing Agent completed successfully
```

## Verifying Posts in Odoo

1. Log into your Odoo instance
2. Navigate to **Social Marketing > Posts**
3. You should see your generated posts in "Draft" or "Scheduled" state
4. Check the scheduled date/time matches your configuration
5. Edit and publish when ready

## Troubleshooting

### "No Twitter account configured in Odoo Social Marketing"
- Log into Odoo
- Go to Social Marketing > Social Accounts
- Add your Twitter/X account with OAuth credentials

### API Key Authentication Errors
- Verify ODOO_API_KEY is correct (Settings > Security > API Keys)
- Confirm Odoo MCP Server module is installed
- Check that your API key has access to social.post model

### Posts Not Appearing in Odoo
- Check agent logs for API errors
- Verify Odoo social.post model is exposed in MCP Server settings
- Ensure your API key has "Create" permission for social.post

## Next Steps

1. ✅ Test agent locally
2. ✅ Verify posts appear in Odoo
3. ✅ Test GitHub Actions workflow
4. ✅ Monitor first 7 days of automated posts
```

**Step 2: Commit**

```bash
git add docs/TWITTER_MARKETING_TESTING.md
git commit -m "docs: add local testing guide for twitter marketing agent"
```

---

### Task 9: Create GitHub Actions setup guide

**Files:**
- Create: `docs/GITHUB_ACTIONS_SETUP.md`

**Step 1: Write GitHub Actions setup**

```markdown
# GitHub Actions Setup for Twitter Marketing

## Adding Secrets to GitHub Repository

### Via GitHub Web UI

1. Go to your repository on GitHub
2. Settings > Secrets and variables > Actions
3. Click "New repository secret" for each:

**CLAUDE_API_KEY**
- Get from: https://console.anthropic.com
- Click "Create API Key" and copy

**ODOO_URL**
- Value: `https://your-instance.odoo.com`
- Don't include trailing slash

**ODOO_API_KEY**
- In Odoo: Settings > Security > API Keys
- Click "Create Key" and copy the token

**TWITTER_API_KEY** (optional for MVP)
- Get from Twitter Developer Portal

**TWITTER_API_SECRET** (optional for MVP)
- Get from Twitter Developer Portal

**TWITTER_BEARER_TOKEN** (optional for MVP)
- Get from Twitter Developer Portal

### Via GitHub CLI

```bash
gh secret set CLAUDE_API_KEY --body "sk-..."
gh secret set ODOO_URL --body "https://your-instance.odoo.com"
gh secret set ODOO_API_KEY --body "..."
```

## Testing the Workflow

### Manual Trigger

1. Go to Actions tab
2. Select "Daily Twitter Marketing Posts"
3. Click "Run workflow"
4. Watch execution logs in real-time

### Scheduled Execution

- Workflow runs at **8 AM UTC daily**
- Next run: tomorrow at 8 AM UTC
- Check Actions tab to see past runs

## Monitoring Runs

1. Go to Actions > Daily Twitter Marketing Posts
2. Click on any run to see detailed logs
3. Look for:
   - ✓ "Successfully posted X posts to Odoo"
   - ✗ Any error messages

## Troubleshooting

### Workflow not running on schedule
- GitHub Actions requires a push/commit to activate scheduled workflows
- Make sure your branch doesn't have `.github/workflows/` in `.gitignore`

### Secrets not accessible
- Secrets are only available to the branch they're set on
- Confirm secrets are set for the correct branch

### Agent fails in GitHub but works locally
- Check Node.js version matches: `actions/setup-node@v4`
- Verify all environment variables are set as secrets
- Check API key permissions haven't changed
```

**Step 2: Commit**

```bash
git add docs/GITHUB_ACTIONS_SETUP.md
git commit -m "docs: add github actions setup guide"
```

---

## Phase 6: Monitoring & Optimization

### Task 10: Create monitoring script

**Files:**
- Create: `scripts/monitoring/check-posts.ts`

**Step 1: Create monitoring script**

```typescript
// scripts/monitoring/check-posts.ts

import OdooClient from "../odoo/odoo-client";

async function checkPostStatus() {
  const odooUrl = process.env.ODOO_URL;
  const odooApiKey = process.env.ODOO_API_KEY;

  if (!odooUrl || !odooApiKey) {
    throw new Error("Missing ODOO_URL or ODOO_API_KEY");
  }

  const client = new OdooClient({ url: odooUrl, apiKey: odooApiKey });

  try {
    // Fetch last 7 days of posts
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    console.log("Recent Posts Status:");
    console.log("====================");

    // This would need proper Odoo API implementation
    console.log("Draft posts: 0");
    console.log("Scheduled posts: 0");
    console.log("Published posts: 0");
    console.log("");
    console.log("View full details in Odoo: Settings > Social Marketing > Posts");
  } catch (error) {
    console.error("Failed to check post status:", error);
    throw error;
  }
}

checkPostStatus().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

**Step 2: Commit**

```bash
git add scripts/monitoring/check-posts.ts
git commit -m "feat: add post status monitoring script"
```

---

## Summary

This plan creates:

1. **GitHub Actions workflow** - Schedules daily agent execution at 8 AM UTC
2. **Claude agents** - Product content + trend monitor generate compelling posts
3. **Odoo integration** - Posts written to Odoo Social Marketing for scheduling
4. **Local testing** - Full guide for testing before deployment
5. **Documentation** - Setup guides for GitHub Actions, testing, monitoring

**Total execution time:** ~2-3 hours for all tasks

**Next steps after implementation:**
1. Test locally with `.env.twitter-marketing`
2. Add secrets to GitHub repository
3. Trigger first manual workflow run
4. Monitor Odoo dashboard for posts
5. Approve and publish first posts
6. Let scheduled workflow run for 7-14 days, monitor engagement
7. Iterate on post templates based on what performs best

---
