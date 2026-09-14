import { chromium } from "playwright";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/GOOD/.gemini/antigravity-ide/brain/b3278bc4-a103-4d8e-8896-15634bba8f0c";

async function main() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // 1. Enter bad credentials in Sign In to trigger error alert
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "wrongpass");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4500);

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "login_error_state.png") });
  console.log("Error state screenshot captured!");

  await browser.close();
}

main().catch(console.error);
