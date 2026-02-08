/**
 * ThoughtMap - ElevenLabs Voiceover Generator & Video Merger
 *
 * Generates voiceover audio for each demo scene using ElevenLabs TTS API,
 * then merges them with the screen recording using ffmpeg.
 *
 * Prerequisites:
 *   1. ElevenLabs API key: https://elevenlabs.io/app/settings/api-keys
 *   2. ffmpeg installed: brew install ffmpeg
 *   3. A screen recording file (from record-demo.mjs or Mac screen recorder)
 *
 * Usage:
 *   ELEVENLABS_API_KEY="your-key" node scripts/generate-voiceover.mjs
 *
 * Options (env vars):
 *   ELEVENLABS_API_KEY   - Your ElevenLabs API key (required)
 *   VOICE_ID             - ElevenLabs voice ID (default: "pNInz6obpgDQGcFmaJgB" = Adam)
 *   VIDEO_INPUT          - Path to screen recording (default: ./demo-recordings/*.webm or ./public/videos/demo.mov)
 *   OUTPUT_DIR           - Output directory (default: ./demo-recordings)
 *   MODEL_ID             - ElevenLabs model (default: "eleven_multilingual_v2")
 *   STABILITY            - Voice stability 0-1 (default: 0.5)
 *   SIMILARITY_BOOST     - Voice similarity 0-1 (default: 0.75)
 *   STYLE                - Style exaggeration 0-1 (default: 0.3)
 *   SKIP_MERGE           - Set "true" to only generate audio, skip video merge
 *
 * Popular ElevenLabs Voice IDs:
 *   Adam (professional):    pNInz6obpgDQGcFmaJgB
 *   Josh (warm):            TxGEqnHWrfWFTfGW9XjX
 *   Rachel (clear female):  21m00Tcm4TlvDq8ikWAM
 *   Antoni (friendly):      ErXwobaYiN019PkySvjV
 *   Domi (confident):       AZnzlk1XvdvUeBnXmlld
 *   Elli (cheerful):        MF3mGyEYCl7XYWbV9V6O
 *
 * Output:
 *   - Individual scene audio files: scene-01.mp3, scene-02.mp3, ...
 *   - Combined voiceover: voiceover-combined.mp3
 *   - Final video with voiceover: demo-with-voiceover.mp4
 */

import { writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// ─── Configuration ──────────────────────────────────────────────────────────

const CONFIG = {
  apiKey: process.env.ELEVENLABS_API_KEY,
  voiceId: process.env.VOICE_ID || "pNInz6obpgDQGcFmaJgB", // Adam
  modelId: process.env.MODEL_ID || "eleven_multilingual_v2",
  videoInput: process.env.VIDEO_INPUT || null,
  outputDir: process.env.OUTPUT_DIR || join(PROJECT_ROOT, "demo-recordings"),
  stability: parseFloat(process.env.STABILITY || "0.5"),
  similarityBoost: parseFloat(process.env.SIMILARITY_BOOST || "0.75"),
  style: parseFloat(process.env.STYLE || "0.3"),
  skipMerge: process.env.SKIP_MERGE === "true",
};

if (!CONFIG.apiKey) {
  console.error(
    "Missing ElevenLabs API key. Usage:\n" +
      '  ELEVENLABS_API_KEY="your-key" node scripts/generate-voiceover.mjs\n\n' +
      "Get your API key at: https://elevenlabs.io/app/settings/api-keys"
  );
  process.exit(1);
}

// ─── Voiceover Script ───────────────────────────────────────────────────────
// Each scene has text and a silence duration (seconds) AFTER the narration.
// Adjust silences to sync with your screen recording.

const SCENES = [
  {
    id: "01",
    name: "Landing Page",
    text: "Ever feel like learning something new turns into a mess of scattered browser tabs and half-watched YouTube videos? What if there was a better way to explore any subject — one that actually keeps everything organized?",
    silenceAfter: 2,
  },
  {
    id: "02",
    name: "Login",
    text: "Let me show you ThoughtMap — an AI-powered learning platform where you chat, explore, and truly understand any topic.",
    silenceAfter: 3,
  },
  {
    id: "03",
    name: "Dashboard Overview",
    text: "This is your dashboard. It shows all your learning expeditions at a glance — how many trails you've explored, topics you've covered, and your overall progress. Think of it as mission control for your learning.",
    silenceAfter: 2,
  },
  {
    id: "04",
    name: "Create/Open Expedition",
    text: "Let's dive into an expedition. Each one starts with a topic you want to learn. Today, we'll explore machine learning fundamentals.",
    silenceAfter: 3,
  },
  {
    id: "05",
    name: "Chat Interface",
    text: "Here's where the magic happens. Just ask a question — like 'explain the key concepts of neural networks' — and the AI gives you a clear, structured explanation. But here's what makes ThoughtMap different: as you learn, you can branch into new trails for any concept that sparks your curiosity, without ever losing track of where you started.",
    silenceAfter: 2,
  },
  {
    id: "06",
    name: "Teaching Mode Toggle",
    text: "You can switch between coaching mode, where the AI guides you with questions, and content mode for straight explanations. Your choice.",
    silenceAfter: 2,
  },
  {
    id: "07",
    name: "Flashcard Creation",
    text: "Ready to lock in what you've learned? Paste any content and ThoughtMap generates smart flashcards automatically. It pulls out the key concepts so you don't have to.",
    silenceAfter: 2,
  },
  {
    id: "08",
    name: "Spaced Repetition Review",
    text: "Review your cards with spaced repetition — the same technique used by medical students and language learners. Rate how well you know each concept, and the system schedules your next review at the perfect time.",
    silenceAfter: 2,
  },
  {
    id: "09",
    name: "Wishlist",
    text: "Found something interesting during a conversation? Save it to your wishlist so you never forget what you want to explore next.",
    silenceAfter: 2,
  },
  {
    id: "10",
    name: "Settings & Dark Mode",
    text: "And yes — dark mode. Because late-night learning sessions deserve easy-on-the-eyes styling.",
    silenceAfter: 2,
  },
  {
    id: "11",
    name: "Closing Shot",
    text: "ThoughtMap turns chaotic curiosity into structured understanding. Eight curated AI models. Visual learning maps. Personalized coaching. And everything you need to finally master the topics that matter to you. Start your free expedition today.",
    silenceAfter: 1,
  },
];

// ─── ElevenLabs TTS ─────────────────────────────────────────────────────────

async function generateSpeech(text, outputPath) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${CONFIG.voiceId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": CONFIG.apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: CONFIG.modelId,
      voice_settings: {
        stability: CONFIG.stability,
        similarity_boost: CONFIG.similarityBoost,
        style: CONFIG.style,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `ElevenLabs API error (${response.status}): ${errorBody}`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outputPath, buffer);
  return outputPath;
}

// ─── Audio Duration Helper ──────────────────────────────────────────────────

function getAudioDuration(filePath) {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: "utf-8" }
    ).trim();
    return parseFloat(result);
  } catch {
    console.warn(`   Could not determine duration for ${filePath}`);
    return 0;
  }
}

