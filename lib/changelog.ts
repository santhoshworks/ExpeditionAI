export interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  type: 'feature' | 'improvement' | 'fix'
  changes: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.5.0",
    date: "2026-01-28",
    title: "AI Quiz Generator 2.0",
    description: "Major update to our quiz generation system",
    type: "feature",
    changes: [
      "New adaptive difficulty system",
      "Support for open-ended questions",
      "Improved question relevance scoring",
      "Export quizzes to PDF"
    ]
  },
  {
    version: "2.4.2",
    date: "2026-01-15",
    title: "Performance Optimizations",
    description: "Speed improvements across the platform",
    type: "improvement",
    changes: [
      "50% faster chat response times",
      "Optimized trail branching rendering",
      "Reduced memory usage for large expeditions",
      "Improved caching for frequently accessed content"
    ]
  },
  {
    version: "2.4.1",
    date: "2026-01-08",
    title: "Bug Fixes and Stability",
    description: "Addressing reported issues from the community",
    type: "fix",
    changes: [
      "Fixed journal export formatting issues",
      "Resolved trail visualization glitches on mobile",
      "Corrected credit calculation edge cases",
      "Fixed authentication timeout handling"
    ]
  },
  {
    version: "2.4.0",
    date: "2025-12-20",
    title: "Learning Journals Redesign",
    description: "Complete overhaul of the journal experience",
    type: "feature",
    changes: [
      "New AI-powered auto-summarization",
      "Rich text editing with markdown support",
      "Export to multiple formats (PDF, Markdown, Notion)",
      "Collaborative journal sharing",
      "Version history and rollback"
    ]
  },
  {
    version: "2.3.2",
    date: "2025-12-10",
    title: "Search Enhancement",
    description: "Better search across your learning history",
    type: "improvement",
    changes: [
      "Full-text search across all expeditions",
      "Search filters by date, topic, and model",
      "Improved search result relevance",
      "Search within journal entries"
    ]
  },
  {
    version: "2.3.1",
    date: "2025-11-28",
    title: "Mobile Experience Fixes",
    description: "Improving the mobile learning experience",
    type: "fix",
    changes: [
      "Fixed touch gestures on trail visualization",
      "Improved keyboard handling on mobile devices",
      "Fixed menu overlapping issues",
      "Corrected responsive layout on tablets"
    ]
  },
  {
    version: "2.3.0",
    date: "2025-11-15",
    title: "Trail Branching 2.0",
    description: "Visual knowledge mapping reaches the next level",
    type: "feature",
    changes: [
      "New interactive trail visualization",
      "Drag-and-drop trail reorganization",
      "Custom trail colors and icons",
      "Trail templates for common learning patterns",
      "Share trail structures with other users"
    ]
  },
  {
    version: "2.2.1",
    date: "2025-10-30",
    title: "Accessibility Improvements",
    description: "Making ThoughtMap accessible to everyone",
    type: "improvement",
    changes: [
      "Enhanced screen reader support",
      "Improved keyboard navigation",
      "Better color contrast ratios",
      "Added ARIA labels throughout the app"
    ]
  },
  {
    version: "2.2.0",
    date: "2025-10-12",
    title: "Multi-Model Support Expansion",
    description: "Access to more AI models than ever before",
    type: "feature",
    changes: [
      "Added support for 50+ new AI models",
      "Model comparison feature for answers",
      "Custom model preferences per topic",
      "Model performance analytics"
    ]
  },
  {
    version: "2.1.0",
    date: "2025-09-25",
    title: "Glossary and Learning Topics",
    description: "New educational resources for learners",
    type: "feature",
    changes: [
      "Interactive glossary with 500+ terms",
      "Curated learning topic pages",
      "Related content suggestions",
      "Topic difficulty indicators"
    ]
  }
]
