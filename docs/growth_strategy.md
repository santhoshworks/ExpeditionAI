# ExpeditionAI: Growth & Feature Strategy

## Executive Summary
This document outlines a strategy to increase user traffic for ExpeditionAI. Based on an analysis of the current product (visual knowledge mapping) and the competitive landscape, the primary driver for growth should be **viral content loops** and **SEO-driven public assets**.

The "Do Not Implement" constraint is acknowledged; these are purely strategic recommendations.

## 1. Completive Landscape Analysis

The "AI Knowledge Mapping" space is splitting into two categories: **Study Tools** (Student focus) and **Research/Thinking Tools** (Prosumer focus).

| Competitor | Primary Focus | Key Viral/Growth Feature | Gap vs ExpeditionAI |
| :--- | :--- | :--- | :--- |
| **Algor Education** | Student / Learning | Auto-generate maps from huge texts/photos. | Strong on generic "study", weak on "deep research" connection. |
| **Mapify / ChatMap** | Content Summarization | **YouTube-to-Map**. This is their killer viral feature. | Very transient (one-off maps), less "knowledge base" building. |
| **Heptabase** | Visual Note-taking | Community "Whiteboards" and deep PKM culture. | High learning curve. No "Auto-generate" magic for beginners. |
| **Quizlet** | Flashcards | **User-generated content SEO**. Every card deck is a google search result. | Not visual/spatial. Pure rote memory. |
| **Perplexity** | Answer Engine | "Share this thread". Clean, readable answers. | Linear text outcome, not spatial/conceptual. |

### 🔍 Key Takeaway
ExpeditionAI sits uniquely between **Mapify** (Auto-gen magic) and **Heptabase** (Deep visual organization). To grow, we need to lean into the "Auto-gen" side for top-of-funnel traffic, then convert them to the "Deep visual" side for retention.

---

## 2. Feature Recommendations for Traffic (The Growth Engine)

To get traffic, you need features that exist *outside* the authenticated wall or encourage sharing.

### A. The "Viral Hook" Features (Top of Funnel)
*These features are designed to be "single-player tools" that are so useful people share them.*

#### 1. "YouTube-to-Expedition" (High Priority)
*   **Concept:** Paste a YouTube URL -> Get a Knowledge Map with nodes for key chapters/concepts.
*   **Why it drives traffic:** "Summarize this lecture" is a massive use case. People share these summaries on Twitter/LinkedIn/Discord.
*   **Competitor Check:** Mapify does this well.

#### 2. "PDF-to-Map" Public Preview
*   **Concept:** Allow users to upload a PDF (research paper) and generate a *publicly viewable* map preview.
*   **Why it drives traffic:** Researchers and students love sharing "I just mapped this complex paper."

### B. The "SEO Loop" Features
*   **Concept:** Programmatic SEO.
*   **Feature:** **Directory of Public Expeditions.**
    *   If a user creates a generic map (e.g., "History of Rome"), prompt them to "Publish to Community".
    *   Create static, fast-loading pages for these maps (e.g., `expedition.ai/map/history-of-rome`).
    *   These pages rank on Google for "Mind map of Rome history", driving organic traffic.

### C. The "Social Loop" Features
*   **Concept:** Multiplayer / Competition.
*   **Feature:** **"Challenge a Friend" Quiz Mode.**
    *   Current State: You have "Quiz Me".
    *   Upgrade: After a quiz, simple button: "I scored 80%. Challenge a friend."
    *   Result: Friend clicks link -> Lands on ExpeditionAI -> Takes Quiz -> Signs up to see full results or create their own.

### D. The "Embed" Strategy
*   **Concept:** Backlinks and brand awareness.
*   **Feature:** **Embeddable Maps.**
    *   Allow bloggers/writers to embed an ExpeditionAI map into their Substack/Medium/Blog.
    *   "Explore this interactive map of my article."
    *   Includes a "Powered by ExpeditionAI" button.

---

## 3. Implementation Priorities (Hypothetical)

If we were to move forward, the ranking for *traffic impact* would be:

1.  **Public/Shared Map Pages** (SEO foundation + Shareability)
2.  **YouTube Integration** (Viral utility)
3.  **Quiz Challenge Mode** (Viral loop)
4.  **Embed Widgets** (Brand awareness)
