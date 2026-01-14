# Trivia Feature - Example Response

## Example 1: Educational Question with Trivia

**User asks:** "What is recursion in programming?"

**AI Response:**
```
**Recursion** is a programming technique where a function calls itself to solve a problem by breaking it down into smaller, similar subproblems. Each recursive call works on a simpler version of the problem until reaching a base case that stops the recursion.

Here's a simple example:

```python
def factorial(n):
    # Base case
    if n <= 1:
        return 1
    # Recursive case
    return n * factorial(n - 1)

print(factorial(5))  # Output: 120
```

Key components:
1. **Base case**: Condition that stops recursion
2. **Recursive case**: Function calling itself with modified input
3. **Progress**: Each call moves toward the base case

---TRIVIA---
WHY_IT_MATTERS: Recursion is fundamental to computer science - it's the basis for many algorithms and data structure operations, from tree traversal to dynamic programming.
REAL_WORLD_USE: File system traversal, DOM manipulation in web browsers, JSON parsing, and tree/graph algorithms all rely heavily on recursion.
WHEN_YOU_NEED: You'll use recursion when working with hierarchical data structures, implementing divide-and-conquer algorithms, or during technical interviews.
DID_YOU_KNOW: The concept of recursion predates computers - it was formally studied by mathematician Kurt Gödel in the 1930s as part of his incompleteness theorems.
---END_TRIVIA---
```

**What the user sees:**
- Main answer displays immediately during streaming
- Lightbulb icon appears next to the message
- Clicking the lightbulb reveals the trivia in a popover

---

## Example 2: Simple Question (No Trivia)

**User asks:** "What's 2 + 2?"

**AI Response:**
```
2 + 2 equals 4.
```

**What the user sees:**
- Just the answer, no lightbulb icon
- Clean, simple response

---

## Example 3: Code Debugging (No Trivia)

**User asks:** "Why is my code throwing a TypeError?"

**AI Response:**
```
The TypeError is occurring because you're trying to call `.map()` on `undefined`. 

Looking at your code:
```javascript
const items = data.items.map(...)
```

The issue is that `data.items` is undefined. This usually happens when:
1. The API response doesn't include an `items` property
2. The data hasn't loaded yet

Fix it with optional chaining:
```javascript
const items = data?.items?.map(...) || []
```
```

**What the user sees:**
- Direct debugging help, no trivia
- Focused on solving the problem

---

## How Parsing Works

### During Streaming:
```javascript
// Content arrives in chunks:
"**Recursion** is a programming..."
"...technique where a function..."
"...---TRIVIA---\nWHY_IT_MATTERS: Recursion is..."

// extractStreamingContent() shows only content before ---TRIVIA---
// User sees the answer building up, trivia section is hidden
```

### After Streaming Completes:
```javascript
// parseTriviaResponse() extracts:
{
  content: "**Recursion** is a programming technique...",
  trivia: {
    whyItMatters: "Recursion is fundamental to computer science...",
    realWorldUse: "File system traversal, DOM manipulation...",
    whenYouNeed: "You'll use recursion when working with...",
    didYouKnow: "The concept of recursion predates computers..."
  }
}

// UI updates to show trivia indicator
```
