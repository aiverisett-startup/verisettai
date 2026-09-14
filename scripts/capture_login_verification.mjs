import { chromium } from "playwright";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/GOOD/.gemini/antigravity-ide/brain/b3278bc4-a103-4d8e-8896-15634bba8f0c";

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({
    headless: true,
    channel: "msedge"
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // 1. Landing Page Navbar and Hero showing "LOGIN"
  console.log("Capturing landing page with LOGIN buttons...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "landing_nav_login_button.png"),
    clip: { x: 0, y: 0, width: 1440, height: 800 }
  });

  // 2. Main Login Page (/login)
  console.log("Capturing /login with updated font styles...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "login_page_styled.png")
  });

  // 3. Minimalist Access Account (/access-account)
  console.log("Capturing /access-account with updated font styles...");
  await page.goto("http://localhost:3000/access-account", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "access_account_styled.png")
  });

  await browser.close();
  console.log("All verification screenshots successfully captured!");
}

main().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
