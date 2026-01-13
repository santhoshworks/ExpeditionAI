# Centralized Model Configuration Guide

## Overview

All OpenRouter model assignments are now centralized in `lib/constants.ts` under the `FEATURE_MODELS` configuration. This makes it easy to track, update, and manage which models are used for each feature.

## Configuration Location

**File**: `lib/constants.ts`
**Section**: `FEATURE_MODELS` constant

```typescript
export const FEATURE_MODELS = {
  // Chat feature - uses user-selected model with tier validation
  CHAT: {
    fallback: DEFAULT_MODELS, // Dynamic based on user tier
  },
  
  // Topic generation for expeditions
  TOPIC_GENERATION: 'google/gemini-2.0-flash-lite-001',
  
  // Journal/summary generation
  JOURNAL_GENERATION: 'google/gemini-2.0-flash-001',
  
  // Illustration prompt generation
  ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-lite-001',
  
  // Define feature - vocabulary definitions
  DEFINE_FEATURE: 'google/gemini-2.0-flash-lite-001',
} as const
```

## Feature-to-Model Mapping

| Feature | Model | Cost (Credits) | Usage |
|---------|-------|----------------|-------|
| **Chat** | User-selected | 0-5 | Main conversation interface |
| **Topic Generation** | Gemini Flash 8B | ~0.25 | Auto-generate learning topics |
| **Journal Generation** | Gemini 2.0 Flash | ~0.5 | Create learning summaries |
| **Illustration Generation** | Gemini Flash 8B | ~0.25 | AI-powered visual descriptions |
| **Define Feature** | Gemini Flash 8B | ~0.25 | Quick term definitions |

## Files Updated

### API Routes
- ✅ `app/api/chat/route.ts` - Uses `getFeatureModel()` helper
- ✅ `app/api/generate-topics/route.ts` - Uses `TOPIC_GENERATION` model
- ✅ `app/api/expeditions/[id]/journal/route.ts` - Uses `JOURNAL_GENERATION` model
- ✅ `app/api/define/route.ts` - Uses `DEFINE_FEATURE` model

### Libraries
- ✅ `lib/openrouter-image.ts` - Uses `ILLUSTRATION_GENERATION` model
- ✅ `lib/store.ts` - Uses `DEFAULT_MODELS.free` for initial state
- ✅ `lib/queries.ts` - Uses `DEFAULT_MODELS.free` for fallback

### Configuration
- ✅ `lib/constants.ts` - Central configuration with helper functions

## Helper Functions

### `getFeatureModel(feature)`
Returns the model ID for a specific feature.

```typescript
// Usage example
const model = getFeatureModel('TOPIC_GENERATION')
// Returns: 'google/gemini-2.0-flash-lite-001'
```

### `validateFeatureModel(feature)`
Validates that a feature's assigned model exists in the model catalog.

```typescript
// Usage example
const isValid = validateFeatureModel('TOPIC_GENERATION')
// Returns: true/false
```

## How to Update Models

### 1. Single Feature Update
```typescript
// In lib/constants.ts
export const FEATURE_MODELS = {
  // Change this line to update topic generation model
  TOPIC_GENERATION: 'google/gemini-2.0-flash-001', // Updated model
  
  // Other features remain unchanged
  JOURNAL_GENERATION: 'google/gemini-2.0-flash-001',
  // ...
}
```

### 2. Bulk Model Update
```typescript
// Example: Switch all features to use Gemini 2.0 Flash
export const FEATURE_MODELS = {
  CHAT: { fallback: DEFAULT_MODELS },
  TOPIC_GENERATION: 'google/gemini-2.0-flash-001',
  JOURNAL_GENERATION: 'google/gemini-2.0-flash-001', 
  ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-001',
  DEFINE_FEATURE: 'google/gemini-2.0-flash-001',
} as const
```

### 3. Add New Feature
```typescript
export const FEATURE_MODELS = {
  // Existing features...
  
  // New feature
  VIDEO_SUMMARY: 'anthropic/claude-3.5-haiku',
} as const
```

## Cost Optimization Strategies

### Budget-Friendly Setup
```typescript
// All features use cheapest reliable model
TOPIC_GENERATION: 'google/gemini-2.0-flash-lite-001',      // 0.25 credits
JOURNAL_GENERATION: 'google/gemini-2.0-flash-lite-001',    // 0.25 credits  
ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-lite-001', // 0.25 credits
DEFINE_FEATURE: 'google/gemini-2.0-flash-lite-001',         // 0.25 credits
```

### Performance-Optimized Setup
```typescript
// Balance cost and quality
TOPIC_GENERATION: 'google/gemini-2.0-flash-lite-001',      // Fast, cheap
JOURNAL_GENERATION: 'google/gemini-2.0-flash-001',   // Better quality
ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-lite-001', // Fast, cheap
DEFINE_FEATURE: 'google/gemini-2.0-flash-lite-001',         // Fast, cheap
```

### Premium Setup
```typescript
// Best quality for all features
TOPIC_GENERATION: 'google/gemini-2.0-flash-001',
JOURNAL_GENERATION: 'anthropic/claude-3.5-sonnet',   // Best for long-form
ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-001',
DEFINE_FEATURE: 'openai/gpt-4o-mini',                 // Best for definitions
```

## Monitoring & Analytics

### Track Model Usage
```typescript
// Add to each API route for monitoring
console.log(`Using model: ${getFeatureModel('TOPIC_GENERATION')} for topic generation`)
```

### Cost Tracking
```typescript
// Monitor costs per feature
const featureCosts = {
  TOPIC_GENERATION: calculateCreditsFromTokens(modelId, inputTokens, outputTokens),
  // ... other features
}
```

## Benefits of Centralized Configuration

✅ **Easy Updates**: Change models in one place
✅ **Consistency**: All features use the same configuration system  
✅ **Cost Control**: Clear visibility of model costs per feature
✅ **Validation**: Built-in model validation helpers
✅ **Documentation**: Self-documenting configuration
✅ **Testing**: Easy to switch models for A/B testing

## Migration Checklist

- [x] Consolidate all hardcoded model names
- [x] Create centralized `FEATURE_MODELS` configuration
- [x] Add helper functions for model access
- [x] Update all API routes to use centralized config
- [x] Update client-side code (store, queries)
- [x] Add validation functions
- [x] Create documentation
- [x] Test all features with new configuration

Your model configuration is now fully centralized and easy to manage! 🎉