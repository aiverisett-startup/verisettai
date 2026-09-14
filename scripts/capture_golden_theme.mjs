import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const ARTIFACTS_DIR = "C:/Users/GOOD/.gemini/antigravity-ide/brain/b3278bc4-a103-4d8e-8896-15634bba8f0c";

async function run() {
  console.log("Launching Chromium / msedge...");
  const browser = await chromium.launch({
    headless: true,
    channel: "msedge"
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // 1. Landing Hero
  console.log("Navigating to Landing Page...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  console.log("Capturing golden_landing_hero.png...");
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "golden_landing_hero.png"),
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });

  // 2. How It Works Section
  console.log("Capturing golden_how_it_works.png...");
  const howItWorks = page.locator("#how-it-works");
  if (await howItWorks.count() > 0) {
    await howItWorks.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "golden_how_it_works.png")
    });
  }

  // 3. Protocol Architecture Section
  console.log("Capturing golden_protocol_architecture.png...");
  const protoArch = page.locator("#architecture");
  if (await protoArch.count() > 0) {
    await protoArch.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "golden_protocol_architecture.png")
    });
  }

  // 4. Marketplace Section
  console.log("Capturing golden_marketplace.png...");
  const marketplace = page.locator("#marketplace");
  if (await marketplace.count() > 0) {
    await marketplace.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "golden_marketplace.png")
    });
  }

  // 5. Sandbox Simulator Section
  console.log("Capturing golden_sandbox_simulator.png...");
  const sandbox = page.locator("section#sandbox");
  if (await sandbox.count() > 0) {
    await sandbox.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "golden_sandbox_simulator.png")
    });
  }

  // 6. Login / Access Account
  console.log("Navigating to /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  console.log("Capturing golden_login_page.png...");
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "golden_login_page.png")
  });

  // 7. Dashboard
  console.log("Navigating to /dashboard...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  console.log("Capturing golden_dashboard.png...");
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "golden_dashboard.png")
  });

  // 8. 3D Network
  console.log("Navigating to /network...");
  await page.goto("http://localhost:3000/network", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  console.log("Capturing golden_network_3d.png...");
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "golden_network_3d.png")
  });

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
