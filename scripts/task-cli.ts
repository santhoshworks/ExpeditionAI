#!/usr/bin/env tsx

/**
 * Task CLI - Manage Business L&D implementation tasks
 *
 * Usage:
 *   npm run task:status              # Show overall progress
 *   npm run task:next                # Show next available task
 *   npm run task:list                # List all tasks
 *   npm run task:list --pending      # List pending tasks
 *   npm run task:list --completed    # List completed tasks
 *   npm run task:complete <id>       # Mark task as completed
 *   npm run task:block <id> <reason> # Mark task as blocked
 */

import fs from 'fs';
import path from 'path';

interface Task {
  id: string;
  title: string;
  phase: number;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  dependencies: string[];
  estimatedMinutes: number;
  files: {
    create?: string[];
    modify?: string[];
  };
  description: string;
  successCriteria: string[];
  assignedTo: string | null;
  startedAt: string | null;
  completedAt: string | null;
  blockedReason: string | null;
}

interface TaskTracker {
  project: string;
  version: string;
  lastUpdated: string;
  phases: Array<{
    id: number;
    name: string;
    estimatedWeeks: number;
    status: string;
  }>;
  tasks: Task[];
  stats: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    blockedTasks: number;
    skippedTasks: number;
    totalEstimatedMinutes: number;
    completedMinutes: number;
  };
}

const TRACKER_PATH = path.join(
  __dirname,
  '../docs/plans/business-lnd-task-tracker.json'
);

function loadTracker(): TaskTracker {
  const data = fs.readFileSync(TRACKER_PATH, 'utf-8');
  return JSON.parse(data);
}

function saveTracker(tracker: TaskTracker): void {
  tracker.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));
}

function showStatus(tracker: TaskTracker): void {
  const { stats, phases } = tracker;

  console.log('\n📊 Business L&D Platform - Implementation Status\n');
  console.log('='.repeat(60));

  // Overall progress
  const completionPercent = (
    (stats.completedTasks / stats.totalTasks) * 100
  ).toFixed(1);

  console.log(`\n📈 Overall Progress: ${completionPercent}%`);
  console.log(
    `   ${stats.completedTasks} / ${stats.totalTasks} tasks completed\n`
  );

  // Progress bar
  const barWidth = 40;
  const completed = Math.floor(
    (stats.completedTasks / stats.totalTasks) * barWidth
  );
  const bar = '█'.repeat(completed) + '░'.repeat(barWidth - completed);
  console.log(`   [${bar}]\n`);

  // Task breakdown
  console.log('📋 Task Breakdown:');
  console.log(`   ✅ Completed:    ${stats.completedTasks}`);
  console.log(`   ⏳ In Progress:  ${stats.inProgressTasks}`);
  console.log(`   ⏸️  Pending:      ${stats.pendingTasks}`);
  console.log(`   🚫 Blocked:      ${stats.blockedTasks}`);
  console.log(`   ⏭️  Skipped:      ${stats.skippedTasks}`);

  // Time estimate
  const remainingMinutes =
    stats.totalEstimatedMinutes - stats.completedMinutes;
  const remainingHours = (remainingMinutes / 60).toFixed(1);
  const completedHours = (stats.completedMinutes / 60).toFixed(1);

  console.log(`\n⏱️  Time:`);
  console.log(`   Completed: ${completedHours} hours`);
  console.log(`   Remaining: ${remainingHours} hours (estimated)`);

  // Phase breakdown
  console.log(`\n🎯 Phase Progress:`);
  phases.forEach((phase) => {
    const phaseTasks = tracker.tasks.filter((t) => t.phase === phase.id);
    const phaseCompleted = phaseTasks.filter(
      (t) => t.status === 'completed'
    ).length;
    const phasePercent = (
      (phaseCompleted / phaseTasks.length) * 100
    ).toFixed(0);

    console.log(
      `   Phase ${phase.id}: ${phase.name.padEnd(30)} ${phasePercent}% (${phaseCompleted}/${phaseTasks.length})`
    );
  });

  console.log('\n' + '='.repeat(60) + '\n');
}

function findNextTask(tracker: TaskTracker): Task | null {
  return tracker.tasks.find((task) => {
    if (task.status !== 'pending') return false;

    // Check all dependencies are completed
    return task.dependencies.every((depId) => {
      const dep = tracker.tasks.find((t) => t.id === depId);
      return dep && dep.status === 'completed';
    });
  }) || null;
}

