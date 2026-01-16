# OpenRouter Models Analysis & Categorization

**Date:** January 14, 2026  
**Total Models Available:** 340

## Summary

Based on the OpenRouter API, models have been categorized by pricing tiers:

- **Free models:** 26 (0 cost)
- **Cheap models:** 133 (<$0.50/M tokens)
- **Mid-tier models:** 120 ($0.50-$5/M tokens)
- **Premium models:** 61 (>$5/M tokens)

## Recommended Models by Tier

### FREE TIER (Best Free Models)

These models have 0 cost and are perfect for the free tier:

1. **Mistral Devstral 2512** ✨ RECOMMENDED
   - ID: `mistralai/devstral-2512:free`
   - Context: 262,144 tokens
   - Best for: Coding and learning

2. **Xiaomi MiMo V2 Flash**
   - ID: `xiaomi/mimo-v2-flash:free`
   - Context: 262,144 tokens
   - Best for: Fast responses

3. **NVIDIA Nemotron 3 Nano 30B**
   - ID: `nvidia/nemotron-3-nano-30b-a3b:free`
   - Context: 256,000 tokens
   - Best for: Complex reasoning

4. **DeepSeek R1**
   - ID: `deepseek/deepseek-r1-0528:free`
   - Context: 163,840 tokens
   - Best for: Advanced reasoning

### BASIC TIER (Best Value Models)

Budget-friendly models with excellent performance:

1. **Google Gemini 2.0 Flash** ✨ RECOMMENDED
   - ID: `google/gemini-2.0-flash-001`
   - Price: ~$0.50/M tokens → **0.5 credits per trail**
   - Context: 1,048,576 tokens
   - Best for: Most learning tasks

2. **Google Gemini 2.0 Flash Lite**
   - ID: `google/gemini-2.0-flash-lite-001`
   - Price: ~$0.25/M tokens → **0.25 credits per trail**
   - Context: 1,048,576 tokens
   - Best for: Quick responses

3. **Meta Llama 3.2 3B**
   - ID: `meta-llama/llama-3.2-3b-instruct`
   - Price: ~$0.02/M tokens → **0.3 credits per trail**
   - Context: 131,072 tokens
   - Best for: Efficient processing

4. **Mistral Nemo**
   - ID: `mistralai/mistral-nemo`
   - Price: ~$0.03/M tokens → **0.4 credits per trail**
   - Context: 131,072 tokens
   - Best for: Balanced performance

5. **Meta Llama 3.1 8B**
   - ID: `meta-llama/llama-3.1-8b-instruct`
   - Price: ~$0.035/M tokens → **0.5 credits per trail**
   - Context: 16,384 tokens
   - Best for: General purpose

6. **OpenAI GPT-4o Mini**
   - ID: `openai/gpt-4o-mini`
   - Price: ~$0.15/M tokens → **0.8 credits per trail**
   - Context: 128,000 tokens
   - Best for: Strong reasoning

7. **Anthropic Claude 3.5 Haiku**
   - ID: `anthropic/claude-3.5-haiku`
   - Price: ~$0.25/M tokens → **1.2 credits per trail**
   - Context: 200,000 tokens
   - Best for: Creative explanations

8. **Google Gemini 2.0 Flash Thinking**
   - ID: `google/gemini-2.0-flash-thinking-001`
   - Price: ~$0.30/M tokens → **1.5 credits per trail**
   - Context: 1,048,576 tokens
   - Best for: Enhanced reasoning

### PRO TIER (Premium Models)

High-performance models for advanced use cases:

1. **DeepSeek V3.1 Terminus** ✨ RECOMMENDED
   - ID: `deepseek/deepseek-v3.1-terminus`
   - Price: ~$0.50/M tokens → **2 credits per trail**
   - Context: 163,840 tokens
   - Best for: Advanced reasoning at great value

2. **Google Gemini 2.5 Flash**
   - ID: `google/gemini-2.5-flash`
   - Price: ~$0.75/M tokens → **2.5 credits per trail**
   - Context: 1,048,576 tokens
   - Best for: Latest features

3. **Google Gemini 1.5 Pro**
   - ID: `google/gemini-pro-1.5`
   - Price: ~$1.25/M tokens → **3 credits per trail**
   - Context: 2,097,152 tokens (2M!)
   - Best for: Deep analysis

4. **Anthropic Claude 3.5 Sonnet**
   - ID: `anthropic/claude-3.5-sonnet`
   - Price: ~$3.00/M tokens → **4 credits per trail**
   - Context: 200,000 tokens
   - Best for: Complex analysis

5. **OpenAI GPT-4o**
   - ID: `openai/gpt-4o`
   - Price: ~$5.00/M tokens → **5 credits per trail**
   - Context: 128,000 tokens
   - Best for: Highest quality

6. **Anthropic Claude 3.7 Sonnet**
   - ID: `anthropic/claude-3.7-sonnet`
   - Price: ~$6.00/M tokens → **6 credits per trail**
   - Context: 200,000 tokens
   - Best for: Latest Claude

7. **Google Gemini 2.5 Pro**
   - ID: `google/gemini-2.5-pro`
   - Price: ~$5.625/M tokens → **8 credits per trail**
   - Context: 1,048,576 tokens
   - Best for: Most advanced Gemini

8. **OpenAI GPT-5**
   - ID: `openai/gpt-5`
   - Price: ~$5.625/M tokens → **10 credits per trail**
   - Context: 400,000 tokens
   - Best for: Latest OpenAI flagship

## Credit Calculation

Credits are calculated based on average token usage per trail:
- Estimated 2000 tokens per trail (input + output)
- Credit cost = (Model price per M tokens × 2000) / 1000

Example:
- Gemini 2.0 Flash: $0.25/M tokens × 2000 tokens = $0.50 per trail = 0.5 credits

## Implementation Notes

1. **Free Tier:** Users get 15 trails/day with free models only
2. **Basic Tier:** Users get 200 credits (~400 trails with Gemini Flash)
3. **Pro Tier:** Users get 600 + 100 bonus credits (~140 trails with GPT-4o)

## Current vs Updated Models

### Changes Made:
- ✅ Added latest free models (Mistral Devstral, Xiaomi MiMo, NVIDIA Nemotron)
- ✅ Added DeepSeek V3.1 Terminus (excellent value for Pro tier)
- ✅ Added Gemini 2.5 Flash and Pro
- ✅ Added Claude 3.7 Sonnet
- ✅ Added GPT-5
- ✅ Updated context lengths based on actual API data
- ✅ Improved model descriptions
- ✅ Better categorization by use case

### File to Update:
Replace `lib/constants.ts` with `lib/constants-updated.ts` to use the new model list.

## Testing

To fetch fresh model data from OpenRouter:
```bash
curl -s https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  > /tmp/openrouter-models.json

node scripts/analyze-models.js
```
