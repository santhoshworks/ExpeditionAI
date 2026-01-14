# Trivia Feature - UI Preview

## What Users See

### Before Clicking (Message with Trivia)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  💡  ┌──────────────────────────────────────────────────┐  │
│      │ **Recursion** is a programming technique where   │  │
│      │ a function calls itself to solve a problem...    │  │
│      │                                                   │  │
│      │ Here's a simple example:                         │  │
│      │                                                   │  │
│      │ ```python                                        │  │
│      │ def factorial(n):                                │  │
│      │     if n <= 1:                                   │  │
│      │         return 1                                 │  │
│      │     return n * factorial(n - 1)                  │  │
│      │ ```                                              │  │
│      │                                                   │  │
│      │ Key components:                                  │  │
│      │ 1. Base case: Stops recursion                    │  │
│      │ 2. Recursive case: Calls itself                  │  │
│      │ 3. Progress: Moves toward base case              │  │
│      └──────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
       ↑
   Lightbulb glows amber - click to see trivia!
```

### After Clicking (Trivia Popover)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  💡  ┌──────────────────────────────────────────────────┐  │
│   ╔══│══════════════════════════════════════════════════│══╗
│   ║  │ **Recursion** is a programming technique...     │  ║
│   ║  └──────────────────────────────────────────────────┘  ║
│   ║                                                         ║
│   ║  ┌─────────────────────────────────────────────────┐   ║
│   ║  │ 🎯 Why This Matters                             │   ║
│   ║  │ Recursion is fundamental to computer science -  │   ║
│   ║  │ it's the basis for many algorithms and data     │   ║
│   ║  │ structure operations.                           │   ║
│   ║  │                                                 │   ║
│   ║  │ 🌍 Real-World Use                               │   ║
│   ║  │ File system traversal, DOM manipulation,       │   ║
│   ║  │ JSON parsing, and tree/graph algorithms all    │   ║
│   ║  │ rely heavily on recursion.                     │   ║
│   ║  │                                                 │   ║
│   ║  │ ⏰ When You'd Need This                         │   ║
│   ║  │ You'll use recursion when working with         │   ║
│   ║  │ hierarchical data, implementing divide-and-    │   ║
│   ║  │ conquer algorithms, or during interviews.      │   ║
│   ║  │                                                 │   ║
│   ║  │ 💡 Did You Know?                                │   ║
│   ║  │ The concept of recursion predates computers -  │   ║
│   ║  │ it was formally studied by mathematician Kurt  │   ║
│   ║  │ Gödel in the 1930s as part of his theorems.   │   ║
│   ║  └─────────────────────────────────────────────────┘   ║
│   ╚═════════════════════════════════════════════════════════╝
│                    ↑
│              Trivia popover appears above/below message
│
└─────────────────────────────────────────────────────────────┘
```

### Message WITHOUT Trivia (Simple Question)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│      ┌──────────────────────────────────────────────────┐  │
│      │ 2 + 2 equals 4.                                  │  │
│      └──────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
       ↑
   No lightbulb - simple answer doesn't need trivia
```

## Streaming Behavior

### Phase 1: Answer Streaming
```
┌─────────────────────────────────────────────────────────────┐
│      ┌──────────────────────────────────────────────────┐  │
│      │ **Recursion** is a programming technique where   │  │
│      │ a function calls itself to solve a problem...█   │  │
│      └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                                          ↑
                                              Text streaming in
```

### Phase 2: Trivia Arrives (Hidden)
```
┌─────────────────────────────────────────────────────────────┐
│      ┌──────────────────────────────────────────────────┐  │
│      │ **Recursion** is a programming technique where   │  │
│      │ a function calls itself to solve a problem...    │  │
│      │                                                   │  │
│      │ [Full answer with code examples]                 │  │
│      └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
       ↑
   Trivia section received but hidden from user
```

### Phase 3: Complete (Lightbulb Appears)
```
┌─────────────────────────────────────────────────────────────┐
│  💡  ┌──────────────────────────────────────────────────┐  │
│      │ **Recursion** is a programming technique where   │  │
│      │ a function calls itself to solve a problem...    │  │
│      │                                                   │  │
│      │ [Full answer with code examples]                 │  │
│      └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
       ↑
   Lightbulb appears - trivia ready to view!
```

## Mobile View

### Collapsed (Default)
```
┌──────────────────────────┐
│                          │
│ 💡 ┌──────────────────┐  │
│    │ **Recursion** is │  │
│    │ a programming    │  │
│    │ technique...     │  │
│    │                  │  │
│    │ [Answer text]    │  │
│    └──────────────────┘  │
│                          │
└──────────────────────────┘
```

### Trivia Popover (Fullscreen on Mobile)
```
┌──────────────────────────┐
│ ╔══════════════════════╗ │
│ ║ 🎯 Why This Matters  ║ │
│ ║ Recursion is...      ║ │
│ ║                      ║ │
│ ║ 🌍 Real-World Use    ║ │
│ ║ File system...       ║ │
│ ║                      ║ │
│ ║ ⏰ When You Need     ║ │
│ ║ You'll use...        ║ │
│ ║                      ║ │
│ ║ 💡 Did You Know?     ║ │
│ ║ The concept...       ║ │
│ ║                      ║ │
│ ║      [Close]         ║ │
│ ╚══════════════════════╝ │
└──────────────────────────┘
```

## Accessibility

- **Keyboard**: Tab to lightbulb, Enter/Space to open
- **Screen Reader**: "View trivia" button, reads all trivia sections
- **Focus**: Visible focus ring on lightbulb
- **Color**: Amber glow doesn't rely on color alone (icon shape visible)

## Visual States

### Lightbulb States
```
Default:     💡 (amber, subtle glow)
Hover:       💡 (amber, brighter glow)
Active:      💡 (amber, brightest glow)
Focus:       💡 (amber, with focus ring)
```

### Animation
- Lightbulb fades in smoothly when trivia is ready
- Popover slides in with subtle animation
- Glow pulses gently to draw attention

## Color Scheme

- **Lightbulb**: Amber (#F59E0B)
- **Background**: Amber with 10% opacity
- **Hover**: Amber with 20% opacity
- **Glow**: Amber with soft shadow
- **Popover**: Card background with border
