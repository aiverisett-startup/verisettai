import { chromium } from "playwright";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/GOOD/.gemini/antigravity-ide/brain/b3278bc4-a103-4d8e-8896-15634bba8f0c";

async function main() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // 1. Click "Create Account"
  await page.click('button:has-text("Create Account")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "login_create_account_mode.png") });

  // 2. Click "Sign In" then "Passwordless?"
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("Passwordless?")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "login_magic_link_mode.png") });

  await browser.close();
  console.log("Interactive modes captured successfully!");
}

main().catch(console.error);
