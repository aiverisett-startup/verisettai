import { Chapter } from "./chapters";

export function drawTourFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  chapters: Chapter[],
  totalDuration: number
) {
  let activeChapter = chapters[0];
  for (const ch of chapters) {
    if (t >= ch.timeStart && t < ch.timeEnd) {
      activeChapter = ch;
      break;
    }
  }

  const w = 1920;
  const h = 1080;

  // Background
  const grad = ctx.createRadialGradient(960, 540, 200, 960, 540, 1000);
  grad.addColorStop(0, "#0E121B");
  grad.addColorStop(1, "#07080C");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle grid
  ctx.strokeStyle = "rgba(30, 41, 59, 0.25)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Top progress bar
  const prog = Math.min(t / totalDuration, 1);
  ctx.fillStyle = "#1E2230";
  ctx.fillRect(0, 0, w, 8);
  const pGrad = ctx.createLinearGradient(0, 0, w, 0);
  pGrad.addColorStop(0, "#10B981");
  pGrad.addColorStop(0.5, "#06B6D4");
  pGrad.addColorStop(1, "#10B981");
  ctx.fillStyle = pGrad;
  ctx.fillRect(0, 0, w * prog, 8);

  // Top HUD
  ctx.fillStyle = "rgba(9, 10, 15, 0.9)";
  ctx.fillRect(80, 40, 1760, 64);
  ctx.strokeStyle = "#1E2230";
  ctx.strokeRect(80, 40, 1760, 64);

  ctx.fillStyle = "#10B981";
  ctx.fillRect(104, 56, 32, 32);
  ctx.fillStyle = "#090A0F";
  ctx.font = "bold 20px monospace";
  ctx.fillText("V", 112, 80);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("VERISETT", 150, 80);
  ctx.fillStyle = "#10B981";
  ctx.fillText(".AI", 260, 80);

  ctx.fillStyle = "#F59E0B";
  ctx.font = "bold 14px monospace";
  ctx.fillText(activeChapter.badge, 1520, 79);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "16px monospace";
  ctx.fillText(`${Math.floor(t)}s / ${totalDuration}s`, 1720, 79);

  const chapterTime = t - activeChapter.timeStart;

  if (activeChapter.id === 1) {
    // SCENE 1: THE VISION
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText("The Autonomous Agent Settlement Layer", 960, 240);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "24px sans-serif";
    ctx.fillText("Enabling untrusted AI agents to safely trade funds and services with zero counterparty risk", 960, 290);

    const nodeY = 560;
    // Agent A
    ctx.fillStyle = "#161922";
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 2;
    ctx.fillRect(280, nodeY - 100, 320, 200);
    ctx.strokeRect(280, nodeY - 100, 320, 200);
    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 24px monospace";
    ctx.fillText("AGENT A (BUYER)", 440, nodeY - 40);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "16px sans-serif";
    ctx.fillText("Needs Web Research", 440, nodeY);
    ctx.fillText("Budget: $0.50 USDC", 440, nodeY + 30);
    ctx.fillText("Requires Strict Schema", 440, nodeY + 60);

    // Gateway
    const pulse = Math.sin(chapterTime * 4) * 4;
    ctx.fillStyle = "#11131A";
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3;
    ctx.fillRect(760 - pulse/2, nodeY - 130 - pulse/2, 400 + pulse, 260 + pulse);
    ctx.strokeRect(760 - pulse/2, nodeY - 130 - pulse/2, 400 + pulse, 260 + pulse);
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 28px monospace";
    ctx.fillText("VERISETT GATEWAY", 960, nodeY - 60);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "18px sans-serif";
    ctx.fillText("✓ Locked Escrow Vault", 960, nodeY - 10);
    ctx.fillText("✓ Assertion Engine", 960, nodeY + 25);
    ctx.fillText("✓ 38ms Settlement Rails", 960, nodeY + 60);
    ctx.fillText("✓ Double-Spend Prevention", 960, nodeY + 95);

    // Agent B
    ctx.fillStyle = "#161922";
    ctx.strokeStyle = "#A855F7";
    ctx.lineWidth = 2;
    ctx.fillRect(1320, nodeY - 100, 320, 200);
    ctx.strokeRect(1320, nodeY - 100, 320, 200);
    ctx.fillStyle = "#A855F7";
    ctx.font = "bold 24px monospace";
    ctx.fillText("AGENT B (WORKER)", 1480, nodeY - 40);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "16px sans-serif";
    ctx.fillText("Crawls Live Web Sources", 1480, nodeY);
    ctx.fillText("Returns Structured JSON", 1480, nodeY + 30);
    ctx.fillText("Guaranteed Instant Pay", 1480, nodeY + 60);

    // Flow
    const flow = (chapterTime % 1.5) / 1.5;
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(600 + (760 - 600) * flow, nodeY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#A855F7";
    ctx.beginPath();
    ctx.arc(1160 + (1320 - 1160) * flow, nodeY, 9, 0, Math.PI * 2);
    ctx.fill();

  } else if (activeChapter.id === 2) {
    // SCENE 2: UNIFIED NAVBAR & VAULT
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("Step 1: Unified Single-Line Navigation & Vault Custody", 960, 210);

    const navY = 320;
    ctx.fillStyle = "#FAFAF8";
    ctx.fillRect(160, navY, 1600, 80);
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 2;
    ctx.strokeRect(160, navY, 1600, 80);

    ctx.fillStyle = "#111317";
    ctx.fillRect(190, navY + 22, 36, 36);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px monospace";
    ctx.fillText("V", 208, navY + 47);

    ctx.fillStyle = "#111317";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Verisett AI", 235, navY + 47);

    const navItems = ["Protocol", "Assertion Engine", "Interactive Console", "Marketplace $5 Free", "Developers"];
    let nx = 390;
    navItems.forEach((item) => {
      ctx.fillStyle = item.includes("$5 Free") ? "#059669" : "#4B5563";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(item, nx, navY + 47);
      nx += 160;
    });

    // Switcher
    ctx.fillStyle = "#111317";
    ctx.fillRect(1230, navY + 24, 75, 32);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px monospace";
    ctx.fillText("Sandbox", 1240, navY + 45);

    // Vault
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 2;
    ctx.fillRect(1410, navY + 22, 170, 36);
    ctx.strokeRect(1410, navY + 22, 170, 36);
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 14px monospace";
    ctx.fillText("● Vault: $10,000", 1425, navY + 45);

    const cy = 480;
    const cW = 490;
    const cH = 360;

    // Card 1
    ctx.fillStyle = "#161922";
    ctx.strokeStyle = "#38BDF8";
    ctx.strokeRect(160, cy, cW, cH);
    ctx.fillRect(160, cy, cW, cH);
    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 20px monospace";
    ctx.fillText("1. SINGLE-LINE ROW GUARANTEE", 190, cy + 45);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "17px sans-serif";
    ctx.fillText("• flex-nowrap & whitespace-nowrap", 190, cy + 90);
    ctx.fillText("• No line breaks or items coming down", 190, cy + 130);
    ctx.fillText("• Smooth horizontal overflow scroll", 190, cy + 170);

    // Card 2
    ctx.fillStyle = "#161922";
    ctx.strokeStyle = "#F59E0B";
    ctx.strokeRect(715, cy, cW, cH);
    ctx.fillRect(715, cy, cW, cH);
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 20px monospace";
    ctx.fillText("2. SANDBOX & MAINNET MODES", 745, cy + 45);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "17px sans-serif";
    ctx.fillText("• Instant toggle between Test & Live", 745, cy + 90);
    ctx.fillText("• Sandbox uses testnet funds", 745, cy + 130);
    ctx.fillText("• Mainnet targets cryptographic enclave", 745, cy + 170);

    // Card 3
    ctx.fillStyle = "#161922";
    ctx.strokeStyle = "#10B981";
    ctx.strokeRect(1270, cy, cW, cH);
    ctx.fillRect(1270, cy, cW, cH);
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 20px monospace";
    ctx.fillText("3. CUSTODIAL ESCROW VAULT", 1300, cy + 45);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "17px sans-serif";
    ctx.fillText("• Pre-fund agent spending budgets", 1300, cy + 90);
    ctx.fillText("• Instant micro-settlement without gas", 1300, cy + 130);
    ctx.fillText("• Complete double-spend prevention", 1300, cy + 170);

  } else if (activeChapter.id === 3) {
    // SCENE 3: PROTOCOL RAILS
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("Step 2: Smart Escrow Locking & 38ms Settlement", 960, 210);

    const states = [
      { name: "1. ESCROW_INIT", color: "#38BDF8", desc: "Agent A locks $0.50 into Vault" },
      { name: "2. WORKER_CLAIM", color: "#F59E0B", desc: "Worker claims task execution" },
      { name: "3. ASSERT_VERIFY", color: "#A855F7", desc: "Verisett runs Schema validation" },
      { name: "4. SETTLED_RELEASE", color: "#10B981", desc: "Instant funds release to worker" }
    ];

    const bw = 340;
    const bh = 240;
    const by = 330;
    states.forEach((s, idx) => {
      const bx = 220 + idx * 400;
      ctx.fillStyle = "#161922";
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);

      ctx.fillStyle = s.color;
      ctx.font = "bold 22px monospace";
      ctx.fillText(s.name, bx + bw/2, by + 50);

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "16px sans-serif";
      ctx.fillText(s.desc, bx + bw/2, by + 110);
    });

    const termY = 640;
    ctx.fillStyle = "#0B0F17";
    ctx.strokeStyle = "#1E2230";
    ctx.fillRect(220, termY, 1480, 200);
    ctx.strokeRect(220, termY, 1480, 200);
    ctx.textAlign = "left";
    ctx.font = "18px monospace";
    ctx.fillStyle = "#10B981";
    ctx.fillText("$ verisett escrow create --amount 50 --schema ./schema.json", 260, termY + 50);
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("> Escrow ID: esc_9a82f1b4092c  |  Status: LOCKED  |  Amount: $0.50 USDC", 260, termY + 95);
    ctx.fillStyle = "#F59E0B";
    ctx.fillText("> [38ms Latency] Funds locked in non-custodial enclave. Waiting for assertion.", 260, termY + 140);

  } else if (activeChapter.id === 4) {
    // SCENE 4: ASSERTION ENGINE
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("Step 3: Cryptographic Assertion Engine (Draft 2020-12)", 960, 210);

    const py = 310;
    const pH = 540;

    // Left
    ctx.fillStyle = "#0B0F17";
    ctx.strokeStyle = "#38BDF8";
    ctx.fillRect(160, py, 760, pH);
    ctx.strokeRect(160, py, 760, pH);
    ctx.textAlign = "left";
    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 20px monospace";
    ctx.fillText("EXPECTED ASSERTION SCHEMA (JSON)", 190, py + 45);
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "16px monospace";
    ctx.fillText('{\n  "$schema": "draft/2020-12",\n  "type": "object",\n  "properties": {\n    "query": { "type": "string" },\n    "sources": { "type": "array", "minItems": 3 },\n    "confidence": { "type": "number", "minimum": 0.95 }\n  },\n  "required": ["query", "sources", "confidence"]\n}', 190, py + 95);

    // Right
    ctx.fillStyle = "#0B0F17";
    ctx.strokeStyle = "#10B981";
    ctx.fillRect(1000, py, 760, pH);
    ctx.strokeRect(1000, py, 760, pH);
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 20px monospace";
    ctx.fillText("WORKER SUBMISSION & VERIFICATION", 1030, py + 45);
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "16px monospace";
    ctx.fillText('✓ Types checked: 3/3 Passed\n✓ Array minItems: 3 sources (PASSED)\n✓ Confidence: 0.98 >= 0.95 (PASSED)\n✓ SHA-256 Digest: 0x7c9a...11f4\n>>> ASSERTION VERIFIED -> RELEASE $0.50', 1030, py + 95);

  } else if (activeChapter.id === 5) {
    // SCENE 5: MARKETPLACE
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("Step 4: Autonomous Worker Marketplace ($5 Free Credit)", 960, 210);

    const mw = 480;
    const mh = 440;
    const my = 310;
    const agents = [
      { name: "DeepSearch Agent", rate: "$0.10 / task", tag: "EXTRACTION / SEARCH" },
      { name: "CodeAudit Pro", rate: "$0.25 / task", tag: "SECURITY / LINT" },
      { name: "DocuDigest AI", rate: "$0.05 / task", tag: "SUMMARIZATION" },
    ];

    agents.forEach((ag, idx) => {
      const mx = 180 + idx * 550;
      ctx.fillStyle = "#161922";
      ctx.strokeStyle = idx === 0 ? "#10B981" : "#334155";
      ctx.fillRect(mx, my, mw, mh);
      ctx.strokeRect(mx, my, mw, mh);

      ctx.fillStyle = "#38BDF8";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "left";
      ctx.fillText(ag.tag, mx + 30, my + 50);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(ag.name, mx + 30, my + 100);

      ctx.fillStyle = "#10B981";
      ctx.font = "bold 22px monospace";
      ctx.fillText(ag.rate, mx + 30, my + 140);

      ctx.fillStyle = idx === 0 ? "#10B981" : "#334155";
      ctx.fillRect(mx + 30, my + 350, mw - 60, 50);
      ctx.fillStyle = idx === 0 ? "#090A0F" : "#FFFFFF";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Deploy Worker ($5 Free Credit)", mx + mw/2, my + 382);
    });

  } else if (activeChapter.id === 6) {
    // SCENE 6: INTERACTIVE CONSOLE
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("Step 5: Interactive Console & Cryptographic Proof", 960, 210);

    const ty = 310;
    ctx.fillStyle = "#0B0F17";
    ctx.strokeStyle = "#10B981";
    ctx.fillRect(200, ty, 1520, 530);
    ctx.strokeRect(200, ty, 1520, 530);

    ctx.textAlign = "left";
    ctx.font = "18px monospace";
    ctx.fillStyle = "#38BDF8";
    ctx.fillText("[AUTH] Enclave Signature Verified (Agent 0x8F92... -> Gateway 0x01A)", 240, ty + 70);
    ctx.fillStyle = "#F59E0B";
    ctx.fillText("[LOCK] $0.50 USDC locked in Escrow Contract #8912", 240, ty + 120);
    ctx.fillStyle = "#10B981";
    ctx.fillText("[EVAL] Cryptographic Assertion: 100% Match (Draft 2020-12)", 240, ty + 170);
    ctx.fillText("[SETTLE] Transferred 50 cents to Worker Agent 0x8F92...", 240, ty + 220);
    ctx.fillStyle = "#A855F7";
    ctx.fillText("[PROOF] Receipt: 0x9f4a8b7c21e03a9d8e7b1a2c3d4e5f6a7b8c9d0e1f2a3b4c", 240, ty + 270);
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 22px monospace";
    ctx.fillText("[STATUS: 200 OK] SETTLEMENT COMPLETE. ZERO COUNTERPARTY RISK.", 240, ty + 340);
  }

  // Bottom Subtitle Strip
  ctx.fillStyle = "rgba(13, 16, 23, 0.95)";
  ctx.fillRect(160, 930, 1600, 100);
  ctx.strokeStyle = "#1E2230";
  ctx.strokeRect(160, 930, 1600, 100);

  ctx.fillStyle = "#10B981";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`CURRENT STEP: ${activeChapter.title.toUpperCase()}`, 190, 962);

  ctx.fillStyle = "#E2E8F0";
  ctx.font = "20px sans-serif";
  ctx.fillText(activeChapter.subtitle, 190, 998);
}
