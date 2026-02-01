# PDF Textbook Learning Feature Design

## Overview

Students can upload textbooks as PDFs, which are automatically parsed into interactive learning expeditions. Each selected chapter/section becomes a trail with AI-generated explanations and interactive follow-up questioning.

**Target Users:** School and college students learning from textbooks

**Goal:** Enable self-paced, AI-guided learning through structured exploration of textbook content

---

## Architecture

### Data Model

```
PDF Upload (1)
    ↓
Expedition (1) → Trails (many)
    ↓
pdf_sources table (references both)
```

**New Table: `pdf_sources`**
```sql
CREATE TABLE pdf_sources (
  id UUID PRIMARY KEY,
  expedition_id UUID REFERENCES expeditions(id),
  trail_id UUID REFERENCES trails(id),
  pdf_filename TEXT,
  page_start INTEGER,
  page_end INTEGER,
  section_title TEXT,
  extracted_content TEXT,
  created_at TIMESTAMP
)
```

### Integration Points

- **PDF Parsing:** Existing document-parser API (document-parser-api-production-4525.up.railway.app)
- **Structure Analysis:** LLM identifies chapters/sections from raw text
- **Trail Creation:** Reuses existing expedition/trail infrastructure
- **Chat Context:** Each trail has section content injected into LLM context for follow-ups

---

## User Flow

### 1. Upload & Parse
- User clicks "Upload PDF" in "Start New Expedition" modal
- PDF sent to document-parser API
- Returns raw extracted text with metadata

### 2. Structure Discovery
- LLM analyzes text: "Identify chapters, sections, key topics. Return JSON."
- LLM response: `{chapters: [{title, sections: [{title, summary}]}]}`
- Checkbox tree UI built from this structure

### 3. User Selection
- Student expands/collapses chapters
- Selects which sections to learn (checkboxes)
- No preview component (they already have the PDF)

### 4. Trail Creation
- Student confirms and clicks "Create Expedition"
- System creates:
  - One Expedition (per PDF)
  - Multiple Trails (one per selected section)
  - Base Camp trail = PDF overview
  - Entries in `pdf_sources` table
- Async job queued: Generate AI explanation for each trail

### 5. Learning Experience
- When student opens a trail:
  - Loads chat interface
  - Shows auto-generated AI explanation (or "Generating..." if still processing)
  - Ready for follow-up questions
  - Section content injected into LLM context for accurate responses

---

## API Endpoints

### POST `/api/pdf/parse`
**Purpose:** Parse PDF and extract structure

**Request:**
```json
{
  "file": <File>,
  "expeditionTitle": "Physics 101"
}
```

**Response:**
```json
{
  "fileName": "physics_textbook.pdf",
  "pageCount": 250,
  "chapters": [
    {
      "id": "ch1",
      "title": "Chapter 1: Mechanics",
      "sections": [
        {
          "id": "ch1_s1",
          "title": "1.1 Forces and Motion",
          "summary": "Introduction to Newton's laws..."
        }
      ]
    }
  ]
}
```

### POST `/api/pdf/create-expedition`
**Purpose:** Create expedition with selected sections as trails

**Request:**
```json
{
  "expeditionTitle": "Physics 101",
  "pdfFileName": "physics_textbook.pdf",
  "selectedSections": ["ch1_s1", "ch1_s2", "ch2_s1"],
  "extractedContent": "...", // Full parsed text
  "metadata": { "pageCount": 250 }
}
```

**Response:**
```json
{
  "expeditionId": "exp_123",
  "trailIds": ["trail_1", "trail_2", "trail_3"],
  "status": "created",
  "message": "Generating explanations... (async)"
}
```

### POST `/api/trails/{trailId}/auto-explain` (Internal/Async)
**Purpose:** Generate AI explanation for a trail

**Process:**
1. Fetch section content from `pdf_sources`
2. Send to LLM: "Explain this section for a student in an engaging way"
3. Save response as first assistant message in chat
4. Mark trail as ready

---

## Frontend Components

### Modified Components
- **"Start New Expedition" Modal** - Add "Upload PDF" tab alongside "Manual Topic"

### New Components
- **PDFUploadForm** - File upload, shows upload progress
- **StructureCheckboxTree** - Renders chapter/section hierarchy with checkboxes
- **PDFLoadingState** - Shows "Parsing PDF..." and "Analyzing structure..." states

### Modified: ChatInterface
- When opening PDF-sourced trail:
  - Check if auto-explanation exists
  - If yes: render as first message
  - If no: show "Generating explanation..."
  - Include section content in system prompt for follow-ups

---

## Data Flow

```
Student uploads PDF
    ↓
POST /api/pdf/parse
    ├→ Call document-parser API (raw text extraction)
    ├→ Send to LLM (structure analysis)
    └→ Return structured chapters/sections
    ↓
Show checkbox tree UI
    ↓
Student selects sections
    ↓
POST /api/pdf/create-expedition
    ├→ Create Expedition
    ├→ Create Trails (one per section)
    ├→ Store in pdf_sources table
    └→ Queue async: generateExplanation for each trail
    ↓
Expedition created and visible
    ↓
Student opens trail
    ├→ Check pdf_sources for auto-explanation
    ├→ If ready: Show it
    └→ If generating: Show spinner with compass
    ↓
Student asks follow-up questions
    └→ LLM uses section content as context
```

---

## Storage & Efficiency

**Only store:**
- Selected sections (student chooses what to learn)
- PDF metadata (filename, upload date, page ranges)
- Section mappings (which trail = which content)
- AI explanations (generated once, reused)

**Don't store:**
- Unselected content (prevents data explosion)
- Full PDF file (only extracted text chunks)
- Duplicate explanations (generated once per trail)

---

## Error Handling

1. **PDF Parse Fails**
   - Show error: "Couldn't read PDF. Ensure it's a valid PDF file."
   - Retry option

2. **LLM Structure Analysis Fails**
   - Fallback: Show simple interface to manually name sections
   - Or: Show raw page-by-page option

3. **Async Explanation Generation Fails**
   - Trail still created successfully
   - Explanation shows "Failed to generate. Try again?" with retry button

4. **Student Opens Trail Before Explanation Ready**
   - Show "Generating explanation..." with compass spinner
   - Auto-refresh when ready

---

## Success Criteria

- ✅ Students can upload any textbook PDF
- ✅ LLM correctly identifies chapters and sections
- ✅ User can selectively choose what to learn (prevents data bloat)
- ✅ Trails created and organized under one expedition
- ✅ AI explanations automatically generated on first open
- ✅ Follow-up questions use section content for context
- ✅ No data explosion (only selected content stored)

---

## Future Enhancements

- Collaborative PDF learning (classrooms)
- Highlight important passages in original PDF
- Export learning notes/progress
- Adaptive difficulty based on follow-up questions
- Citation tracking (students know exactly where info came from)
