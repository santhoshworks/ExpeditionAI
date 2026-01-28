# Autonomous Task Execution System

This system enables Claude Code (with Haiku agents) to autonomously implement the Business L&D platform across multiple sessions with credit limitations and automatic resumption.

## Overview

The implementation is broken down into **300+ micro-tasks**, each taking 5-15 minutes. This allows:

- ✅ **Credit-efficient execution** - Small tasks use minimal credits
- ✅ **Session resilience** - Stop and resume anytime
- ✅ **Progress tracking** - Always know what's done and what's next
- ✅ **Dependency management** - Tasks execute in correct order
- ✅ **Parallel execution** - Multiple agents can work on independent tasks

## Quick Start

### 1. Check Current Status

```bash
npm run task:status
```

This shows:
- Overall completion percentage
- Task breakdown (completed, pending, blocked)
- Time spent vs. remaining
- Progress per phase

### 2. See Next Task

```bash
npm run task:next
```

This shows the next available task with:
- Task ID and description
- Files to create/modify
- Success criteria
- Estimated time

### 3. Execute Next Task (with Claude)

In Claude Code, say:

```
Execute the next available task from docs/plans/business-lnd-task-tracker.json
```

Claude will:
1. Read the task tracker
2. Find the next available task
3. Update status to "in_progress"
4. Execute all steps
5. Verify success criteria
6. Commit changes
7. Update status to "completed"
8. Show progress and next task

### 4. Continue or Pause

After each task, Claude will ask:

```
Would you like me to continue with the next task?
```

- Say **"yes"** to continue
- Say **"save progress and exit"** when credits are low

### 5. Resume Later

When you return, simply say:

```
Resume from the task tracker and execute the next task
```

Claude will pick up exactly where it left off.

## Task Tracker Structure

The task tracker (`docs/plans/business-lnd-task-tracker.json`) contains:

```json
{
  "project": "Business L&D Platform",
  "phases": [...],
  "tasks": [
    {
      "id": "1.1",
      "title": "Create organizations schema file",
      "phase": 1,
      "category": "db",
      "status": "pending",
      "dependencies": [],
      "estimatedMinutes": 10,
      "files": {
        "create": ["supabase/migrations/..."]
      },
      "description": "...",
      "successCriteria": ["..."],
      "assignedTo": null,
      "startedAt": null,
      "completedAt": null
    }
  ],
  "stats": {
    "totalTasks": 30,
    "completedTasks": 0,
    "pendingTasks": 30,
    ...
  }
}
```

## Task Categories

Tasks are organized by category:

- **`db`** - Database schema and migrations
- **`api`** - API routes and endpoints
- **`ui`** - React components and pages
- **`auth`** - Authentication and authorization
- **`ai`** - AI content generation logic
- **`storage`** - S3 and file handling
- **`test`** - Testing
- **`docs`** - Documentation

## Task Status

- **`pending`** - Not started, waiting for dependencies
- **`in_progress`** - Currently being worked on
- **`completed`** - Finished and verified
- **`blocked`** - Cannot proceed (needs external input)
- **`skipped`** - Decided not to implement

## CLI Commands

### View Status

```bash
npm run task:status
```

Output example:
```
📊 Business L&D Platform - Implementation Status

📈 Overall Progress: 23.3%
   7 / 30 tasks completed

   [█████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]

📋 Task Breakdown:
   ✅ Completed:    7
   ⏳ In Progress:  1
   ⏸️  Pending:      22
   🚫 Blocked:      0
   ⏭️  Skipped:      0

⏱️  Time:
   Completed: 1.2 hours
   Remaining: 3.7 hours (estimated)

🎯 Phase Progress:
   Phase 1: Foundation                     30% (7/23)
   Phase 2: Content & AI Generation        0% (0/45)
   Phase 3: Learning Experience            0% (0/52)
   ...
```

### List All Tasks

```bash
npm run task:list
```

### List Pending Tasks

```bash
npm run task:list:pending
```

### List Completed Tasks

```bash
npm run task:list:completed
```

### Mark Task Complete (Manual)

```bash
npm run task:complete 1.5
```

### Mark Task Blocked

