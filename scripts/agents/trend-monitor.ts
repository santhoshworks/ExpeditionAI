// scripts/agents/trend-monitor.ts

import { GeneratedPost, TrendingTopic } from "./types";

// Use OpenRouter for LLM calls
async function callOpenRouter(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY environment variable");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://thoughtmap.space",
      "X-Title": "ThoughtMap Twitter Agent",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `OpenRouter API error: ${data.error?.message || response.statusText}`
    );
  }

  return data.choices[0]?.message?.content || "";
}

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

Your task: Generate ONE compelling Twitter post that leverages trending topics using Hook→Problem→Solution:

1. HOOK: Connect the trending topic (#${trend.name.replace(/\s+/g, "")}) to a larger observation or question
2. PROBLEM: Highlight how current approaches miss something important
3. SOLUTION: Show how ThoughtMap's interactive exploration addresses this gap
4. CTA: MUST end with "Explore at thoughtmap.space" or "Visit thoughtmap.space"

CRITICAL REQUIREMENTS:
- MUST include the website URL (thoughtmap.space) at the end
- Keep under 280 characters
- Include #${trend.name.replace(/\s+/g, "")} hashtag
- Include 2-3 additional relevant hashtags
- Avoid spam/marketing language - be authentic and thought-provoking
- Don't sound salesy, sound like a genuine insight

Return ONLY valid JSON with no markdown:
{
  "content": "hook connecting to trend. problem insight. solution with thoughtmap. Explore at thoughtmap.space",
  "hashtags": ["#${trend.name.replace(/\s+/g, "")}", "hashtag2", "hashtag3"]
}`;

  const userPrompt = `Generate a Twitter post leveraging the #${trend.name.replace(/\s+/g, "")} trend using Hook→Problem→Solution framework. Connect it authentically to ThoughtMap's learning exploration features. MUST include "thoughtmap.space" URL at the end.`;

  const content = await callOpenRouter(systemPrompt, userPrompt);

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
