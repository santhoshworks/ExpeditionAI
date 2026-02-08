// scripts/agents/trend-monitor.ts

import Anthropic from "@anthropic-ai/sdk";
import { GeneratedPost, TrendingTopic } from "./types";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

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
