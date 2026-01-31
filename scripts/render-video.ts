import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Video rendering script for Remotion video generation
 * Generates MP4 video from Remotion composition
 */

const projectRoot = path.join(__dirname, '..');
const videosDir = path.join(projectRoot, 'public', 'videos');
const outputPath = path.join(videosDir, 'expedition-ai-intro.mp4');

// Ensure videos directory exists
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
  console.log(`Created videos directory: ${videosDir}`);
}

console.log('Starting Remotion video render...');
console.log(`Output path: ${outputPath}`);

try {
  // Render the video using Remotion CLI
  // The composition ID "ThoughtMapVideo" is defined in remotion/Root.tsx
  const command = `npx remotion render remotion/Root.tsx ThoughtMapVideo "${outputPath}" --codec h264 --crf 23`;

  console.log(`\nExecuting: ${command}\n`);
  execSync(command, {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      // Optimize for faster rendering
      NODE_ENV: 'production',
    },
  });

  // Verify the output file was created
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n✓ Video rendering completed successfully!`);
    console.log(`  Output file: ${outputPath}`);
    console.log(`  File size: ${sizeInMB} MB`);
  } else {
    throw new Error('Video file was not created');
  }
} catch (error) {
  console.error('Error during video rendering:');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
