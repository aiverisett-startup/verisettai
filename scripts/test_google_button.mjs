import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  console.log("On login page. Clicking Continue with Google...");
  
  await page.click('button:has-text("Continue with Google")');
  await page.waitForTimeout(1500);

  console.log("Current URL after click:", page.url());
  const user = await page.evaluate(() => ({
    email: localStorage.getItem("verisett_user_email"),
    name: localStorage.getItem("verisett_user_name"),
    provider: localStorage.getItem("verisett_auth_provider"),
  }));
  console.log("Stored auth user:", user);

  await page.screenshot({
    path: "C:/Users/GOOD/.gemini/antigravity-ide/brain/b3278bc4-a103-4d8e-8896-15634bba8f0c/google_click_verified.png"
  });

  await browser.close();
}

main().catch(console.error);