```bash
npm run task:block 1.10 "Waiting for design mockups"
```

## How Claude Executes Tasks

When you ask Claude to execute a task, it follows this protocol:

### 1. Read Task Tracker

```typescript
const tracker = JSON.parse(
  await readFile('docs/plans/business-lnd-task-tracker.json')
);
```

### 2. Find Next Available Task

```typescript
// Find first task where:
// - status is 'pending'
// - all dependencies are completed
const nextTask = tracker.tasks.find(task => {
  if (task.status !== 'pending') return false;

  return task.dependencies.every(depId => {
    const dep = tracker.tasks.find(t => t.id === depId);
    return dep?.status === 'completed';
  });
});
```

### 3. Update Status to In Progress

```typescript
nextTask.status = 'in_progress';
nextTask.assignedTo = 'claude-session-' + Date.now();
nextTask.startedAt = new Date().toISOString();

// Save tracker
await writeFile('docs/plans/business-lnd-task-tracker.json', ...);
```

### 4. Execute Task Steps

Follow the detailed steps from the granular tasks document:

```bash
# Example: Task 1.1
# Step 1: Create migration file
cat > supabase/migrations/20260128_create_organizations_schema.sql << 'EOF'
CREATE SCHEMA IF NOT EXISTS organizations;
EOF

# Step 2: Verify syntax
psql -d postgres -f supabase/migrations/... --dry-run

# Step 3: Commit
git add supabase/migrations/...
git commit -m "feat(db): create organizations schema"
```

### 5. Verify Success Criteria

Check each success criterion:

```
✓ File created with valid SQL
✓ No syntax errors
✓ Committed to git
```

### 6. Update Status to Completed

```typescript
nextTask.status = 'completed';
nextTask.completedAt = new Date().toISOString();

// Update stats
tracker.stats.completedTasks++;
tracker.stats.pendingTasks--;
tracker.stats.completedMinutes += nextTask.estimatedMinutes;

await writeFile('docs/plans/business-lnd-task-tracker.json', ...);
```

### 7. Report and Continue

```
✅ Task 1.1 completed: Create organizations schema file

📊 Progress:
- Completed: 1 / 30 tasks (3.3%)
- Time spent: 10 / 295 minutes
- Next task: 1.2 - Create organizations table

Would you like me to continue with the next task?
```

## Credit Management

### Estimating Credit Usage

Each task shows `estimatedMinutes`. With Haiku:

- **10-minute task** ≈ 50-100 credits (roughly)
- **Session of 5 tasks** ≈ 250-500 credits

Before starting a task, Claude can check:

```typescript
const creditsNeeded = task.estimatedMinutes * CREDITS_PER_MINUTE;
const creditsRemaining = // from system

if (creditsNeeded > creditsRemaining) {
  console.log('⚠️ Insufficient credits for this task');
  console.log('Saving progress...');
  return;
}
```

### Low Credit Warning

When credits are running low:

```
⚠️ Credit usage: 850 / 1000 (85%)

Recommendation: Complete current task and save progress.

Would you like to:
1. Continue with next task (risky)
2. Save progress and exit (recommended)
```

### Automatic Resumption

You can set up a cron job to automatically resume:

```bash
#!/bin/bash
# resume-tasks.sh

# Check if credits are available (example check)
CREDITS=$(curl -s https://api.claude.com/credits | jq .remaining)

if [ "$CREDITS" -gt 500 ]; then
  echo "Credits available: $CREDITS"
  echo "Starting Claude Code session..."

  # Start Claude Code with auto-execution
  echo "Resume from task tracker and execute next 5 tasks, then save progress" | claude-code
else
  echo "Insufficient credits: $CREDITS"
  echo "Will retry later..."
fi
```

Add to crontab to run every 6 hours:

```bash
crontab -e

# Add line:
0 */6 * * * /path/to/resume-tasks.sh >> /var/log/claude-resume.log 2>&1
```

## Parallel Execution

Multiple agents can work on independent tasks simultaneously.

### Identifying Parallel Tasks

Tasks with no shared dependencies can run in parallel:

