# Quick Model Reference Card

## 🎯 One-Stop Model Configuration

**File to Edit**: `lib/constants.ts` → `FEATURE_MODELS`

## 📊 Current Configuration

```typescript
TOPIC_GENERATION: 'google/gemini-2.0-flash-lite-001',      // 0.25 credits
JOURNAL_GENERATION: 'google/gemini-2.0-flash-001',   // 0.5 credits
ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-lite-001', // 0.25 credits
DEFINE_FEATURE: 'google/gemini-2.0-flash-lite-001',         // 0.25 credits
```

## 🚀 Quick Model Swaps

### Switch to Ultra-Budget Mode
```typescript
// All features → Gemini Flash Lite (cheapest)
TOPIC_GENERATION: 'google/gemini-2.0-flash-lite-001',
JOURNAL_GENERATION: 'google/gemini-2.0-flash-lite-001',
ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-lite-001',
DEFINE_FEATURE: 'google/gemini-2.0-flash-lite-001',
```

### Switch to Premium Mode
```typescript
// Best quality for each feature
TOPIC_GENERATION: 'google/gemini-2.0-flash-001',
JOURNAL_GENERATION: 'anthropic/claude-3.5-sonnet',
ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-001',
DEFINE_FEATURE: 'openai/gpt-4o-mini',
```

## 💰 Model Cost Reference

| Model | Input Cost | Output Cost | Best For |
|-------|------------|-------------|----------|
| `google/gemini-2.0-flash-lite-001` | $0.0375/1M | $0.15/1M | Budget, Speed |
| `google/gemini-2.0-flash-001` | $0.075/1M | $0.3/1M | Balance |
| `openai/gpt-4o-mini` | $0.15/1M | $0.6/1M | Reasoning |
| `anthropic/claude-3.5-haiku` | $0.25/1M | $1.25/1M | Creative |
| `anthropic/claude-3.5-sonnet` | $3.0/1M | $15.0/1M | Premium |

## 🔧 Emergency Model Fixes

### If Rate Limited
```typescript
// Switch problematic feature to DeepSeek (free)
PROBLEMATIC_FEATURE: 'deepseek/deepseek-chat', // Free, no limits
```

### If Too Expensive
```typescript
// Switch expensive features to budget models
EXPENSIVE_FEATURE: 'google/gemini-2.0-flash-lite-001', // Cheapest reliable
```

### If Poor Quality
```typescript
// Upgrade to better model
LOW_QUALITY_FEATURE: 'google/gemini-2.0-flash-001', // Better quality
```

## 📍 Where Each Model is Used

- **Topic Generation**: Auto-generates learning topics for expeditions
- **Journal Generation**: Creates learning summaries and journals  
- **Illustration Generation**: AI descriptions for visual content
- **Define Feature**: Quick vocabulary definitions
- **Chat**: User-selected model (dynamic)

## ⚡ Quick Commands

```bash
# Test configuration
npm run build

# Check for errors
npm run type-check

# Deploy changes
git add lib/constants.ts
git commit -m "Update model configuration"
```

---
**💡 Pro Tip**: Always test in development before deploying model changes to production!