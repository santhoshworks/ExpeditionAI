# ✅ Tier Testing Checklist

Quick checklist to verify tier override is working correctly.

## 🧪 Test 1: Free Tier

1. Go to: `http://localhost:3000?tier=free`
2. Look for yellow badge in bottom-right: "🧪 TEST MODE - Tier: free • Credits: 0"
3. Open model selector
4. **Expected:** See only 4 models:
   - ✅ Mistral Devstral 2512 (Free)
   - ✅ Xiaomi MiMo V2 Flash (Free)
   - ✅ NVIDIA Nemotron 3 Nano (Free)
   - ✅ DeepSeek R1 (Free)
5. Try sending a message with any free model
6. **Expected:** Message sends successfully

---

## 🧪 Test 2: Basic Tier

1. Go to: `http://localhost:3000?tier=basic`
2. Look for yellow badge: "🧪 TEST MODE - Tier: basic • Credits: 200"
3. Open model selector
4. **Expected:** See free models + basic models:
   - ✅ All 4 free models
   - ✅ Gemini 2.0 Flash (Fast)
   - ✅ Gemini 2.0 Flash Lite (Fast)
   - ✅ GPT-4o Mini
   - ✅ Claude 3.5 Haiku
5. Select "Gemini 2.0 Flash"
6. Send a message
7. **Expected:** Message sends successfully (no "requires higher tier" error)

---

## 🧪 Test 3: Pro Tier

1. Go to: `http://localhost:3000?tier=pro`
2. Look for yellow badge: "🧪 TEST MODE - Tier: pro • Credits: 700"
3. Open model selector
4. **Expected:** See ALL models including:
   - ✅ All free models
   - ✅ All basic models
   - ✅ Gemini 2.5 Flash (Pro)
   - ✅ Gemini 1.5 Pro (Pro)
   - ✅ GPT-4o (Premium)
   - ✅ Claude 3.5 Sonnet (Pro)
5. Select "GPT-4o" or "Gemini 2.5 Flash"
6. Send a message
7. **Expected:** Message sends successfully with premium model

---

## 🧪 Test 4: Console Commands

1. Open browser console (F12)
2. Type: `window.setTestTier('pro')`
3. **Expected:** See message "✅ Test tier set to: pro"
4. Refresh page
5. **Expected:** Yellow badge shows "Tier: pro"
6. Type: `window.getTestTier()`
7. **Expected:** Returns `{ tier: 'pro', credits: 700, trailsToday: 0 }`
8. Type: `window.clearTestTier()`
9. **Expected:** See message "✅ Test tier override cleared"
10. Refresh page
11. **Expected:** No yellow badge, back to real database tier

---

## 🧪 Test 5: Clear Override

1. Set any tier override (URL or console)
2. Click the **X button** on the yellow badge
3. **Expected:** Page refreshes and badge disappears
4. **Expected:** Back to using real database tier

---

## 🧪 Test 6: Persistence

1. Set tier via console: `window.setTestTier('basic')`
2. Refresh page
3. **Expected:** Still shows "Tier: basic"
4. Open new tab to same URL (without ?tier param)
5. **Expected:** New tab also shows "Tier: basic" (localStorage persists)
6. Add `?tier=pro` to URL
7. **Expected:** Query param overrides localStorage, shows "Tier: pro"

---

## 🐛 Troubleshooting

### Badge not showing?
- Check console for errors
- Verify you're on a page with the layout (not auth pages)
- Try hard refresh (Ctrl+Shift+R)

### Models not changing?
- Make sure you refreshed after setting tier
- Check that yellow badge shows correct tier
- Verify in console: `window.getTestTier()`

### "Requires higher tier" error?
- Check that yellow badge is visible
- Verify tier in badge matches model requirement
- Check browser console for errors
- Try clearing and resetting: `window.clearTestTier()` then `window.setTestTier('pro')`

### Override not persisting?
- Query params don't persist (by design)
- Use console commands for persistent override
- Check localStorage: `localStorage.getItem('test_tier_override')`

---

## 📊 Quick Reference

| Method | Persistence | Priority |
|--------|-------------|----------|
| `?tier=pro` | No (URL only) | Highest |
| `window.setTestTier('pro')` | Yes (localStorage) | Medium |
| Database tier | Yes (permanent) | Lowest |

**Priority:** Query param > localStorage > Database

---

## ✨ Pro Tips

1. **Bookmarklets:** Create browser bookmarks for instant tier switching
2. **Multiple tabs:** Each tab can test different tiers simultaneously
3. **Quick reset:** Just remove `?tier=` from URL to use localStorage tier
4. **Full reset:** `window.clearTestTier()` to go back to database tier
5. **Check anytime:** `window.getTestTier()` shows current override

---

## 🎯 Success Criteria

All tests pass when:
- ✅ Yellow badge appears with correct tier
- ✅ Model selector shows correct models for each tier
- ✅ Messages send successfully with tier-appropriate models
- ✅ No "requires higher tier" errors when using override
- ✅ Console commands work as expected
- ✅ Override persists across page refreshes (when using localStorage)
- ✅ Can clear override and return to normal
