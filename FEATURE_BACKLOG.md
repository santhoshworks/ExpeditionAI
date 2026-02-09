# ThoughtMap - Feature Backlog

> This file tracks planned features for the spaced repetition system.
> Claude can pick up and continue implementation from this list.

## Status Legend
- 🟢 **Done** - Fully implemented
- 🟡 **In Progress** - Currently being worked on
- 🔴 **Not Started** - Planned but not implemented

---

## Tier 1: Critical (Must Have to Compete with Anki)

| Feature | Status | Files/Notes |
|---------|--------|-------------|
| FSRS Algorithm | 🟢 Done | `lib/flashcards/fsrs.ts` |
| Daily Review Queue | 🟢 Done | `app/review/page.tsx` |
| Feature Flag System | 🟢 Done | `NEXT_PUBLIC_ENABLE_SPACED_REPETITION` env var |
| Auto-save flashcards | 🟢 Done | `app/api/flashcards/generate/route.ts` |
| Anki .apkg Import | 🟢 Done | `app/api/import/anki/route.ts`, `app/(dashboard)/import/page.tsx` |

**Note:** Anki import requires: `npm install jszip sql.js`

---

## Tier 2: Differentiators (Win Users Over)

| Feature | Status | Files/Notes |
|---------|--------|-------------|
| AI Card Generation from Text/URL | 🟢 Done | `app/(dashboard)/create-deck/page.tsx`, `app/api/flashcards/generate-from-content/route.ts` |
| AI Card Generation from PDF | 🟢 Done | PDF tab in create-deck page, `app/api/import/pdf/route.ts` |
| AI Card Enhancement | 🟢 Done | `app/api/flashcards/enhance/route.ts`, UI in create-deck + review pages |
| Image Occlusion Editor | 🔴 Not Started | Canvas-based, fabric.js/konva |
| Cloze Deletions | 🔴 Not Started | `{{c1::text}}` syntax support |

**Note:** PDF import requires: `npm install pdf-parse`

---

## Tier 3: Community & Growth

| Feature | Status | Files/Notes |
|---------|--------|-------------|
| Public Deck Marketplace | 🔴 Not Started | New tables: public_decks, deck_downloads |
| Pre-made Starter Decks | 🔴 Not Started | Medical, Language, Programming categories |
| Study Groups | 🔴 Not Started | Group creation, shared progress |
| Leaderboards | 🔴 Not Started | Weekly cards reviewed, streaks |

---

## Tier 4: Polish & Delight

| Feature | Status | Files/Notes |
|---------|--------|-------------|
| Keyboard Shortcuts | 🟢 Partial | Review page only, need global shortcuts |
| Advanced Statistics Dashboard | 🔴 Not Started | Retention graphs, heatmaps, forecasts |
| Mobile PWA Optimization | 🔴 Not Started | Offline review, push notifications |
| Card Tagging System | 🔴 Not Started | Schema has tags[], need UI |
| Deck Organization | 🔴 Not Started | Folders, favorites, archives |

---

## Implementation Notes

### Anki Import (.apkg)
- .apkg files are ZIP archives containing SQLite + media
- Parse `collection.anki2` database
- Map Anki note types to our card schema
- Handle media files (images, audio)
- Key tables: `notes`, `cards`, `revlog`

### AI Card Generation (Done)
- Paste text → extract key facts → generate cards
- URL → fetch content → generate cards
- PDF upload → extract text → generate cards
- AI suggests card importance levels and tags

### AI Card Enhancement (Done)
- 6 enhancement modes: Improve Clarity, Add Context, Make Harder, Make Easier, Add Mnemonics, Split Card
- Available in create-deck results and during review
- Split Card suspends original and creates focused sub-cards
- `app/api/flashcards/enhance/route.ts`

### Image Occlusion
- Use canvas library (fabric.js or konva)
- Store occlusion coordinates in card metadata
- Support multiple occlusion types (one-by-one, all-at-once)
- Critical for medical students (anatomy diagrams)

### Cloze Deletions
- Parse `{{c1::answer}}` syntax
- Support multiple cloze per card
- AI can auto-suggest which words to cloze
- Type-in answer validation

---

## Database Schema (Already Created)

Tables in `supabase/migrations/add_flashcard_srs.sql`:
- `flashcard_decks` - Deck metadata
- `flashcards` - Cards with FSRS fields
- `flashcard_reviews` - Review history
- `user_srs_settings` - User preferences
- `study_sessions` - Session tracking
- `learning_streaks` - Streak tracking

---

## Navigation & UI

The following pages have been added:
- `/review` - Daily review queue with keyboard shortcuts + card enhancement
- `/create-deck` - AI card generation from text/URL/PDF + card enhancement
- `/import` - Anki .apkg file import

Sidebar navigation is in `components/layout/sidebar.tsx` and shows "Study Tools" section when `NEXT_PUBLIC_ENABLE_SPACED_REPETITION=true`.

Dashboard widget (`components/flashcard/due-cards-widget.tsx`) shows due cards count.

---

## Quick Start for New Session

To continue implementation, Claude should:

1. Read this file to understand status
2. Read relevant existing files:
   - `lib/flashcards/fsrs.ts` - Core algorithm
   - `lib/flashcards/scheduler.ts` - Queue management
   - `app/review/page.tsx` - Review UI reference
3. Pick next 🔴 feature and implement
4. Update this file with status changes

---

*Last updated: 2026-02-05*
