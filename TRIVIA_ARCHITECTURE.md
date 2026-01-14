# Trivia Feature Architecture

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER SENDS MESSAGE                                           │
│    "What is recursion?"                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. API ENDPOINT (app/api/chat/route.ts)                         │
│                                                                  │
│  • Adds TRIVIA_SYSTEM_PROMPT to messages                        │
│  • Calls OpenRouter with streamText()                           │
│  • Streams response back to client                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. LLM GENERATES RESPONSE                                       │
│                                                                  │
│  **Recursion** is a programming technique...                    │
│                                                                  │
│  [code examples and explanation]                                │
│                                                                  │
│  ---TRIVIA---                                                   │
│  WHY_IT_MATTERS: Recursion is fundamental...                    │
│  REAL_WORLD_USE: File system traversal...                       │
│  WHEN_YOU_NEED: When working with hierarchical data...          │
│  DID_YOU_KNOW: The concept predates computers...                │
│  ---END_TRIVIA---                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. STREAMING DISPLAY (extractStreamingContent)                  │
│                                                                  │
│  While streaming:                                               │
│  • Show content before ---TRIVIA--- marker                      │
│  • Hide trivia section until complete                           │
│  • User sees answer building up in real-time                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. FINAL PARSING (parseTriviaResponse)                          │
│                                                                  │
│  After streaming completes:                                     │
│  • Split content at ---TRIVIA--- marker                         │
│  • Parse trivia fields with regex                               │
│  • Return { content, trivia } object                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. UI DISPLAY                                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │ 💬 **Recursion** is a programming technique...   │           │
│  │                                                  │           │
│  │ [Full answer with code examples]                │           │
│  │                                                  │           │
│  │ 💡 [Lightbulb icon appears]                     │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  User clicks lightbulb → Popover shows trivia                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Backend (app/api/chat/route.ts)
```typescript
// System prompt instructs LLM on format
const TRIVIA_SYSTEM_PROMPT = `
  Use this format:
  
  [Your answer]
  
  ---TRIVIA---
  WHY_IT_MATTERS: ...
  REAL_WORLD_USE: ...
  WHEN_YOU_NEED: ...
  DID_YOU_KNOW: ...
  ---END_TRIVIA---
`

// Stream response to client
const result = await streamText({
  model: openrouter(selectedModel),
  messages: [
    { role: "system", content: TRIVIA_SYSTEM_PROMPT },
    ...messages
  ]
})
```

### Frontend Parsing (components/chat/chat-interface.tsx)

```typescript
// During streaming - hide trivia section
function extractStreamingContent(rawContent: string): string {
  const startIndex = rawContent.indexOf('---TRIVIA---')
  if (startIndex !== -1) {
    return rawContent.substring(0, startIndex).trim()
  }
  return rawContent
}

// After streaming - parse trivia
function parseTriviaResponse(rawContent: string) {
  // Find markers
  const startIndex = rawContent.indexOf('---TRIVIA---')
  const endIndex = rawContent.indexOf('---END_TRIVIA---')
  
  if (startIndex === -1 || endIndex === -1) {
    return { content: rawContent, trivia: null }
  }
  
  // Extract content and trivia
  const content = rawContent.substring(0, startIndex).trim()
  const triviaText = rawContent.substring(startIndex, endIndex)
  
  // Parse fields with regex
  const trivia = {
    whyItMatters: extractField(triviaText, 'WHY_IT_MATTERS'),
    realWorldUse: extractField(triviaText, 'REAL_WORLD_USE'),
    whenYouNeed: extractField(triviaText, 'WHEN_YOU_NEED'),
    didYouKnow: extractField(triviaText, 'DID_YOU_KNOW')
  }
  
  return { content, trivia }
}
```

### UI Components

```
components/chat/
├── chat-interface.tsx       # Main chat logic, parsing
├── message.tsx              # Renders messages, checks for trivia
├── message-list.tsx         # List of messages
└── trivia-indicator.tsx     # Lightbulb icon + popover
```

## Why This Approach Works

### ✅ Advantages
1. **Simple**: Text markers are easy to detect
2. **Reliable**: No complex JSON parsing
3. **Streaming-Friendly**: Content shows immediately
4. **Graceful**: Missing trivia doesn't break chat
5. **Model-Agnostic**: Works with any LLM

### ❌ Previous JSON Approach Issues
1. **Complex**: 100+ lines of parsing code
2. **Fragile**: Broke on malformed JSON
3. **Streaming Problems**: Incomplete JSON showed raw text
4. **Model-Dependent**: Required perfect JSON formatting

## Testing Checklist

- [ ] Educational question → Shows trivia
- [ ] Simple question → No trivia
- [ ] Code debugging → No trivia
- [ ] Streaming displays correctly
- [ ] Trivia popover opens/closes
- [ ] Works on mobile
- [ ] Handles missing trivia gracefully
- [ ] Handles incomplete trivia gracefully
