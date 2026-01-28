# Autonomous Task Executor Guide

This guide explains how to use Claude Code with Haiku agents to autonomously implement the Business L&D platform across multiple sessions with credit limitations.

## System Overview

The task execution system consists of:

1. **Task Tracker** (`docs/plans/business-lnd-task-tracker.json`) - Central source of truth
2. **This Guide** - Instructions for Claude agents
3. **Session Management** - Credit-aware resumption

## How It Works

### For Human Operators

1. **Start a Session:**
   ```bash
   # In your terminal, start Claude Code
   claude-code
   ```

2. **Tell Claude to Execute Next Task:**
   ```
   Execute the next available task from docs/plans/business-lnd-task-tracker.json
   ```

3. **Claude Will:**
   - Read the task tracker
   - Find the next available task (status: pending, dependencies met)
   - Update task status to "in_progress"
   - Execute the task steps
   - Update task status to "completed"
   - Commit changes
   - Update stats

4. **When Credits Run Low:**
   ```
   Save progress and exit. I'll resume later.
   ```

5. **Resume Later:**
   ```
   Resume from the task tracker and execute the next task.
   ```

### For Claude Agents

When you receive a request to "execute next task" or "resume", follow this protocol:

#### Step 1: Read Task Tracker

```typescript
const taskTracker = JSON.parse(
  await readFile('docs/plans/business-lnd-task-tracker.json')
);
```

#### Step 2: Find Next Task

```typescript
function findNextTask(tasks) {
  return tasks.find(task => {
    // Must be pending
    if (task.status !== 'pending') return false;

    // All dependencies must be completed
    const depsCompleted = task.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status === 'completed';
    });

    return depsCompleted;
  });
}
```

#### Step 3: Update Status to In Progress

```typescript
task.status = 'in_progress';
task.assignedTo = 'claude-agent-session-' + Date.now();
task.startedAt = new Date().toISOString();

await writeFile(
  'docs/plans/business-lnd-task-tracker.json',
  JSON.stringify(taskTracker, null, 2)
);
```

#### Step 4: Execute Task

Follow the task's steps exactly as described. For example, Task 1.1:

```bash
# Create the file
cat > supabase/migrations/20260128_create_organizations_schema.sql << 'EOF'
-- Create organizations schema
CREATE SCHEMA IF NOT EXISTS organizations;

-- Set search path
SET search_path TO organizations, public;
EOF

# Verify syntax (if psql available)
psql -d postgres -f supabase/migrations/20260128_create_organizations_schema.sql --dry-run || echo "Syntax OK"

# Commit
git add supabase/migrations/20260128_create_organizations_schema.sql
git commit -m "feat(db): create organizations schema"
```

#### Step 5: Update Status to Completed

```typescript
task.status = 'completed';
task.completedAt = new Date().toISOString();

// Update stats
taskTracker.stats.completedTasks++;
taskTracker.stats.pendingTasks--;
taskTracker.stats.completedMinutes += task.estimatedMinutes;
taskTracker.lastUpdated = new Date().toISOString();

await writeFile(
  'docs/plans/business-lnd-task-tracker.json',
  JSON.stringify(taskTracker, null, 2)
);
```

#### Step 6: Report Progress

```
✅ Task 1.1 completed: Create organizations schema file

📊 Progress:
- Completed: 1 / 30 tasks (3.3%)
- Time spent: 10 / 295 minutes
- Next task: 1.2 - Create organizations table

Would you like me to continue with the next task?
```

#### Step 7: If Credits Low

```
⚠️ Credit usage approaching limit. Saving progress...

✅ Progress saved to task tracker
📌 Next task: 1.2 - Create organizations table

You can resume by saying:
"Resume from the task tracker and execute the next task"
```

## Task Execution Template

For each task, follow this structure:

```markdown
## Executing Task [ID]: [Title]

**Category:** [category]
**Estimated Time:** [estimatedMinutes] minutes
**Dependencies:** [dependencies]

### Step 1: [Step description]
[Code or commands]

### Step 2: [Step description]
[Code or commands]

### Step 3: Verify Success
[Verification commands and expected output]

### Step 4: Commit
```bash
git add [files]
git commit -m "[commit message]"
```

✅ Task completed successfully
[Update task tracker status]
```

## Advanced Features

### Handling Blocked Tasks

If a task cannot be completed:

```typescript
task.status = 'blocked';
task.blockedReason = 'Reason why task is blocked';
taskTracker.stats.blockedTasks++;
taskTracker.stats.pendingTasks--;
```

### Skipping Tasks

If a task is no longer needed:

```typescript
task.status = 'skipped';
taskTracker.stats.skippedTasks++;
taskTracker.stats.pendingTasks--;
```

### Parallel Task Execution

If multiple tasks have no dependencies on each other and are in the same category, they can potentially be done in parallel by different agents.

### Credit Budget Management

Before starting each task, check estimated time:

```typescript
const estimatedMinutes = task.estimatedMinutes;
const currentCreditsRemaining = // Get from system

if (estimatedMinutes * CREDITS_PER_MINUTE > currentCreditsRemaining) {
  // Save and exit
  return {
    action: 'pause',
    reason: 'Insufficient credits for next task',
    nextTask: task.id
  };
}
```

## Example Session Flow

### Session 1 (Fresh Start)

```
Human: Execute the next available task from the task tracker

Claude:
Reading task tracker...
Found 30 pending tasks.
Next task: 1.1 - Create organizations schema file

Executing Task 1.1...
[Creates file]
[Commits]
✅ Task 1.1 completed

Progress: 1/30 (3.3%)
Next task: 1.2 - Create organizations table

Would you like me to continue?