// ─── Generate Silence ───────────────────────────────────────────────────────

function generateSilence(durationSec, outputPath) {
  execSync(
    `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t ${durationSec} -q:a 9 "${outputPath}"`,
    { stdio: "pipe" }
  );
}

// ─── Find Video File ────────────────────────────────────────────────────────

function findVideoFile() {
  if (CONFIG.videoInput && existsSync(CONFIG.videoInput)) {
    return CONFIG.videoInput;
  }

  // Check demo-recordings for webm files
  const recordingsDir = join(PROJECT_ROOT, "demo-recordings");
  if (existsSync(recordingsDir)) {
    const webmFiles = readdirSync(recordingsDir).filter((f) =>
      f.endsWith(".webm")
    );
    if (webmFiles.length > 0) {
      return join(recordingsDir, webmFiles[webmFiles.length - 1]);
    }
  }

  // Check for the demo.mov in public/videos
  const demoMov = join(PROJECT_ROOT, "public/videos/demo.mov");
  if (existsSync(demoMov)) return demoMov;

  const demoMp4 = join(PROJECT_ROOT, "public/videos/demo.mp4");
  if (existsSync(demoMp4)) return demoMp4;

  return null;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  // Ensure output directory exists
  if (!existsSync(CONFIG.outputDir)) {
    mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const audioDir = join(CONFIG.outputDir, "voiceover-audio");
  if (!existsSync(audioDir)) {
    mkdirSync(audioDir, { recursive: true });
  }

  console.log("=== ThoughtMap Voiceover Generator ===\n");
  console.log(`Voice ID: ${CONFIG.voiceId}`);
  console.log(`Model:    ${CONFIG.modelId}`);
  console.log(`Output:   ${audioDir}\n`);

  // ── Step 1: Generate speech for each scene ──────────────────────────

  console.log("--- Step 1: Generating voiceover audio per scene ---\n");

  const sceneFiles = [];

  for (const scene of SCENES) {
    const audioFile = join(audioDir, `scene-${scene.id}.mp3`);
    const silenceFile = join(audioDir, `silence-${scene.id}.mp3`);

    // Check if already generated (skip for faster re-runs)
    if (existsSync(audioFile)) {
      console.log(
        `   [cached] Scene ${scene.id}: ${scene.name} (${audioFile})`
      );
    } else {
      process.stdout.write(
        `   Generating Scene ${scene.id}: ${scene.name}...`
      );
      await generateSpeech(scene.text, audioFile);
      console.log(" done");
    }

    const duration = getAudioDuration(audioFile);
    console.log(`            Duration: ${duration.toFixed(1)}s + ${scene.silenceAfter}s silence\n`);

    sceneFiles.push(audioFile);

    // Generate silence gap between scenes
    if (scene.silenceAfter > 0) {
      generateSilence(scene.silenceAfter, silenceFile);
      sceneFiles.push(silenceFile);
    }
  }

  // ── Step 2: Concatenate all scene audio into one file ───────────────

  console.log("--- Step 2: Combining all scenes into single voiceover ---\n");

  const concatListPath = join(audioDir, "concat-list.txt");
  const concatContent = sceneFiles.map((f) => `file '${f}'`).join("\n");
  writeFileSync(concatListPath, concatContent);

  const combinedAudio = join(CONFIG.outputDir, "voiceover-combined.mp3");
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:a libmp3lame -q:a 2 "${combinedAudio}"`,
    { stdio: "pipe" }
  );

  const totalDuration = getAudioDuration(combinedAudio);
  console.log(`   Combined voiceover: ${combinedAudio}`);
  console.log(`   Total duration: ${totalDuration.toFixed(1)}s\n`);

  // ── Step 3: Merge with video (optional) ─────────────────────────────

  if (CONFIG.skipMerge) {
    console.log("--- Skipping video merge (SKIP_MERGE=true) ---\n");
    printManualMergeInstructions(combinedAudio);
    return;
  }

  const videoFile = findVideoFile();
  if (!videoFile) {
    console.log("--- No video file found for merge ---\n");
    console.log("   To merge later, either:");
    console.log("   1. Set VIDEO_INPUT=/path/to/video.mov");
    console.log("   2. Run record-demo.mjs first to generate a .webm");
    console.log("   3. Use Mac screen recording and save to demo-recordings/\n");
    printManualMergeInstructions(combinedAudio);
    return;
  }

  console.log(`--- Step 3: Merging voiceover with video ---\n`);
  console.log(`   Video: ${videoFile}`);

  const videoDuration = getAudioDuration(videoFile);
  console.log(`   Video duration: ${videoDuration.toFixed(1)}s`);
  console.log(`   Audio duration: ${totalDuration.toFixed(1)}s\n`);

  if (Math.abs(videoDuration - totalDuration) > 10) {
    console.log(
      "   WARNING: Video and audio durations differ by more than 10s."
    );
    console.log(
      "   You may want to adjust scene silences or re-record the video.\n"
    );
  }

  const finalOutput = join(CONFIG.outputDir, "demo-with-voiceover.mp4");

  // Merge: keep original video, replace/add audio track
  // -shortest ensures the output stops at the shorter of the two
  execSync(
    `ffmpeg -y -i "${videoFile}" -i "${combinedAudio}" \
     -c:v libx264 -crf 20 -preset medium \
     -c:a aac -b:a 192k \
     -map 0:v:0 -map 1:a:0 \
     -shortest \
     "${finalOutput}"`,
    { stdio: "inherit" }
  );

  console.log(`\n   Final video saved: ${finalOutput}`);
  console.log(`   Duration: ${Math.min(videoDuration, totalDuration).toFixed(1)}s\n`);

  console.log("=== Done! ===\n");
  console.log("Next steps:");
  console.log("  1. Review the video: open demo-recordings/demo-with-voiceover.mp4");
  console.log("  2. If timing is off, adjust 'silenceAfter' values in this script");
  console.log("  3. Re-run with SKIP_MERGE=true to regenerate audio only");
  console.log("  4. Add background music (optional):");
  console.log(
    '     ffmpeg -i demo-with-voiceover.mp4 -i music.mp3 -filter_complex "[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2" -c:v copy final.mp4'
  );
}

function printManualMergeInstructions(audioPath) {
  console.log("=== Manual Merge Instructions ===\n");
  console.log("Once you have your screen recording, merge with:\n");
  console.log(
    `  ffmpeg -i YOUR_VIDEO.mov -i "${audioPath}" \\`
  );
  console.log("    -c:v libx264 -crf 20 -preset medium \\");
  console.log("    -c:a aac -b:a 192k \\");
  console.log("    -map 0:v:0 -map 1:a:0 \\");
  console.log("    -shortest \\");
  console.log("    demo-recordings/demo-with-voiceover.mp4\n");
  console.log("Or to keep original audio (screen recording) and mix in voiceover:\n");
  console.log(
    `  ffmpeg -i YOUR_VIDEO.mov -i "${audioPath}" \\`
  );
  console.log(
    '    -filter_complex "[0:a]volume=0.3[orig];[1:a]volume=1.0[vo];[orig][vo]amix=inputs=2:duration=shortest" \\'
  );
  console.log("    -c:v libx264 -crf 20 \\");
  console.log("    demo-recordings/demo-with-voiceover.mp4\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
