# Sidebar Fixes Testing Guide

## Changes Made:

### 1. **Auto-collapse on Expedition Pages**
- The sidebar now automatically collapses when navigating to expedition pages
- This provides more space for the chat interface and trail navigation

### 2. **User Name Display**
- Fixed the hardcoded "User Account" text
- Now displays the user's actual full name from their profile
- Falls back to email username if no full name is set
- Shows the user's actual tier (free/basic/pro) instead of "Premium Plan"

## How to Test:

### Test 1: Sidebar Auto-collapse
1. Go to the dashboard (`/dashboard`)
2. Verify the sidebar is expanded by default
3. Navigate to any expedition page (`/expedition/[id]`)
4. **Expected**: Sidebar should automatically collapse to give more space for the chat
5. Navigate back to dashboard
6. **Expected**: Sidebar should remain in its previous state

### Test 2: User Name Display
1. Look at the bottom of the sidebar (profile section)
2. **Expected**: Should show your actual name instead of "User Account"
3. **Expected**: Should show your actual tier (e.g., "Pro Plan") instead of "Premium Plan"

### Test 3: Manual Collapse/Expand
1. Use the collapse button (arrow icon) on the right side of the sidebar
2. **Expected**: Should work normally on all pages
3. **Expected**: State should be preserved when navigating between non-expedition pages

## Fallback Behavior:

- If no full name is set: Shows the part before @ in the email
- If no tier info: Falls back to "Premium Plan"
- If user data is loading: Shows "User Account" temporarily

## Technical Details:

- User data is fetched from both `profiles` and `user_credits` tables
- Auto-collapse only triggers on expedition pages (`/expedition/`)
- The collapse state is managed independently for manual vs automatic collapse