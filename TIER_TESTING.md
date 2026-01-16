# 🧪 Testing Different User Tiers (Local Override)

Quick and easy way to test different tier behaviors without touching the database!

## 🚀 Three Ways to Change Tier

### 1. Query Parameters (Easiest!)

Just add `?tier=` to your URL:

```
http://localhost:3000?tier=free
http://localhost:3000?tier=basic
http://localhost:3000?tier=pro
```

Refresh the page and you'll instantly be in that tier! 🎉

### 2. Browser Console

Open your browser console (F12) and type:

```javascript
// Change to pro tier
window.setTestTier('pro')

// Change to basic tier
window.setTestTier('basic')

// Change to free tier
window.setTestTier('free')

// Check current override
window.getTestTier()

// Clear override (use real database tier)
window.clearTestTier()
```

Then refresh the page.

### 3. Bookmarklets (Super Quick!)

Create bookmarks with these URLs for one-click tier switching:

```javascript
javascript:window.setTestTier('free');location.reload()
javascript:window.setTestTier('basic');location.reload()
javascript:window.setTestTier('pro');location.reload()
javascript:window.clearTestTier();location.reload()
```

## 📊 What Each Tier Gives You

| Tier  | Credits | Trails/Day | Models Available |
|-------|---------|------------|------------------|
| **Free**  | 0       | 15         | 4 free models (Mistral, Xiaomi, NVIDIA, DeepSeek) |
| **Basic** | 200     | Unlimited  | Free + Gemini Flash, GPT-4o Mini, Claude Haiku |
| **Pro**   | 700     | Unlimited  | All models including GPT-4o, Claude Sonnet |

## 🧪 Testing Workflow

1. **Start with query param:**
   ```
   http://localhost:3000?tier=free
   ```
   ✅ Should see only 4 free models
   ✅ Should show 15 trails/day limit

2. **Switch to basic:**
   ```
   http://localhost:3000?tier=basic
   ```
   ✅ Should see free + basic tier models
   ✅ Should show 200 credits
   ✅ No daily trail limit

3. **Switch to pro:**
   ```
   http://localhost:3000?tier=pro
   ```
   ✅ Should see all models
   ✅ Should show 700 credits
   ✅ Can select premium models like GPT-4o

4. **Back to real tier:**
   ```
   http://localhost:3000
   ```
   (or use `window.clearTestTier()` in console)

## 💡 How It Works

- Query params take precedence over localStorage
- localStorage persists between page loads
- Your real database tier is never changed
- Override is only active in your browser
- Console shows a 🧪 indicator when override is active

## 🔍 Checking Override Status

Open console and look for:
```
🧪 TEST MODE: Using tier override
   Tier: pro
   Credits: 700
   Clear with: window.clearTestTier()
```

Or check programmatically:
```javascript
window.getTestTier()
// Returns: { tier: 'pro', credits: 700, trailsToday: 0 }
// Or null if no override
```

## 🎯 Pro Tips

1. **Quick testing:** Use query params for one-off tests
2. **Persistent testing:** Use console commands for longer sessions
3. **Multiple tabs:** Each tab can have different tiers!
4. **No cleanup needed:** Just close the tab or clear override

## ⚠️ Important Notes

- This is **client-side only** - doesn't affect your database
- Other users won't see your override
- Server-side checks still use your real tier
- Perfect for UI/UX testing, not for bypassing actual limits
- Credits are simulated - deductions won't persist

## 🐛 Troubleshooting

**Override not working?**
- Make sure you refreshed the page after setting
- Check console for the 🧪 TEST MODE message
- Try clearing cache (Ctrl+Shift+R)

**Models not showing?**
- Verify tier is set: `window.getTestTier()`
- Check that model selector is re-rendering
- Look for errors in console

**Want to reset everything?**
```javascript
window.clearTestTier()
localStorage.clear()
location.reload()
```
