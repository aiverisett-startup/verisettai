import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const VIDEO_PATH = path.join(process.cwd(), "public", "how-it-works.webm");

console.log("Starting automated video recording for Verisett AI...");

if (fs.existsSync(VIDEO_PATH)) {
  fs.unlinkSync(VIDEO_PATH);
  console.log("Cleared existing video file.");
}

const TEMP_PROFILE = path.join(process.cwd(), ".edge-temp-profile");
if (!fs.existsSync(TEMP_PROFILE)) {
  fs.mkdirSync(TEMP_PROFILE, { recursive: true });
}

const child = spawn(EDGE_PATH, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  `--user-data-dir=${TEMP_PROFILE}`,
  "--window-size=1920,1080",
  "--use-fake-ui-for-media-stream",
  "--autoplay-policy=no-user-gesture-required",
  "--disable-features=TabDiscarding,CalculateNativeWinOcclusion,AutomaticTabDiscarding,SleepingTabs",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding",
  "--enable-logging=stderr",
  "http://localhost:3000/video-recorder.html?autostart=1"
]);

child.stdout?.on("data", (d) => console.log("[Edge STDOUT]", d.toString().trim()));
child.stderr?.on("data", (d) => console.log("[Edge STDERR]", d.toString().trim()));

child.on("error", (err) => {
  console.error("Failed to launch Edge:", err);
  process.exit(1);
});

let elapsedSeconds = 0;
const checkInterval = setInterval(() => {
  elapsedSeconds += 2;
  console.log(`Recording in progress... (${elapsedSeconds}s / 35s)`);

  if (fs.existsSync(VIDEO_PATH)) {
    const stats = fs.statSync(VIDEO_PATH);
    if (stats.size > 100000) {
      console.log(`✓ Video generation successful! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      clearInterval(checkInterval);
      try {
        child.kill();
      } catch {}
      process.exit(0);
    }
  }

  if (elapsedSeconds > 45) {
    console.log("Timed out waiting for video upload. Exiting.");
    clearInterval(checkInterval);
    try {
      child.kill();
    } catch {}
    process.exit(1);
  }
}, 2000);
