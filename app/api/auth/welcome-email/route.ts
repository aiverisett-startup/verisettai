import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { executeSendCustomerEmail } from "@/lib/geminiOpsTools";
import { parseAndValidateJson, WelcomeEmailSchema } from "@/lib/security-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const validation = await parseAndValidateJson(req, WelcomeEmailSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { email, name, userId } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();
    const recipientName = name?.trim() || normalizedEmail.split("@")[0] || "Protocol Operator";


    // 1. Check if welcome email was already dispatched to prevent duplicate sends
    try {
      const { data: existingRecord, error: checkError } = await supabaseAdmin
        .from("user_welcome_emails")
        .select("id, sent_at, status")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!checkError && existingRecord) {
        return NextResponse.json({
          success: true,
          delivered: false,
          alreadySent: true,
          message: "Welcome email has already been dispatched to this address",
          sentAt: existingRecord.sent_at,
        });
      }
    } catch (checkErr) {
      console.warn("[WELCOME-EMAIL] Table check warning (proceeding):", checkErr);
    }

    // 2. Prepare institutional email content from Manoj S Malavalli
    const subject = "Welcome to Verisett AI — Autonomous M2M Clearinghouse Protocol";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://veri-sett.com";

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to Verisett AI</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #050608;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 20px;
    }
    .card {
      background: linear-gradient(180deg, rgba(16, 20, 28, 0.95) 0%, rgba(9, 11, 16, 0.98) 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 36px 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10B981;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .logo-text {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.12em;
      color: #FFFFFF;
      margin-bottom: 6px;
    }
    .logo-sub {
      font-size: 12px;
      color: #94A3B8;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 28px;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #F8FAFC;
      margin: 0 0 16px 0;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14px;
      color: #94A3B8;
      margin: 0 0 16px 0;
    }
    .tier-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .tier-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #38BDF8;
      margin-bottom: 8px;
    }
    .tier-features {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 13px;
      color: #CBD5E1;
    }
    .tier-features li {
      padding: 5px 0;
      display: flex;
      align-items: center;
    }
    .sovereign-box {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(217, 119, 6, 0.02) 100%);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .sovereign-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #F59E0B;
      margin-bottom: 8px;
    }
    .cta-container {
      margin: 32px 0 24px 0;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background: #FFFFFF;
      color: #0A0D14;
      font-weight: 700;
      font-size: 14px;
      padding: 13px 28px;
      border-radius: 10px;
      text-decoration: none;
      letter-spacing: -0.01em;
      box-shadow: 0 4px 14px rgba(255, 255, 255, 0.15);
      margin: 6px;
    }
    .secondary-button {
      display: inline-block;
      background: rgba(255, 255, 255, 0.06);
      color: #E2E8F0;
      font-weight: 600;
      font-size: 14px;
      padding: 13px 24px;
      border-radius: 10px;
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.12);
      margin: 6px;
    }
    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 28px 0;
    }
    .founder-sig {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
    }
    .founder-name {
      font-size: 14px;
      font-weight: 700;
      color: #F8FAFC;
    }
    .founder-role {
      font-size: 12px;
      color: #94A3B8;
    }
    .footer-text {
      text-align: center;
      font-size: 11px;
      color: #64748B;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="badge">● Protocol Node Verified</div>
      <div class="logo-text">VERISETT AI</div>
      <div class="logo-sub">Autonomous Machine-to-Machine Clearinghouse Protocol</div>

      <h1>Welcome to the Settlement Network, ${recipientName}</h1>
      
      <p>
        I am <strong>Manoj S Malavalli</strong>, Founder and CEO of Verisett AI. I am honored to personally welcome you to our sovereign machine-to-machine clearinghouse and agent identity protocol.
      </p>

      <p>
        Verisett AI provides the mission-critical financial backbone for autonomous software agents: zero-trust escrow vaults, deterministic double-entry accounting ledgers, and sub-second cryptographic settlement.
      </p>

      <!-- Default Plan Limits -->
      <div class="tier-box">
        <div class="tier-title">Your Current Tier: Starter Plan (Free)</div>
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #94A3B8;">
          Your account has been provisioned with our baseline developer tier limits:
        </p>
        <ul class="tier-features">
          <li>✓ <strong>₹0 / month</strong> baseline platform fee</li>
          <li>✓ <strong>2.0%</strong> protocol clearinghouse take-rate per transaction</li>
          <li>✓ Up to <strong>2 concurrent autonomous agent swarms</strong></li>
          <li>✓ FastMCP sandbox & standard cryptographic proof verification</li>
          <li>✓ Community telemetry & email support</li>
        </ul>
      </div>

      <!-- Sovereign Lifetime Tier Highlights -->
      <div class="sovereign-box">
        <div class="sovereign-title">✦ Exclusive Protocol Upgrade: Sovereign Node (Lifetime)</div>
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #CBD5E1;">
          For institutional teams and serious agentic operators, the Sovereign Node provides permanent protocol ownership:
        </p>
        <ul class="tier-features">
          <li>★ <strong>₹30,000 One-Time Payment</strong> — Pay once, keep forever with <strong>zero recurring fees</strong></li>
          <li>★ <strong>0.75% Protocol Clearinghouse Fee</strong> (the lowest take-rate available network-wide)</li>
          <li>★ <strong>Unlimited concurrent autonomous agent swarms</strong></li>
          <li>★ Dedicated clearinghouse node queue with sub-second settlement priority</li>
          <li>★ Hardware HSM key signing & custom multi-agent dispute arbitration</li>
        </ul>
      </div>

      <!-- Action Links -->
      <div class="cta-container">
        <a href="${siteUrl}/dashboard" class="cta-button">Open Escrow Vault</a>
        <a href="${siteUrl}/docs" class="secondary-button">Explore Protocol Docs</a>
      </div>

      <div class="divider"></div>

      <p style="font-size: 13px; color: #CBD5E1;">
        If you have any questions, wish to connect custom multi-agent swarms, or require enterprise custom settlement rules, simply reply directly to this email or reach our operations desk.
      </p>

      <div class="founder-sig">
        <div>
          <div class="founder-name">Manoj S Malavalli</div>
          <div class="founder-role">CEO / Founder, Verisett AI</div>
          <div class="founder-role" style="font-size: 11px; color: #64748B; margin-top: 2px;">
            Autonomous M2M Clearinghouse & Sovereign Settlement Protocol
          </div>
        </div>
      </div>
    </div>

    <div class="footer-text">
      Verisett AI Protocol • Cryptographic Agent Identity & Escrow Vaults<br>
      Bengaluru, Karnataka, India • Global Distributed Ledger Network<br>
      © 2026 Verisett AI Inc. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    // 3. Dispatch welcome email via Resend or simulated fallback
    const sendResult = await executeSendCustomerEmail({
      to: normalizedEmail,
      subject,
      html_content: htmlContent,
    });

    // 4. Record delivery in user_welcome_emails to prevent duplicates
    try {
      await supabaseAdmin.from("user_welcome_emails").insert({
        user_id: userId || null,
        email: normalizedEmail,
        message_id: sendResult.messageId || `msg_${Date.now()}`,
        status: sendResult.success ? "DELIVERED" : "FAILED",
        provider: sendResult.deliveredVia || "Resend",
        sent_at: new Date().toISOString(),
      });
    } catch (insertErr) {
      console.warn("[WELCOME-EMAIL] DB record warning:", insertErr);
    }

    return NextResponse.json({
      success: true,
      delivered: sendResult.success,
      alreadySent: false,
      messageId: sendResult.messageId,
      deliveredVia: sendResult.deliveredVia,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[WELCOME-EMAIL] Error dispatching welcome email:", errorMsg);
    return NextResponse.json(
      { success: false, error: "Internal error processing welcome email" },
      { status: 500 }
    );
  }
}
