import { chromium } from "playwright";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/GOOD/.gemini/antigravity-ide/brain/b3278bc4-a103-4d8e-8896-15634bba8f0c";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: "msedge"
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();
  console.log("Navigating to home page...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  
  console.log("Waiting 16s for timed modal to trigger...");
  await page.waitForTimeout(16000);

  console.log("Capturing golden_timed_modal_open.png...");
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "golden_timed_modal_open.png")
  });

  await browser.close();
  console.log("Timed modal captured!");
}

run().catch(console.error);