function showNextTask(tracker: TaskTracker): void {
  const next = findNextTask(tracker);

  if (!next) {
    console.log('\n✅ No more tasks available!');
    console.log('   Either all tasks are complete or blocked.\n');
    return;
  }

  console.log('\n🎯 Next Available Task\n');
  console.log('='.repeat(60));
  console.log(`\nID:          ${next.id}`);
  console.log(`Title:       ${next.title}`);
  console.log(`Phase:       ${next.phase}`);
  console.log(`Category:    ${next.category}`);
  console.log(`Estimated:   ${next.estimatedMinutes} minutes`);
  console.log(`Description: ${next.description}`);

  if (next.dependencies.length > 0) {
    console.log(`Dependencies: ${next.dependencies.join(', ')}`);
  }

  if (next.files.create) {
    console.log(`\nFiles to create:`);
    next.files.create.forEach((f) => console.log(`  - ${f}`));
  }

  if (next.files.modify) {
    console.log(`\nFiles to modify:`);
    next.files.modify.forEach((f) => console.log(`  - ${f}`));
  }

  console.log(`\nSuccess Criteria:`);
  next.successCriteria.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 To execute this task, tell Claude:');
  console.log(`   "Execute task ${next.id} from the task tracker"\n`);
}

function listTasks(
  tracker: TaskTracker,
  filter?: 'pending' | 'completed' | 'in_progress' | 'blocked'
): void {
  let tasks = tracker.tasks;

  if (filter) {
    tasks = tasks.filter((t) => t.status === filter);
  }

  console.log(`\n📋 Tasks ${filter ? `(${filter})` : ''}\n`);
  console.log('='.repeat(80));

  const grouped = tasks.reduce((acc, task) => {
    const phase = task.phase;
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  Object.entries(grouped).forEach(([phase, phaseTasks]) => {
    const phaseInfo = tracker.phases.find((p) => p.id === Number(phase));
    console.log(`\n📍 Phase ${phase}: ${phaseInfo?.name}`);
    console.log('-'.repeat(80));

    phaseTasks.forEach((task) => {
      const status = {
        pending: '⏸️ ',
        in_progress: '⏳',
        completed: '✅',
        blocked: '🚫',
        skipped: '⏭️ ',
      }[task.status];

      console.log(
        `${status} ${task.id.padEnd(6)} ${task.title.padEnd(50)} ${task.estimatedMinutes}min`
      );

      if (task.blockedReason) {
        console.log(`         └─ Blocked: ${task.blockedReason}`);
      }
    });
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

function completeTask(tracker: TaskTracker, taskId: string): void {
  const task = tracker.tasks.find((t) => t.id === taskId);

  if (!task) {
    console.error(`\n❌ Task ${taskId} not found\n`);
    return;
  }

  if (task.status === 'completed') {
    console.log(`\n✅ Task ${taskId} already completed\n`);
    return;
  }

  task.status = 'completed';
  task.completedAt = new Date().toISOString();

  // Update stats
  if (task.status !== 'in_progress') {
    tracker.stats.pendingTasks--;
  } else {
    tracker.stats.inProgressTasks--;
  }
  tracker.stats.completedTasks++;
  tracker.stats.completedMinutes += task.estimatedMinutes;

  saveTracker(tracker);

  console.log(`\n✅ Task ${taskId} marked as completed\n`);
  showStatus(tracker);
}

function blockTask(
  tracker: TaskTracker,
  taskId: string,
  reason: string
): void {
  const task = tracker.tasks.find((t) => t.id === taskId);

  if (!task) {
    console.error(`\n❌ Task ${taskId} not found\n`);
    return;
  }

  task.status = 'blocked';
  task.blockedReason = reason;

  // Update stats
  if (task.status === 'pending') {
    tracker.stats.pendingTasks--;
  } else if (task.status === 'in_progress') {
    tracker.stats.inProgressTasks--;
  }
  tracker.stats.blockedTasks++;

  saveTracker(tracker);

  console.log(`\n🚫 Task ${taskId} marked as blocked\n`);
  console.log(`Reason: ${reason}\n`);
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];

const tracker = loadTracker();

switch (command) {
  case 'status':
    showStatus(tracker);
    break;

  case 'next':
    showNextTask(tracker);
    break;

  case 'list':
    const filter = args[1]?.replace('--', '') as any;
    listTasks(tracker, filter);
    break;

  case 'complete':
    if (!args[1]) {
      console.error('\n❌ Usage: task-cli complete <task-id>\n');
      process.exit(1);
    }
    completeTask(tracker, args[1]);
    break;

  case 'block':
    if (!args[1] || !args[2]) {
      console.error(
        '\n❌ Usage: task-cli block <task-id> <reason>\n'
      );
      process.exit(1);
    }
    blockTask(tracker, args[1], args.slice(2).join(' '));
    break;

  default:
    console.log('\n📋 Task CLI - Business L&D Implementation\n');
    console.log('Usage:');
    console.log('  task-cli status              # Show overall progress');
    console.log('  task-cli next                # Show next available task');
    console.log('  task-cli list                # List all tasks');
    console.log('  task-cli list --pending      # List pending tasks');
    console.log('  task-cli list --completed    # List completed tasks');
    console.log('  task-cli complete <id>       # Mark task as completed');
    console.log('  task-cli block <id> <reason> # Mark task as blocked\n');
}
