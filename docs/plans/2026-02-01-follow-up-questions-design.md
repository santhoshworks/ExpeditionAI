# Follow-up Questions Feature Design

**Date:** 2026-02-01
**Status:** Approved

## Overview

Add clickable follow-up question suggestions after each AI response to help users dig deeper into topics without manually typing questions.

## Requirements

- Generate 3 follow-up questions per response
- Display as card-style buttons above the chat input
- Clicking a question sends it as a user message immediately
- Questions disappear when any message is sent (typed or clicked)

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Placement | Above chat input | Discoverable, always visible for latest response |
| Question count | 3 | Balanced — not overwhelming, enough variety |
| Generation | Inline with response | Single API call, lower latency |
| Visual style | Card style | Clear clickable affordance, fallback to pills if needed |
| Click behavior | Disappear immediately | Clean transition, shows question as user message |

## Data Model

### Updated LLM Response Format

```json
{
  "content": "Main response with markdown...",
  "trivia": {
    "whyItMatters": "...",
    "realWorldUse": "...",
    "whenYouNeed": "...",
    "didYouKnow": "..."
  },
  "followUpQuestions": [
    "How does this compare to X?",
    "What are the common pitfalls?",
    "Can you show me a practical example?"
  ]
}
```

### ChatMessage Type Extension

```typescript
interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system" | "illustration"
  content: string
  trivia?: TriviaData | null
  followUpQuestions?: string[]  // NEW
  metadata?: { ... }
}
```

## UI Component

### FollowUpQuestions Component

Location: `components/chat/follow-up-questions.tsx`

```
┌─────────────────────────────────────────────────────┐
│  💡 Continue exploring                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ How does this compare to traditional...     │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ What are the common pitfalls to avoid?      │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Can you show me a practical example?        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Styling:**
- Subtle muted background container
- Cards with hover lift/highlight effect
- Cursor pointer
- Fade-in animation on appear
- Fade-out animation on dismiss

## Interaction Flow

```
User clicks question
    ↓
1. Clear followUpQuestions state (instant hide)
    ↓
2. Call handleSend(clickedQuestion)
    ↓
3. Question appears as user message
    ↓
4. LLM streams response with new questions
    ↓
5. New questions appear above input
```

## State Management

- `currentFollowUpQuestions: string[] | null` — local state in ChatInterface
- Extracted from latest assistant message after streaming completes
- Cleared when user sends any message

**No database changes needed** — questions are transient UI state.

## Edge Cases

| Case | Handling |
|------|----------|
| While streaming | Hide follow-up section |
| Empty questions array | Don't render component |
| JSON parse failure | Gracefully omit questions, chat works normally |

## Files to Modify

| File | Change |
|------|--------|
| `app/api/chat/route.ts` | Update system prompt for follow-up questions |
| `components/chat/chat-interface.tsx` | Add state, extract questions, render component |
| `components/chat/follow-up-questions.tsx` | **New** — card-style clickable questions |
| `lib/constants.ts` | Update TRIVIA_SYSTEM_PROMPT |

## Out of Scope

- Persisting questions to database
- Analytics on question clicks
- Customizing question count per user
- A/B testing different question styles
