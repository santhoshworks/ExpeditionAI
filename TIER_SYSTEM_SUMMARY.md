# 🎯 Tier System - Complete Summary

## What We Built

A complete local tier override system for testing different subscription tiers without touching the database.

---

## 📁 Files Created/Modified

### New Files
1. **`lib/tier-override.ts`** - Core tier override logic
   - Client-side: Query params & localStorage
   - Server-side: Request header reading
   - Window functions for console access

2. **`components/tier-override-indicator.tsx`** - Visual indicator
   - Yellow badge in bottom-right corner
   - Shows current test tier and credits
   - Click X to clear override

3. **`TIER_TESTING.md`** - Full documentation
4. **`QUICK_TIER_TEST.md`** - Quick reference
5. **`TEST_TIER_CHECKLIST.md`** - Testing checklist

### Modified Files
1. **`lib/queries.ts`** - Apply tier override to user credits query
2. **`lib/constants.ts`** - Updated free tier models (4 models now)
3. **`components/chat/chat-interface.tsx`** - Send tier override header
4. **`app/api/chat/route.ts`** - Read tier override from headers
5. **`app/layout.tsx`** - Added tier override indicator
6. **`package.json`** - (Cleaned up, removed SQL scripts)

---

## 🚀 How to Use

### Method 1: Query Parameters (Easiest)
```
http://localhost:3000?tier=free
http://localhost:3000?tier=basic
http://localhost:3000?tier=pro
```

### Method 2: Browser Console
```javascript
window.setTestTier('pro')    // Set tier
window.getTestTier()         // Check tier
window.clearTestTier()       // Clear override
```

### Method 3: Bookmarklets
```javascript
javascript:window.setTestTier('pro');location.reload()
```

---

## 🎨 Visual Feedback

When tier override is active, you'll see:

```
┌─────────────────────────────────┐
│ 🧪 TEST MODE                    │
│ Tier: pro • Credits: 700     [X]│
└─────────────────────────────────┘
```

Yellow badge in bottom-right corner with:
- Test mode indicator (🧪)
- Current tier
- Current credits
- Close button to clear override

---

## 🔄 How It Works

### Client Side
1. User sets tier via URL or console
2. `getTierOverride()` reads from query params or localStorage
3. `applyTierOverride()` modifies user credits query result
4. UI updates to show correct models and credits
5. Visual indicator appears

### Server Side
1. Client sends tier in `x-test-tier` header
2. Server reads header with `getTierOverrideFromHeaders()`
3. Server uses test tier for validation
4. User can access tier-appropriate models
5. No database changes needed

### Priority Order
1. **Query params** (highest) - `?tier=pro`
2. **localStorage** (medium) - `window.setTestTier('pro')`
3. **Database** (lowest) - Real user tier

---

## 📊 Tier Configurations

| Tier | Credits | Trails/Day | Models | Cost |
|------|---------|------------|--------|------|
| **Free** | 0 | 15 | 4 free models | $0 |
| **Basic** | 200 | ∞ | Free + 4 fast models | $5 |
| **Pro** | 700 | ∞ | All 13 models | $15 |

### Free Tier Models (4)
- Mistral Devstral 2512 (Very Fast) ⭐ Recommended
- Xiaomi MiMo V2 Flash (Very Fast)
- NVIDIA Nemotron 3 Nano (Fast)
- DeepSeek R1 (Fast)

### Basic Tier Models (+4)
- Gemini 2.0 Flash (Very Fast) ⭐ Recommended
- Gemini 2.0 Flash Lite (Very Fast)
- GPT-4o Mini (Fast)
- Claude 3.5 Haiku (Fast)

### Pro Tier Models (+5)
- Gemini 2.5 Flash (Fast)
- Gemini 1.5 Pro (Medium)
- GPT-4o (Medium) 💎 Premium
- Claude 3.5 Sonnet (Medium)

---

## ✅ Benefits

1. **No Database Changes** - Test without affecting real data
2. **Instant Switching** - Change tiers in seconds
3. **Multiple Tabs** - Test different tiers simultaneously
4. **Visual Feedback** - Always know when in test mode
5. **Easy Reset** - One click to clear override
6. **Full Stack** - Works on both client and server
7. **Persistent** - localStorage keeps settings across refreshes
8. **Safe** - Can't accidentally affect production data

---

## 🧪 Testing Workflow

```
1. Start app: npm run dev
2. Open: http://localhost:3000?tier=free
3. Verify: See 4 free models only
4. Switch: http://localhost:3000?tier=pro
5. Verify: See all 13 models
6. Test: Send message with GPT-4o
7. Success: No "requires higher tier" error!
```

---

## 🐛 Common Issues & Solutions

### Issue: "Model requires higher tier"
**Solution:** Make sure yellow badge is visible showing correct tier

### Issue: Badge not showing
**Solution:** Hard refresh (Ctrl+Shift+R) or check console for errors

### Issue: Models not updating
**Solution:** Refresh page after setting tier

### Issue: Override not working
**Solution:** Check `window.getTestTier()` in console

### Issue: Want to reset everything
**Solution:** `window.clearTestTier()` + refresh

---

## 🎓 Key Concepts

### Client-Side Override
- Reads from URL query params or localStorage
- Modifies React Query data before rendering
- Shows visual indicator
- Sends header to server

### Server-Side Override
- Reads from request headers
- Overrides database tier for validation
- Allows access to tier-appropriate models
- No database writes

### Separation of Concerns
- **UI Layer:** Shows correct models based on tier
- **API Layer:** Validates model access based on tier
- **Database Layer:** Unchanged, stores real tier
- **Override Layer:** Intercepts both UI and API

---

## 📚 Documentation Files

- **`TIER_TESTING.md`** - Complete guide with all methods
- **`QUICK_TIER_TEST.md`** - Quick 30-second reference
- **`TEST_TIER_CHECKLIST.md`** - Step-by-step testing guide
- **`TIER_SYSTEM_SUMMARY.md`** - This file (overview)

---

## 🎉 Success!

You can now test all tier behaviors instantly without:
- ❌ SQL scripts
- ❌ Database changes
- ❌ Service role keys
- ❌ Complex setup

Just add `?tier=pro` to your URL and start testing! 🚀
