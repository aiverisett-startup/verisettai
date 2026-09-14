const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * Smoothly scroll page to target scroll position over specified duration
 */
async function smoothScroll(page, targetY, durationMs = 1200) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();

    return new Promise((resolve) => {
      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // easeInOutQuad easing
        const ease = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        window.scrollTo(0, startY + diff * ease);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
}

async function recordWalkthrough() {
  const recordingsDir = path.resolve(__dirname, 'public', '_temp_rec');
  const finalVideoPath = path.resolve(__dirname, 'public', 'demo_recording.webm');

  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  console.log('🚀 Launching Chromium browser (1920x1080)...');
  let browser;
  const launchOptions = [
    { args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] },
    { executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    { executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    { channel: 'msedge', args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    { channel: 'chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  ];

  for (const opt of launchOptions) {
    try {
      browser = await chromium.launch({ headless: true, ...opt });
      console.log(`✓ Successfully launched browser with option:`, opt.executablePath || opt.channel || 'standard chromium');
      break;
    } catch (err) {
      // try next
    }
  }

  if (!browser) {
    throw new Error('Could not launch any browser (standard chromium, Edge, or Chrome).');
  }

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log('🌐 Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#architecture', { timeout: 15000 });

  // 1. Hero section view
  console.log('🎬 Scene 1: Capturing Hero Section & Global Vault Header...');
  await page.waitForTimeout(2500);

  // 2. Smooth scroll to Protocol Architecture
  console.log('🎬 Scene 2: Smooth scrolling to Protocol Architecture...');
  const archElement = await page.$('#architecture');
  if (archElement) {
    const box = await archElement.boundingBox();
    if (box) {
      await smoothScroll(page, box.y - 70, 1600);
      await page.waitForTimeout(3000);
    }
  }

  // 3. Smooth scroll to Cryptographic Assertion Engine (Features)
  console.log('🎬 Scene 3: Smooth scrolling to Cryptographic Assertion Engine...');
  const assertElement = await page.$('#assertions');
  if (assertElement) {
    const box = await assertElement.boundingBox();
    if (box) {
      await smoothScroll(page, box.y - 70, 1600);
      await page.waitForTimeout(2500);
    }
  }

  // 4. Smooth scroll to Marketplace
  console.log('🎬 Scene 4: Smooth scrolling to Autonomous Worker Marketplace...');
  const marketElement = await page.$('#marketplace');
  if (marketElement) {
    const box = await marketElement.boundingBox();
    if (box) {
      await smoothScroll(page, box.y - 70, 1600);
      await page.waitForTimeout(2500);
    }
  }

  // 5. Smooth scroll to Playground (Interactive Console)
  console.log('🎬 Scene 5: Smooth scrolling to Interactive Settlement Console...');
  const playgroundElement = await page.$('#playground');
  if (playgroundElement) {
    const box = await playgroundElement.boundingBox();
    if (box) {
      await smoothScroll(page, box.y - 70, 1600);
      await page.waitForTimeout(1800);
    }
  }

  // 6. Interactive Demo Action: Type sample contract data & click Execute
  console.log('⚡ Interacting with Escrow Playground: Selecting sample contract parameters...');
  
  // Change amount selector to $25.00 USDC
  const amountSelect = await page.$('#playground select');
  if (amountSelect) {
    await amountSelect.selectOption('25');
    await page.waitForTimeout(800);
  }

  // Type sample contract data in the worker output textarea
  const textareas = await page.$$('#playground textarea');
  if (textareas.length >= 2) {
    console.log('⚡ Typing sample verified contract output payload...');
    await textareas[1].click();
    await textareas[1].fill(JSON.stringify({
      confidence_score: 0.985,
      model_name: "claude-3-7-sonnet",
      execution_trace: "trc_verisett_prod_audit_984b2",
      verified_by: "Verisett Dual-Agent Settlement Layer"
    }, null, 2));
    await page.waitForTimeout(1200);
  }

  // Click Execute Clearing Test button
  console.log('⚡ Clicking "Execute Clearing Test" button...');
  const executeBtn = await page.$('#playground button:has-text("Execute")');
  if (executeBtn) {
    await executeBtn.click();
  }

  // Wait for verification state to turn green
  console.log('⏳ Waiting for verification state to turn green (SETTLED)...');
  await page.waitForSelector('#playground span:has-text("SETTLED")', { timeout: 15000 });
  console.log('✅ Verification state confirmed: SETTLED in green!');

  // Smoothly scroll down slightly to capture the newly appended contract in the ledger
  await page.waitForTimeout(1000);
  const ledgerElement = await page.$('#contracts');
  if (ledgerElement) {
    const box = await ledgerElement.boundingBox();
    if (box) {
      await smoothScroll(page, box.y - 100, 1000);
    }
  }

  // Requirement: "Waits 3 seconds on the final confirmation screen so it captures cleanly."
  console.log('⏳ Waiting 3 seconds on final confirmation screen...');
  await page.waitForTimeout(3000);

  // Close page and context to finalize video writing
  console.log('💾 Closing context and finalizing video file...');
  const videoObj = page.video();
  await context.close();
  await browser.close();

  if (videoObj) {
    const tempVideoPath = await videoObj.path();
    console.log(`📹 Source recording generated at: ${tempVideoPath}`);
    
    // Copy/move to ./public/demo_recording.webm
    fs.copyFileSync(tempVideoPath, finalVideoPath);
    console.log(`🎉 1080p Walkthrough Video successfully saved to: ${finalVideoPath}`);

    // Clean up temporary recording directory
    try {
      fs.rmSync(recordingsDir, { recursive: true, force: true });
    } catch {}

    const stats = fs.statSync(finalVideoPath);
    console.log(`📊 Video file size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  } else {
    throw new Error('Playwright video object was not created.');
  }
}

recordWalkthrough()
  .then(() => {
    console.log('✅ Automated recording script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error recording demo:', err);
    process.exit(1);
  });
