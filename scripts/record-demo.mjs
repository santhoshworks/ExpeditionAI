/**
 * ThoughtMap - Hero Banner Demo Video Recorder
 *
 * Records a polished walkthrough of the app's key features using Playwright.
 *
 * Usage:
 *   DEMO_EMAIL="your@email.com" DEMO_PASSWORD="yourpass" node scripts/record-demo.mjs
 *
 * Options (env vars):
 *   DEMO_EMAIL       - Login email (required)
 *   DEMO_PASSWORD    - Login password (required)
 *   BASE_URL         - App URL (default: http://localhost:3000)
 *   VIEWPORT_WIDTH   - Video width (default: 1440)
 *   VIEWPORT_HEIGHT  - Video height (default: 900)
 *   SLOW_MO          - Slow motion ms between actions (default: 50)
 *   EXPEDITION_ID    - Existing expedition ID to demo (optional - skips creation)
 *
 * Output: ./demo-recordings/ directory with video files
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// ─── Configuration ──────────────────────────────────────────────────────────
const CONFIG = {
  email: process.env.DEMO_EMAIL,
  password: process.env.DEMO_PASSWORD,
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH || "1440"),
    height: parseInt(process.env.VIEWPORT_HEIGHT || "900"),
  },
  slowMo: parseInt(process.env.SLOW_MO || "50"),
  expeditionId: process.env.EXPEDITION_ID || null,
  outputDir: join(PROJECT_ROOT, "demo-recordings"),
};

if (!CONFIG.email || !CONFIG.password) {
  console.error(
    "❌ Missing credentials. Usage:\n" +
      '  DEMO_EMAIL="you@email.com" DEMO_PASSWORD="pass" node scripts/record-demo.mjs'
  );
  process.exit(1);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Smooth scroll to an element */
async function smoothScrollTo(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, selector);
  await page.waitForTimeout(800);
}

/** Smooth scroll down by pixels */
async function smoothScrollDown(page, pixels = 300) {
  await page.evaluate((px) => {
    window.scrollBy({ top: px, behavior: "smooth" });
  }, pixels);
  await page.waitForTimeout(600);
}

/** Type text with realistic human-like speed */
async function humanType(page, selector, text, delay = 60) {
  await page.click(selector);
  await page.waitForTimeout(200);
  await page.type(selector, text, { delay });
}

/** Navigate to a page reliably (handles Next.js dev mode quirks) */
async function navigateTo(page, url) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch {
    // If domcontentloaded times out, the page is likely still usable
    console.log(`   ⏳ Slow page load for ${url}, continuing...`);
  }
  // Always wait for React to hydrate
  await page.waitForTimeout(3000);
}

/** Wait for page to be ready */
async function waitForStable(page, timeout = 5000) {
  await page.waitForTimeout(timeout > 3000 ? 3000 : 1500);
}

/** Take a cinematic pause to let viewers absorb the screen */
async function pause(page, ms = 2000) {
  await page.waitForTimeout(ms);
}

/** Move mouse smoothly to an element (visual cursor for video) */
async function hoverElement(page, selector) {
  const el = await page.$(selector);
  if (el) {
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 20,
      });
      await page.waitForTimeout(300);
    }
  }
}

// ─── Main Recording Flow ────────────────────────────────────────────────────

