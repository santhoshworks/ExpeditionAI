# Claude Memory Setup for Business L&D Project

Run these `/remember` commands in Claude Code to set up project context for future sessions:

## 1. Project Overview

```
/remember This is the ExpeditionAI/ThoughtMap project. We're building a NEW Business L&D platform completely separate from the existing D2C product. The Business L&D platform has: separate database schema (organizations), separate routes (app/(business)), separate components (components/business/), and separate utilities (lib/business/). Never mix D2C and Business code.
```

## 2. Task Tracker System

```
/remember We use an autonomous task execution system for implementation. The task tracker is at docs/plans/business-lnd-task-tracker.json with 300+ micro-tasks (5-15 min each). To execute tasks: read tracker, find next available task (status=pending, dependencies met), update to in_progress, execute steps, commit, update to completed. Use Haiku model for task execution to save 90% on credits.
```

## 3. Task Execution Protocol

```
/remember When asked to "execute next task from tracker": 1) Read business-lnd-task-tracker.json 2) Find task where status=pending and all dependencies completed 3) Update task status to in_progress with assignedTo and startedAt 4) Execute exact steps from task 5) Verify success criteria 6) Commit with message from task 7) Update status to completed with completedAt 8) Update stats 9) Save tracker 10) Report progress and ask to continue
```

## 4. Technology Stack

```
/remember Tech stack: Next.js 14 (App Router), TypeScript, Supabase (PostgreSQL + Auth), Tailwind CSS, shadcn/ui, AWS S3, OpenRouter AI SDK, React Query. Database uses TWO schemas: public (D2C) and organizations (Business L&D). Always use organizations schema for Business L&D features. Migration files go in supabase/migrations/.
```

## 5. Key Conventions

```
/remember Coding conventions: Use Haiku for task execution, Sonnet for planning/debugging. Commit after each task. Never skip success criteria verification. Business terminology: Learning Paths (not Expeditions), Sessions (not Trails), Interactions (not Messages). File structure: app/(business)/ for routes, components/business/ for components, lib/business/ for utilities. Complete isolation from D2C code.
```

## 6. Installed Skills

```
/remember Installed specialized skills for this project: supabase-expert (database/RLS), database-schema (schema design), api-designer (REST APIs), nextjs-development (Next.js patterns), oauth-implementation (SSO/SAML), test-driven-development (TDD), systematic-debugging (debugging). Use these skills when executing relevant tasks.
```

## 7. Quick Commands

```
/remember Quick commands: npm run task:status (show progress), npm run task:next (show next task), npm run task:list (list all tasks), npm run task:complete <id> (mark done), npm run task:block <id> <reason> (mark blocked). Main docs: docs/plans/2026-01-28-business-lnd-design.md (design), docs/plans/AUTONOMOUS-EXECUTION.md (system guide), docs/plans/QUICK-START.md (getting started).
```

## 8. Implementation Status

```
/remember Current implementation status: Phase 1 (Foundation - Database & Auth) with 30 tasks. Completed: 0/30. Next task: 1.1 - Create organizations schema file. Estimated 4.9 hours for Phase 1. Use autonomous execution: "Execute the next available task from the task tracker" with Haiku model for credit efficiency.
```

---

## How to Apply These Memories

**Option 1: Run each command manually**
Copy each `/remember` command above and run it in Claude Code CLI.

**Option 2: Run all at once**
Create a script to run all memories:

```bash
# Save to scripts/setup-memories.sh
#!/bin/bash

cat << 'EOF' > /tmp/memories.txt
This is the ExpeditionAI/ThoughtMap project. We're building a NEW Business L&D platform completely separate from the existing D2C product. The Business L&D platform has: separate database schema (organizations), separate routes (app/(business)), separate components (components/business/), and separate utilities (lib/business/). Never mix D2C and Business code.
---
We use an autonomous task execution system for implementation. The task tracker is at docs/plans/business-lnd-task-tracker.json with 300+ micro-tasks (5-15 min each). To execute tasks: read tracker, find next available task (status=pending, dependencies met), update to in_progress, execute steps, commit, update to completed. Use Haiku model for task execution to save 90% on credits.
---
When asked to "execute next task from tracker": 1) Read business-lnd-task-tracker.json 2) Find task where status=pending and all dependencies completed 3) Update task status to in_progress with assignedTo and startedAt 4) Execute exact steps from task 5) Verify success criteria 6) Commit with message from task 7) Update status to completed with completedAt 8) Update stats 9) Save tracker 10) Report progress and ask to continue
---
Tech stack: Next.js 14 (App Router), TypeScript, Supabase (PostgreSQL + Auth), Tailwind CSS, shadcn/ui, AWS S3, OpenRouter AI SDK, React Query. Database uses TWO schemas: public (D2C) and organizations (Business L&D). Always use organizations schema for Business L&D features. Migration files go in supabase/migrations/.
---
Coding conventions: Use Haiku for task execution, Sonnet for planning/debugging. Commit after each task. Never skip success criteria verification. Business terminology: Learning Paths (not Expeditions), Sessions (not Trails), Interactions (not Messages). File structure: app/(business)/ for routes, components/business/ for components, lib/business/ for utilities. Complete isolation from D2C code.
---
Installed specialized skills for this project: supabase-expert (database/RLS), database-schema (schema design), api-designer (REST APIs), nextjs-development (Next.js patterns), oauth-implementation (SSO/SAML), test-driven-development (TDD), systematic-debugging (debugging). Use these skills when executing relevant tasks.
---
Quick commands: npm run task:status (show progress), npm run task:next (show next task), npm run task:list (list all tasks), npm run task:complete <id> (mark done), npm run task:block <id> <reason> (mark blocked). Main docs: docs/plans/2026-01-28-business-lnd-design.md (design), docs/plans/AUTONOMOUS-EXECUTION.md (system guide), docs/plans/QUICK-START.md (getting started).
---
Current implementation status: Phase 1 (Foundation - Database & Auth) with 30 tasks. Completed: 0/30. Next task: 1.1 - Create organizations schema file. Estimated 4.9 hours for Phase 1. Use autonomous execution: "Execute the next available task from the task tracker" with Haiku model for credit efficiency.
EOF

echo "Memories saved to /tmp/memories.txt"
echo "Now run each /remember command in Claude Code"
```

Then run each line with `/remember` in Claude Code.

## Verify Memories

After setting up, verify with:
```
/memory
```

This shows all stored memories.

## Update Memory

As progress is made, update the status memory:
```
/remember --update Current implementation status: Phase 1 (Foundation - Database & Auth) with 30 tasks. Completed: 15/30. Next task: 1.16 - Create video_bookmarks table. 50% through Phase 1.
```

## Memory Benefits

With these memories set:
- ✅ Future sessions have full context immediately
- ✅ Haiku agents know the project structure
- ✅ No need to re-explain task execution protocol
- ✅ Consistent conventions across sessions
- ✅ Faster execution (less context-setting needed)

## When to Use Memory

**Good uses:**
- Project structure and conventions
- Task execution protocols
- Technology stack
- Key file locations
- Implementation status

**Don't store:**
- Temporary state (use task tracker instead)
- Large code snippets (keep in files)
- Detailed task steps (already in tracker)
