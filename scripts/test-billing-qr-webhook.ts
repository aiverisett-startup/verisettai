import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runTests() {
  console.log("=================================================================");
  console.log("  VERISETT AI - RAZORPAY DYNAMIC UPI QR & WEBHOOK TEST SUITE     ");
  console.log("=================================================================");
  console.log(`Target: ${BASE_URL}\n`);

  let allPassed = true;

  // TEST 1: Validation check on amount < 100 paise
  try {
    process.stdout.write("[TEST 1] Validation on amount < 100 paise... ");
    const res = await fetch(`${BASE_URL}/api/billing/create-qr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 50, // Less than 100 paise
        customer_name: "Test Operator",
        description: "Test description",
      }),
    });

    if (res.status === 400) {
      const data = await res.json();
      console.log(`PASSED (HTTP 400 rejected: "${data.error}")`);
    } else {
      console.error(`FAILED (Expected HTTP 400, received ${res.status})`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`FAILED (${err.message})`);
    allPassed = false;
  }

  // TEST 2: Dynamic QR code creation
  let createdQrId = "";
  try {
    process.stdout.write("[TEST 2] Dynamic UPI QR code generation via Razorpay... ");
    const res = await fetch(`${BASE_URL}/api/billing/create-qr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 250000, // ₹2,500 in paise
        customer_name: "Verisett Test Agent",
        description: "Autonomous Settlement Node Tier 1",
      }),
    });

    const data = await res.json();
    if (res.status === 200 && data.qr_id && data.image_url) {
      createdQrId = data.qr_id;
      console.log(`PASSED (QR ID: ${data.qr_id}, Amount: ${data.amount} paise)`);
      console.log(`         QR Image URL: ${data.image_url}`);
    } else {
      console.error(`FAILED (${JSON.stringify(data)})`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`FAILED (${err.message})`);
    allPassed = false;
  }

  // TEST 3: Check QR status initially (should be 'active')
  if (createdQrId) {
    try {
      process.stdout.write("[TEST 3] Check initial QR status via polling endpoint... ");
      const res = await fetch(`${BASE_URL}/api/billing/check-status?qr_id=${encodeURIComponent(createdQrId)}`);
      const data = await res.json();
      if (res.status === 200 && (data.status === "active" || data.status === "created")) {
        console.log(`PASSED (Status: ${data.status}, Amount: ${data.amount})`);
      } else {
        console.error(`FAILED (${JSON.stringify(data)})`);
        allPassed = false;
      }
    } catch (err: any) {
      console.error(`FAILED (${err.message})`);
      allPassed = false;
    }
  }

  // TEST 4: Webhook with invalid signature (should reject with HTTP 400)
  try {
    process.stdout.write("[TEST 4] Webhook listener security: forged signature... ");
    const fakePayload = JSON.stringify({ event: "payment.captured" });
    const res = await fetch(`${BASE_URL}/api/billing/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": "invalid_forged_sha256_hex_string_1234567890abcdef",
      },
      body: fakePayload,
    });

    if (res.status === 400) {
      const data = await res.json();
      console.log(`PASSED (HTTP 400 rejected forged signature: "${data.error}")`);
    } else {
      console.error(`FAILED (Expected HTTP 400, received ${res.status})`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`FAILED (${err.message})`);
    allPassed = false;
  }

  // TEST 5: Webhook with authentic HMAC-SHA256 signature for qr_code.credited
  const targetQrId = createdQrId || `qr_mock_${Date.now()}`;
  const mockPaymentId = `pay_upi_${Date.now()}`;
  try {
    process.stdout.write("[TEST 5] Webhook listener processing: authentic qr_code.credited... ");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "vset_whsec_78d91a0f5e43bc2a98f7e6d5c4b3a2";
    const webhookPayload = JSON.stringify({
      entity: "event",
      account_id: "acc_verisett_001",
      event: "qr_code.credited",
      contains: ["qr_code", "payment"],
      payload: {
        qr_code: {
          entity: {
            id: targetQrId,
            entity: "qr_code",
            type: "upi_qr",
            status: "closed",
            payment_amount: 250000,
            payments_amount_received: 250000,
            payments_count_received: 1,
            notes: {
              customer_name: "Verisett Test Agent",
            },
          },
        },
        payment: {
          entity: {
            id: mockPaymentId,
            entity: "payment",
            amount: 250000,
            currency: "INR",
            status: "captured",
            method: "upi",
            qr_code_id: targetQrId,
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    });

    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(Buffer.from(webhookPayload, "utf8"))
      .digest("hex");

    const res = await fetch(`${BASE_URL}/api/billing/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": signature,
      },
      body: webhookPayload,
    });

    const data = await res.json();
    if (res.status === 200 && data.status === "ok") {
      console.log(`PASSED (HTTP 200 acknowledged: ${JSON.stringify(data)})`);
    } else {
      console.error(`FAILED (${JSON.stringify(data)})`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`FAILED (${err.message})`);
    allPassed = false;
  }

  // TEST 6: Check QR status after webhook (should now be 'paid')
  try {
    process.stdout.write("[TEST 6] Status polling confirms real-time settlement... ");
    const res = await fetch(`${BASE_URL}/api/billing/check-status?qr_id=${encodeURIComponent(targetQrId)}`);
    const data = await res.json();
    if (res.status === 200 && data.status === "paid" && data.payment_id === mockPaymentId) {
      console.log(`PASSED (Status: ${data.status}, Payment ID: ${data.payment_id}, Amount: ${data.amount})`);
    } else {
      console.error(`FAILED (${JSON.stringify(data)})`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`FAILED (${err.message})`);
    allPassed = false;
  }

  console.log("\n-----------------------------------------------------------------");
  if (allPassed) {
    console.log("✅ ALL DYNAMIC UPI QR & WEBHOOK INTEGRATION TESTS PASSED!");
  } else {
    console.log("❌ SOME INTEGRATION TESTS FAILED.");
    process.exit(1);
  }
}

runTests();