async function recordDemo() {
  // Ensure output directory exists
  if (!existsSync(CONFIG.outputDir)) {
    mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  console.log("🎬 Starting ThoughtMap demo recording...");
  console.log(`   📐 Viewport: ${CONFIG.viewport.width}x${CONFIG.viewport.height}`);
  console.log(`   🌐 URL: ${CONFIG.baseUrl}`);
  console.log(`   📁 Output: ${CONFIG.outputDir}`);

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging; set true for CI
    slowMo: CONFIG.slowMo,
  });

  // ── Warm-up: pre-compile Next.js pages in dev mode ────────────────
  console.log("🔥 Warming up Next.js pages (dev mode compilation)...");
  const warmupCtx = await browser.newContext();
  const warmupPage = await warmupCtx.newPage();
  const warmupUrls = [
    "/", "/login", "/dashboard", "/create-deck",
    "/review", "/wishlist", "/settings",
  ];
  for (const path of warmupUrls) {
    try {
      await warmupPage.goto(`${CONFIG.baseUrl}${path}`, {
        waitUntil: "load",
        timeout: 60000,
      });
      console.log(`   ✓ ${path}`);
    } catch {
      console.log(`   ⚠ ${path} (slow but ok)`);
    }
  }
  await warmupCtx.close();
  console.log("🔥 Warm-up complete!\n");

  // ── Now create the actual recording context ────────────────────────
  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    recordVideo: {
      dir: CONFIG.outputDir,
      size: CONFIG.viewport,
    },
    colorScheme: "light",
    locale: "en-US",
    reducedMotion: "no-preference",
  });

  const page = await context.newPage();

  try {
    // ────────────────────────────────────────────────────────────────────
    // SCENE 1: Landing Page
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 1: Landing Page");
    await navigateTo(page, CONFIG.baseUrl);

    // Scroll down to show landing page sections
    await smoothScrollDown(page, 400);
    await pause(page, 2000);
    await smoothScrollDown(page, 400);
    await pause(page, 2000);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(page, 1500);

    // ────────────────────────────────────────────────────────────────────
    // SCENE 2: Login
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 2: Login");
    await navigateTo(page, `${CONFIG.baseUrl}/login`);

    // Fill login form with realistic typing
    await humanType(page, "#email", CONFIG.email, 40);
    await pause(page, 500);
    await humanType(page, "#password", CONFIG.password, 40);
    await pause(page, 800);

    // Click sign in
    await page.click('button[type="submit"]');
    await waitForStable(page, 10000);
    await pause(page, 2000);

    // ────────────────────────────────────────────────────────────────────
    // SCENE 3: Dashboard Overview
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 3: Dashboard");

    // Should be redirected to dashboard after login
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await waitForStable(page);
    await pause(page, 3000);

    // Scroll to show analytics cards
    await smoothScrollDown(page, 300);
    await pause(page, 2500);

    // Scroll to show expedition list
    await smoothScrollDown(page, 400);
    await pause(page, 2500);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(page, 1500);

    // ────────────────────────────────────────────────────────────────────
    // SCENE 4: Open/Create Expedition
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 4: Expedition");

    if (CONFIG.expeditionId) {
      // Use existing expedition
      await navigateTo(page, `${CONFIG.baseUrl}/expedition/${CONFIG.expeditionId}`);
    } else {
      // Check if there are existing expedition cards (links to /expedition/)
      const expeditionLink = await page.$('a[href*="/expedition/"]');
      if (expeditionLink) {
        // Click the first existing expedition
        await hoverElement(page, 'a[href*="/expedition/"]');
        await pause(page, 500);
        await expeditionLink.click();
      } else {
        // No expeditions - click "New Expedition" or "Create Your First Expedition"
        const newExpBtn = await page.$('button:has-text("New Expedition")') ||
          await page.$('button:has-text("Create Your First Expedition")');
        if (newExpBtn) {
          await newExpBtn.click();
          await pause(page, 1500);

          // Wait for the Radix dialog to appear
          await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
          await pause(page, 500);

          // Fill topic using the #title input inside the dialog
          await page.fill('#title', '');
          await page.type('#title', "Machine Learning Fundamentals", { delay: 50 });
          await pause(page, 800);

          // Fill optional description
          await page.fill('#description', '');
          await page.type('#description', "Understanding neural networks and deep learning", { delay: 40 });
          await pause(page, 800);

          // Click "Begin Expedition" button inside the dialog
          const beginBtn = await page.$('[role="dialog"] button:has-text("Begin Expedition")');
          if (beginBtn) {
            await beginBtn.click();
          }
        }
      }
    }

    // Wait for expedition page to load
    try {
      await page.waitForURL("**/expedition/**", { timeout: 20000 });
    } catch {
      console.log("   ⚠️  Could not navigate to expedition page");
    }
    await waitForStable(page, 10000);
    await pause(page, 3000);

    // ────────────────────────────────────────────────────────────────────
    // SCENE 5: Chat Interface - Explore the expedition
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 5: Chat Interface");

    // Show the trail sidebar (if visible on desktop)
    await pause(page, 2000);

    // Type a message in the chat
    const chatInput = await page.$(
      'textarea[placeholder*="message"], textarea[placeholder*="Message"], textarea[placeholder*="ask"], textarea[placeholder*="Ask"], textarea, input[type="text"][placeholder*="message"]'
    );

    if (chatInput) {
      await chatInput.click();
      await pause(page, 500);

      const demoMessage = "Explain the key concepts of neural networks and how they learn from data";
      await page.keyboard.type(demoMessage, { delay: 35 });
      await pause(page, 1000);

      // Submit the message
      await page.keyboard.press("Enter");
      await pause(page, 2000);

      // Wait for AI response to stream in
      console.log("   ⏳ Waiting for AI response...");
      try {
        // Wait for a response message to appear
        await page.waitForSelector(
          '[class*="message"]:last-child, [class*="Message"]:last-child, [data-role="assistant"]',
          { timeout: 30000 }
        );
      } catch {
        // Response may have different selectors
        console.log("   ⏳ Waiting additional time for response...");
      }

      // Let the response stream and render
      await pause(page, 8000);

      // Scroll down to see the full response
      const chatContainer = await page.$(
        '[class*="chat"] [class*="scroll"], [class*="message-list"], main, [class*="overflow-y"]'
      );
      if (chatContainer) {
        await chatContainer.evaluate((el) => {
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        });
      }
      await pause(page, 3000);
    }

    // ────────────────────────────────────────────────────────────────────
    // SCENE 6: Toggle Teaching Mode (Content ↔ Coach)
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 6: Teaching Mode Toggle");

    const teachingToggle = await page.$(
      'button:has-text("Coach"), button:has-text("Content"), [class*="teaching"], [class*="mode"]'
    );
    if (teachingToggle) {
      await hoverElement(
        page,
        'button:has-text("Coach"), button:has-text("Content"), [class*="teaching"], [class*="mode"]'
      );
      await pause(page, 800);
      await teachingToggle.click();
      await pause(page, 2000);
    }

    // ────────────────────────────────────────────────────────────────────
    // SCENE 7: Create Flashcard Deck
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 7: Flashcard Creation");

    await navigateTo(page, `${CONFIG.baseUrl}/create-deck`);

    // Show the text input area
    const textTab = await page.$('button:has-text("Text"), [role="tab"]:has-text("Text")');
    if (textTab) {
      await textTab.click();
      await pause(page, 800);
    }

    // Type sample content for flashcard generation
    const contentInput = await page.$(
      'textarea[placeholder*="content"], textarea[placeholder*="paste"], textarea[placeholder*="text"], textarea'
    );
    if (contentInput) {
      await contentInput.click();
      const sampleContent =
        "Neural networks are computational models inspired by the biological neural networks in the human brain. " +
        "They consist of layers of interconnected nodes (neurons) that process information. " +
        "Key concepts include weights, biases, activation functions, backpropagation, and gradient descent. " +
        "Deep learning uses neural networks with many hidden layers to learn complex patterns in data.";

      await page.keyboard.type(sampleContent, { delay: 15 });
      await pause(page, 2000);
    }

    // Click generate button
    const generateBtn = await page.$(
      'button:has-text("Generate"), button:has-text("Create Cards"), button:has-text("generate")'
    );
    if (generateBtn) {
      await hoverElement(
        page,
        'button:has-text("Generate"), button:has-text("Create Cards")'
      );
      await pause(page, 500);
      await generateBtn.click();

      console.log("   ⏳ Waiting for flashcard generation...");
      // Wait for cards to appear
      await pause(page, 8000);

      // Scroll to see generated cards
      await smoothScrollDown(page, 400);
      await pause(page, 3000);
    }

    // ────────────────────────────────────────────────────────────────────
    // SCENE 8: Spaced Repetition Review
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 8: Spaced Repetition Review");

    await navigateTo(page, `${CONFIG.baseUrl}/review`);

    // If there are cards to review, interact with them
    const reviewCard = await page.$(
      '[class*="flashcard"], [class*="card-front"], [class*="review"]'
    );
    if (reviewCard) {
      // Flip the card
      await page.keyboard.press("Space");
      await pause(page, 2500);

      // Rate the card (press 3 for "Good")
      const goodBtn = await page.$(
        'button:has-text("Good"), button:has-text("good")'
      );
      if (goodBtn) {
        await hoverElement(page, 'button:has-text("Good")');
        await pause(page, 500);
        await goodBtn.click();
        await pause(page, 2000);
      }

      // Do another card if available
      await page.keyboard.press("Space");
      await pause(page, 2000);

      const easyBtn = await page.$(
        'button:has-text("Easy"), button:has-text("easy")'
      );
      if (easyBtn) {
        await easyBtn.click();
        await pause(page, 2000);
      }
    } else {
      console.log("   ℹ️  No review cards available, showing empty state");
      await pause(page, 2000);
    }

    // ────────────────────────────────────────────────────────────────────
    // SCENE 9: Wishlist
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 9: Wishlist");

    await navigateTo(page, `${CONFIG.baseUrl}/wishlist`);
    await smoothScrollDown(page, 300);
    await pause(page, 2000);

    // ────────────────────────────────────────────────────────────────────
    // SCENE 10: Settings / Dark Mode
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 10: Settings & Dark Mode");

    await navigateTo(page, `${CONFIG.baseUrl}/settings`);

    // Toggle dark mode if available
    const darkModeToggle = await page.$(
      'button:has-text("Dark"), [class*="theme"], [data-theme], input[type="checkbox"]'
    );
    if (darkModeToggle) {
      await darkModeToggle.click();
      await pause(page, 2500);

      // Show the app in dark mode briefly
      await navigateTo(page, `${CONFIG.baseUrl}/dashboard`);
      await pause(page, 2000);

      // Toggle back to light
      await navigateTo(page, `${CONFIG.baseUrl}/settings`);
      const lightToggle = await page.$(
        'button:has-text("Light"), [class*="theme"], input[type="checkbox"]'
      );
      if (lightToggle) {
        await lightToggle.click();
        await pause(page, 1500);
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // SCENE 11: Return to Dashboard (closing shot)
    // ────────────────────────────────────────────────────────────────────
    console.log("🎬 Scene 11: Closing - Dashboard");

    await navigateTo(page, `${CONFIG.baseUrl}/dashboard`);

    // Final smooth scroll showing everything
    await smoothScrollDown(page, 200);
    await pause(page, 1500);
    await smoothScrollDown(page, 200);
    await pause(page, 2000);

    console.log("\n✅ Demo recording completed!");
  } catch (error) {
    console.error("❌ Recording error:", error.message);
    // Take a screenshot on error for debugging
    await page.screenshot({
      path: join(CONFIG.outputDir, "error-screenshot.png"),
    });
    console.log(
      "   📸 Error screenshot saved to demo-recordings/error-screenshot.png"
    );
  } finally {
    // Close context to finalize video
    await context.close();
    await browser.close();

    console.log(`\n📁 Video saved to: ${CONFIG.outputDir}/`);
    console.log("   Look for the .webm file in that directory.");
    console.log("\n💡 Tips:");
    console.log("   - Convert to MP4: ffmpeg -i video.webm -c:v libx264 -crf 20 demo.mp4");
    console.log("   - Trim video: ffmpeg -ss 00:00:02 -i demo.mp4 -to 00:00:30 -c copy hero.mp4");
    console.log("   - Create GIF: ffmpeg -i demo.mp4 -vf 'fps=15,scale=720:-1' demo.gif");
  }
}

// Run it
recordDemo().catch(console.error);
