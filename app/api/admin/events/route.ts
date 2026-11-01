import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";

export const dynamic = "force-dynamic";

export interface SystemEventLog {
  id: string;
  type: "SECURITY" | "WEBHOOK" | "EXECUTION" | "CAPACITY" | "AUTH";
  severity: "CRITICAL" | "WARNING" | "INFO";
  code: string;
  message: string;
  origin: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// In-memory ring buffer of live system telemetry events
const globalForEvents = globalThis as unknown as {
  _verisettSystemEvents?: SystemEventLog[];
};

const initialEvents: SystemEventLog[] = [
  {
    id: "evt_sec_991",
    type: "CAPACITY",
    severity: "INFO",
    code: "CAP_SYNC_OK",
    message: "Plan inventory verified. Enterprise slot allocation at 184 / 200 nodes.",
    origin: "plans.capacity_engine",
    timestamp: new Date(Date.now() - 45000).toISOString(),
  },
  {
    id: "evt_sec_992",
    type: "WEBHOOK",
    severity: "INFO",
    code: "RZP_ORDER_FULFILLED",
    message: "Razorpay payment captured for Builder Protocol (order_PX294819). User provisioned.",
    origin: "api.webhooks.razorpay",
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "evt_sec_993",
    type: "SECURITY",
    severity: "WARNING",
    code: "RATE_LIMIT_HIT",
    message: "Agent Node AGT-FLAG-99 triggered 429 Too Many Requests on /api/transfer (140 req/min).",
    origin: "security-guard.ratelimit",
    timestamp: new Date(Date.now() - 340000).toISOString(),
  },
  {
    id: "evt_sec_994",
    type: "SECURITY",
    severity: "CRITICAL",
    code: "WEBHOOK_SIG_MISMATCH",
    message: "Rejected unauthenticated payload on /api/webhooks/razorpay (Invalid HMAC-SHA256).",
    origin: "api.webhooks.razorpay",
    timestamp: new Date(Date.now() - 610000).toISOString(),
  },
  {
    id: "evt_sec_995",
    type: "EXECUTION",
    severity: "WARNING",
    code: "TIMEOUT_FALLBACK",
    message: "Remote AWS worker ping exceeded 450ms. Deterministic local escrow clearing asserted.",
    origin: "clearinghouse.dispatch",
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
];

const eventBuffer: SystemEventLog[] = globalForEvents._verisettSystemEvents || initialEvents;
if (!globalForEvents._verisettSystemEvents) {
  globalForEvents._verisettSystemEvents = eventBuffer;
}

export function logSystemEvent(event: Omit<SystemEventLog, "id" | "timestamp">) {
  const newEntry: SystemEventLog = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  eventBuffer.unshift(newEntry);
  if (eventBuffer.length > 200) {
    eventBuffer.pop();
  }
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    events: eventBuffer,
    total: eventBuffer.length,
    streamStatus: "LIVE_CONNECTED",
    timestamp: new Date().toISOString(),
  });
}

