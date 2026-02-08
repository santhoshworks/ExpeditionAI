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

  const userPrompt = `Generate a product-focused Twitter post for ThoughtMap. Use this angle: "${PRODUCT_ANGLES[Math.floor(Math.random() * PRODUCT_ANGLES.length)]}".`;

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
