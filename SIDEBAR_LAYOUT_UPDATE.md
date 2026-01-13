# Sidebar Layout Update

## Overview
Updated the application layout from a top navigation to a sidebar layout similar to ChatGPT for better chat visibility and improved user experience.

## Changes Made

### 1. Dashboard Layout (`app/(dashboard)/layout.tsx`)
- **Before**: Vertical flex layout with topbar only
- **After**: Horizontal flex layout with sidebar + topbar
- Added sidebar integration alongside the existing topbar
- Improved responsive design for mobile and desktop

### 2. Topbar Component (`components/layout/topbar.tsx`)
- **Removed**: Duplicate navigation items (Dashboard, Wishlist, Settings)
- **Kept**: Search functionality, theme toggle, notifications, user menu
- **Added**: Page title and context display
- **Improved**: More compact design to work alongside sidebar
- Reduced height from `h-16` to `h-14` for better space utilization

### 3. Sidebar Component (`components/layout/sidebar.tsx`)
- **Added**: Wishlist navigation item
- **Enhanced**: Mobile responsiveness with overlay functionality
- **Maintained**: Existing collapse/expand functionality
- **Improved**: Better integration with the main layout

### 4. Expedition Page (`app/(dashboard)/expedition/[id]/page.tsx`)
- **Removed**: Redundant sub-header with back button
- **Streamlined**: Chat interface for maximum visibility
- **Improved**: Trail navigation sidebar (hidden on mobile < lg)
- **Added**: Mobile trail selector dialog
- **Enhanced**: More compact header design
- **Better**: Chat area now has more screen real estate

### 5. New Components Created

#### Wishlist Page (`app/(dashboard)/wishlist/page.tsx`)
- Complete wishlist functionality
- Add/remove learning goals
- Priority system
- Integration with expedition creation

#### Mobile Trail Selector (`components/trail/mobile-trail-selector.tsx`)
- Dialog-based trail navigation for mobile devices
- Integrated with existing MiniTree component
- Generate topics functionality

## Benefits

### 1. Improved Chat Visibility
- Chat interface now has significantly more horizontal space
- Removed redundant navigation elements
- Streamlined header design

### 2. Better Navigation
- Consistent sidebar navigation across all pages
- Clear visual hierarchy
- Mobile-responsive design

### 3. Enhanced User Experience
- ChatGPT-like layout familiarity
- Reduced cognitive load with cleaner interface
- Better space utilization on all screen sizes

### 4. Mobile Optimization
- Sidebar collapses to overlay on mobile
- Mobile trail selector for expedition pages
- Responsive design throughout

## Layout Structure

```
┌─────────────────────────────────────────┐
│ Sidebar │ Topbar (Page Title + Utils)   │
│         ├─────────────────────────────────┤
│ - Dash  │                               │
│ - Wish  │        Main Content           │
│ - Set   │      (Chat Interface)         │
│         │                               │
│ [User]  │                               │
└─────────────────────────────────────────┘
```

## Mobile Layout

```
┌─────────────────────────────────────────┐
│ [☰] Page Title              [🔍][👤]   │
├─────────────────────────────────────────┤
│                                         │
│           Main Content                  │
│         (Chat Interface)                │
│                                         │
└─────────────────────────────────────────┘
```

## Technical Details

- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS with custom components
- **Responsive**: Mobile-first design approach
- **Components**: Modular component architecture
- **State**: Zustand store integration maintained

## Files Modified

1. `app/(dashboard)/layout.tsx` - Main layout integration
2. `components/layout/topbar.tsx` - Streamlined topbar
3. `components/layout/sidebar.tsx` - Enhanced sidebar
4. `app/(dashboard)/expedition/[id]/page.tsx` - Chat-focused layout
5. `app/(dashboard)/wishlist/page.tsx` - New wishlist page
6. `components/trail/mobile-trail-selector.tsx` - New mobile component

## Testing

All components pass TypeScript diagnostics with no errors. The layout is ready for testing in development mode.