```typescript
// These can run in parallel (all depend only on 1.2):
Task 1.3: Create members table (depends: [1.2])
Task 1.4: Create skills table (depends: [1.2])

// These must run sequentially:
Task 1.1: Create schema (depends: [])
Task 1.2: Create organizations table (depends: [1.1])
Task 1.3: Create members table (depends: [1.2])
```

### Running Multiple Agents

In separate terminal windows:

**Agent 1:**
```
Execute task 1.3 from the task tracker
```

**Agent 2:**
```
Execute task 1.4 from the task tracker
```

Both agents will:
1. Read tracker
2. Update their task to "in_progress"
3. Execute independently
4. Update to "completed"
5. No conflicts (working on different files)

## Handling Errors

### If a Task Fails

Claude will:

```
❌ Task 1.5 failed: Migration syntax error

Error: syntax error at line 23
  CREATE TABLLE organizations.courses ...
           ^

Marking task as blocked with reason...
```

The task status becomes `blocked` with error details.

### Unblocking Tasks

Once you fix the issue:

```bash
# Manually fix the file
vim supabase/migrations/...

# Manually mark as completed
npm run task:complete 1.5
```

Or ask Claude:

```
Fix the syntax error in task 1.5 and complete it
```

## Advanced Features

### Customizing Task Execution

You can ask Claude to:

1. **Execute specific task:**
   ```
   Execute task 2.7 from the task tracker
   ```

2. **Execute multiple tasks:**
   ```
   Execute the next 5 tasks from the task tracker
   ```

3. **Execute all tasks in a category:**
   ```
   Execute all pending 'db' tasks from the task tracker
   ```

4. **Execute until credit limit:**
   ```
   Execute tasks from the tracker until credits reach 200, then save progress
   ```

### Skipping Tasks

If you decide a task is not needed:

```bash
npm run task:skip 3.15
```

Or tell Claude:

```
Skip task 3.15 - we're not implementing that feature
```

### Adding Custom Tasks

You can manually add tasks to the tracker:

```json
{
  "id": "2.99",
  "title": "Custom task title",
  "phase": 2,
  "category": "api",
  "status": "pending",
  "dependencies": ["2.10", "2.11"],
  "estimatedMinutes": 20,
  "files": {
    "create": ["path/to/file.ts"]
  },
  "description": "What this task does",
  "successCriteria": [
    "Criterion 1",
    "Criterion 2"
  ],
  "assignedTo": null,
  "startedAt": null,
  "completedAt": null,
  "blockedReason": null
}
```

## Best Practices

### 1. Check Status Regularly

```bash
npm run task:status
```

Keep track of progress and identify blockers early.

### 2. Commit Frequently

Each task includes a commit step. Never skip commits.

### 3. Verify Before Continuing

After completing a task, verify it worked:

```bash
# For DB tasks
npm run task:status

# For API tasks
npm run dev
# Test the endpoint

# For UI tasks
npm run dev
# View the component
```

### 4. Document Blocked Tasks

If a task is blocked, document why:

```bash
npm run task:block 5.12 "Waiting for AWS S3 credentials"
```

### 5. Use Haiku for Task Execution

The tasks are designed for Haiku:
- Small, focused scope
- Clear instructions
- No complex decision-making

Reserve Sonnet/Opus for:
- Planning
- Complex debugging
- Architectural decisions

## Troubleshooting

### Task Tracker Not Found

```bash
# Verify file exists
ls -la docs/plans/business-lnd-task-tracker.json

# If missing, you may have deleted it
git checkout docs/plans/business-lnd-task-tracker.json
```

### No Next Task Available

All tasks are either completed, in progress, or blocked. Check:

```bash
npm run task:list:blocked
```

Unblock tasks or wait for in-progress tasks to complete.

### Git Conflicts

If multiple agents work on same files:

```bash
# Pull latest
git pull

# Resolve conflicts
# Update task tracker manually if needed

# Continue
```

### Stats Out of Sync

If stats don't match actual tasks:

```bash
# Run recalculation script (create if needed)
npm run task:recalc
```

Or manually fix in tracker JSON.

## Examples

### Example Session 1

```
Human: npm run task:status

Output: 0 / 30 tasks (0%)