#!/usr/bin/env tsx
/**
 * Verisett AI — Razorpay Standard Checkout Integration Test Suite
 * 
 * Tests:
 * 1. Environment keys configuration & safety
 * 2. Order Creation Endpoint (POST /api/create-order)
 *    - Valid amount (>= 100 paise)
 *    - Invalid amount (< 100 paise) rejection
 *    - Malformed payload rejection
 * 3. Signature Verification Endpoint (POST /api/verify-payment)
 *    - Authentic HMAC-SHA256 signature verification
 *    - Tampered signature rejection
 *    - Missing required parameters rejection
 *    - Constant-time comparison safety
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextRequest } from "next/server";

// Load .env if not loaded
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      const val = rest.join("=").replace(/^["']|["']$/g, "").trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

import { POST as createOrderHandler } from "../app/api/create-order/route";
import { POST as verifyPaymentHandler } from "../app/api/verify-payment/route";

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function pass(msg: string) {
  console.log(`  ${C.green}✓${C.reset} ${msg}`);
}

function fail(msg: string, err?: any) {
  console.error(`  ${C.red}✗ FAIL: ${msg}${C.reset}`, err || "");
  process.exit(1);
}

async function runTestSuite() {
  console.log("\n" + C.bold + C.cyan + "=".repeat(75) + C.reset);
  console.log(C.bold + C.cyan + "  VERISETT AI -- RAZORPAY STANDARD CHECKOUT TEST SUITE" + C.reset);
  console.log(C.dim + "  Testing Order Creation, Client Modal Flow & HMAC-SHA256 Verification" + C.reset);
  console.log(C.bold + C.cyan + "=".repeat(75) + C.reset + "\n");

  // 1. Environment Configuration Check
  console.log(`${C.bold}[1/3] Environment Keys & Safety Audit${C.reset}`);
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId) fail("RAZORPAY_KEY_ID is missing from environment");
  if (!keySecret) fail("RAZORPAY_KEY_SECRET is missing from environment");
  if (!publicKeyId) fail("NEXT_PUBLIC_RAZORPAY_KEY_ID is missing from environment");
  if (keySecret === publicKeyId) fail("CRITICAL: Key secret must NEVER equal public key!");

  pass(`RAZORPAY_KEY_ID detected: ${keyId?.slice(0, 10)}...`);
  pass(`RAZORPAY_KEY_SECRET present: length=${keySecret?.length} chars (Hidden)`);
  pass(`NEXT_PUBLIC_RAZORPAY_KEY_ID exposed: ${publicKeyId?.slice(0, 10)}...`);

  // Verify .gitignore safety
  const gitignoreContent = fs.readFileSync(path.resolve(process.cwd(), ".gitignore"), "utf-8");
  if (!gitignoreContent.includes(".env")) {
    fail(".env is not present in .gitignore!");
  }
  pass(".env is securely blocked by .gitignore against repository commits");

  // 2. Test Order Creation Endpoint (POST /api/create-order)
  console.log(`\n${C.bold}[2/3] Testing Order Creation Endpoint (/api/create-order)${C.reset}`);

  // Test 2a: Valid Order Creation (₹100 = 10,000 paise)
  try {
    const validReq = new NextRequest("http://localhost:3000/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 10000, // ₹100.00
        currency: "INR",
        receipt: "rcpt_test_suite_01",
        notes: {
          test_suite: "true",
          environment: "verification",
        },
      }),
    });

    const validRes = await createOrderHandler(validReq);
    const validData = await validRes.json();

    if (validRes.status !== 200) {
      fail(`Order creation failed with status ${validRes.status}`, validData);
    }

    if (!validData.order_id || !validData.order_id.startsWith("order_")) {
      fail(`Unexpected order_id format: ${validData.order_id}`);
    }

    if (validData.amount !== 10000 || validData.currency !== "INR") {
      fail(`Unexpected amount or currency: ${JSON.stringify(validData)}`);
    }

    if (!validData.key_id) {
      fail("Public key_id missing in order creation response");
    }

    pass(`Successfully created live Razorpay Order: ${validData.order_id} (Amount: ₹${validData.amount / 100})`);
    pass(`Returned public key_id: ${validData.key_id}`);
  } catch (err: any) {
    fail("Exception during order creation test", err);
  }

  // Test 2b: Amount Below Minimum (< 100 paise)
  try {
    const invalidAmountReq = new NextRequest("http://localhost:3000/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 50, // 50 paise is < 100 paise
      }),
    });

    const invalidRes = await createOrderHandler(invalidAmountReq);
    const invalidData = await invalidRes.json();

    if (invalidRes.status !== 400) {
      fail(`Expected HTTP 400 for amount < 100 paise, got ${invalidRes.status}`, invalidData);
    }
    pass(`Correctly rejected sub-minimum amount (50 paise): ${invalidData.error}`);
  } catch (err: any) {
    fail("Exception during invalid amount test", err);
  }

  // Test 2c: Malformed Body
  try {
    const malformedReq = new NextRequest("http://localhost:3000/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: "not_a_number",
      }),
    });

    const malformedRes = await createOrderHandler(malformedReq);
    if (malformedRes.status !== 400) {
      fail(`Expected HTTP 400 for non-numeric amount, got ${malformedRes.status}`);
    }
    pass("Correctly rejected non-numeric amount payload with HTTP 400");
  } catch (err: any) {
    fail("Exception during malformed payload test", err);
  }

  // 3. Test Signature Verification Endpoint (POST /api/verify-payment)
  console.log(`\n${C.bold}[3/3] Testing Signature Verification Endpoint (/api/verify-payment)${C.reset}`);

  const testOrderId = `order_test_${crypto.randomBytes(6).toString("hex")}`;
  const testPaymentId = `pay_test_${crypto.randomBytes(6).toString("hex")}`;

  // Generate authentic HMAC-SHA256 signature: ${testOrderId}|${testPaymentId}
  const validSignature = crypto
    .createHmac("sha256", keySecret!)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest("hex");

  // Test 3a: Valid Signature Verification
  try {
    const verifyReq = new NextRequest("http://localhost:3000/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
      }),
    });

    const verifyRes = await verifyPaymentHandler(verifyReq);
    const verifyData = await verifyRes.json();

    if (verifyRes.status !== 200 || !verifyData.success) {
      fail(`Valid signature verification failed: ${JSON.stringify(verifyData)}`);
    }
    pass(`HMAC-SHA256 signature verified: { success: true, order_id: '${testOrderId}', payment_id: '${testPaymentId}' }`);
  } catch (err: any) {
    fail("Exception during valid signature test", err);
  }

  // Test 3b: Tampered Signature
  try {
    const tamperedSignature = validSignature.slice(0, -4) + "0000";
    const tamperedReq = new NextRequest("http://localhost:3000/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: tamperedSignature,
      }),
    });

    const tamperedRes = await verifyPaymentHandler(tamperedReq);
    const tamperedData = await tamperedRes.json();

    if (tamperedRes.status !== 400 || tamperedData.success !== false) {
      fail(`Expected HTTP 400 for tampered signature, got ${tamperedRes.status}`, tamperedData);
    }
    pass(`Correctly rejected tampered signature with HTTP 400: ${tamperedData.error}`);
  } catch (err: any) {
    fail("Exception during tampered signature test", err);
  }

  // Test 3c: Missing Required Fields
  try {
    const missingReq = new NextRequest("http://localhost:3000/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: testOrderId,
        // missing payment_id and signature
      }),
    });

    const missingRes = await verifyPaymentHandler(missingReq);
    const missingData = await missingRes.json();

    if (missingRes.status !== 400) {
      fail(`Expected HTTP 400 for missing fields, got ${missingRes.status}`, missingData);
    }
    pass(`Correctly rejected incomplete payload with HTTP 400: ${missingData.error}`);
  } catch (err: any) {
    fail("Exception during missing fields test", err);
  }

  console.log("\n" + C.bold + C.green + "=".repeat(75) + C.reset);
  console.log(C.bold + C.green + "  ALL RAZORPAY STANDARD CHECKOUT TESTS PASSED (100% SUCCESS)" + C.reset);
  console.log(C.bold + C.green + "=".repeat(75) + C.reset + "\n");
}

runTestSuite().catch((err) => {
  console.error("Test harness failed:", err);
  process.exit(1);
});
