# 🚀 Quick Tier Testing

## Super Fast Method

Just add to your URL:

```
http://localhost:3000?tier=free
http://localhost:3000?tier=basic
http://localhost:3000?tier=pro
```

That's it! Refresh and you're in that tier. 🎉

**Works everywhere:** The tier override is automatically sent to the server, so both client-side UI and server-side validation use the test tier.

## Console Method

Press F12, then:

```javascript
window.setTestTier('pro')    // Switch to pro
window.clearTestTier()       // Back to normal
```

Refresh the page.

## What You'll See

- **Yellow badge** in bottom-right when override is active
- **Different models** based on tier
- **Different credits** (0 for free, 200 for basic, 700 for pro)

## Quick Test

1. Go to `http://localhost:3000?tier=free`
2. Check model selector - should see 4 free models
3. Go to `http://localhost:3000?tier=pro`
4. Check model selector - should see all models including GPT-4o

Done! No database changes needed.
