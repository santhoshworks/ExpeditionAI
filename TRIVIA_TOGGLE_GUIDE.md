# Trivia Feature - Toggle Guide

## How to Enable/Disable Trivia

The trivia feature is controlled by an environment variable in `.env.local`:

```bash
NEXT_PUBLIC_ENABLE_TRIVIA=true   # Enable trivia
NEXT_PUBLIC_ENABLE_TRIVIA=false  # Disable trivia
```

## What Happens When Enabled

✅ **Trivia Enabled** (`NEXT_PUBLIC_ENABLE_TRIVIA=true`):
1. AI includes trivia section at end of educational responses
2. Trivia section is **hidden** from the main message content
3. Lightbulb icon (💡) appears next to messages with trivia
4. Clicking lightbulb shows trivia in a popover
5. User sees clean answer + optional trivia tooltip

## What Happens When Disabled

❌ **Trivia Disabled** (`NEXT_PUBLIC_ENABLE_TRIVIA=false`):
1. AI responds normally without trivia section
2. No lightbulb icon appears
3. Cleaner, simpler responses
4. If AI accidentally includes trivia markers, they are **automatically removed** from display

## Key Implementation Details

### Backend (app/api/chat/route.ts)
```typescript
// Check feature flag
const triviaEnabled = process.env.NEXT_PUBLIC_ENABLE_TRIVIA === 'true'

// Use appropriate system prompt
const systemPrompt = triviaEnabled ? TRIVIA_SYSTEM_PROMPT : REGULAR_SYSTEM_PROMPT
```

### Frontend (components/chat/chat-interface.tsx)
```typescript
// Check feature flag
const triviaEnabled = process.env.NEXT_PUBLIC_ENABLE_TRIVIA === 'true'

// Parse response - always removes trivia markers from display
const { content, trivia } = parseTriviaResponse(rawContent, triviaEnabled)

// If disabled: content = clean text, trivia = null
// If enabled: content = clean text, trivia = parsed object or null
```

### UI (components/chat/message.tsx)
```typescript
// Only show lightbulb if trivia exists and has all fields
const hasTrivia = !isUser && message.trivia &&
  message.trivia.whyItMatters &&
  message.trivia.realWorldUse &&
  message.trivia.whenYouNeed &&
  message.trivia.didYouKnow

// Lightbulb only appears when hasTrivia is true
{hasTrivia && <TriviaIndicator trivia={message.trivia!} />}
```

## Important: Trivia Markers Always Removed

**Critical behavior**: The trivia section (`---TRIVIA---` ... `---END_TRIVIA---`) is **ALWAYS removed** from the displayed message content, regardless of whether the feature is enabled or disabled.

- **Enabled**: Trivia parsed and shown in lightbulb tooltip
- **Disabled**: Trivia section removed, not parsed, not shown anywhere

This ensures users never see raw trivia markers in the chat.

## Testing

### Test with Feature Enabled
1. Set `NEXT_PUBLIC_ENABLE_TRIVIA=true` in `.env.local`
2. Restart dev server (environment variables require restart)
3. Ask educational question: "What is recursion?"
4. Should see:
   - Clean answer without trivia markers
   - Lightbulb icon next to message
   - Trivia in popover when clicked

### Test with Feature Disabled
1. Set `NEXT_PUBLIC_ENABLE_TRIVIA=false` in `.env.local`
2. Restart dev server
3. Ask educational question: "What is recursion?"
4. Should see:
   - Clean answer without trivia markers
   - No lightbulb icon
   - Simple, straightforward response

## Restart Required

⚠️ **Important**: After changing `NEXT_PUBLIC_ENABLE_TRIVIA`, you **MUST restart** the Next.js development server for the change to take effect.

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

Environment variables are loaded at build/startup time, not dynamically.

## Current Status

As configured in `.env.local`:
```bash
NEXT_PUBLIC_ENABLE_TRIVIA=true
```

The trivia feature is currently **ENABLED**.

## Troubleshooting

### Trivia markers showing in chat
- Parsing function should remove them automatically
- Check browser console for errors
- Verify `parseTriviaResponse()` is being called

### Lightbulb not appearing
- Check if trivia is actually being parsed (console.log)
- Verify all 4 trivia fields are present
- Check `hasTrivia` condition in message.tsx

### Feature not toggling
- Did you restart the dev server?
- Check `.env.local` has correct value
- Verify no typos in variable name

### Old messages still have trivia
- Trivia is stored in database with messages
- Old messages will keep their trivia
- Only new messages respect the feature flag
- To clear: delete trail and start fresh conversation
