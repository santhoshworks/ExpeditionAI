# Learning Wishlist Feature

## Overview

The Learning Wishlist is a feature that allows users to capture and organize topics they want to learn about before converting them into full expeditions. It serves as a "learning backlog" where users can:

- **Capture Ideas**: Quickly add learning topics with descriptions, categories, and priorities
- **Organize**: Categorize items by subject area and set priority levels
- **Plan**: Add estimated time requirements and source URLs
- **Convert**: Transform wishlist items into full expeditions when ready to explore

## Key Features

### 1. **Quick Capture**
- Simple form to add learning topics
- Optional fields for detailed planning
- Tag system for better organization

### 2. **Smart Organization**
- **Categories**: Technology, Science, Arts, Business, Health, History, Philosophy, Language, Other
- **Priority Levels**: Critical (1) → High (2) → Medium (3) → Low (4) → Someday (5)
- **Status Tracking**: Active vs Completed items
- **Tags**: Flexible tagging system

### 3. **Rich Metadata**
- **Estimated Time**: Help plan learning sessions
- **Source URLs**: Link to relevant resources
- **Descriptions**: Capture specific interests or goals
- **Creation/Update Timestamps**: Track when items were added

### 4. **Seamless Integration**
- **One-Click Conversion**: Transform wishlist items into expeditions
- **Linked Tracking**: Converted items remain linked to their expeditions
- **Dashboard Integration**: Quick access from main dashboard

### 5. **Filtering & Views**
- Filter by category
- Show/hide completed items
- Priority-based visual indicators
- Responsive grid layout

## Database Schema

```sql
CREATE TABLE learning_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority INTEGER DEFAULT 3, -- 1 (high) to 5 (low)
  source_url TEXT,
  estimated_time TEXT,
  tags TEXT[],
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expedition_id UUID REFERENCES expeditions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## User Experience

### Adding Items
1. Click "Add Learning Item" from dashboard or wishlist page
2. Fill in title (required) and optional metadata
3. Set priority and category for organization
4. Save to wishlist

### Managing Items
- **Mark Complete**: Check off items you've learned about
- **Edit Details**: Update priority, category, or description
- **Delete**: Remove items no longer relevant
- **Filter**: Focus on specific categories or priorities

### Converting to Expeditions
1. Click "Start Expedition" on any wishlist item
2. System creates new expedition with same title/description
3. Creates base camp trail automatically
4. Marks wishlist item as completed and links to expedition
5. Redirects to new expedition for immediate exploration

## Navigation

- **Main Access**: Top navigation bar "Wishlist" link
- **Dashboard Shortcut**: "Wishlist" button on dashboard
- **Direct URL**: `/wishlist`

## Implementation Files

- **Page**: `app/(dashboard)/wishlist/page.tsx`
- **Database Types**: `types/database.ts` (LearningWishlistItem)
- **Queries**: `lib/queries.ts` (wishlist CRUD operations)
- **Migration**: `supabase/migrations/add_learning_wishlist.sql`
- **UI Components**: `components/ui/select.tsx` (new)
- **Navigation**: Updated `components/layout/topbar.tsx`

## Benefits

1. **Reduces Friction**: Capture learning ideas without committing to full expeditions
2. **Better Planning**: Organize and prioritize learning goals
3. **Resource Management**: Track time estimates and source materials
4. **Seamless Workflow**: Easy conversion to expeditions when ready
5. **Progress Tracking**: See what you've planned vs. what you've explored

This feature bridges the gap between having a learning idea and starting a full exploration, making the platform more comprehensive for managing one's learning journey.