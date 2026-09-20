import { NextRequest } from "next/server";
import { getAgentAccount, getTransactions } from "@/lib/verisettDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let key = searchParams.get("key");

  if (!key) {
    const auth = req.headers.get("authorization") || req.headers.get("x-api-key");
    if (auth) {
      key = auth.replace(/^Bearer\s+/i, "").trim();
    }
  }

  const activeKey = key || "vrs_live_aiverisettgmailcom89f72b";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      const sendEvent = () => {
        if (isClosed) return;
        try {
          const agent = getAgentAccount(activeKey);
          const { contracts, ledger_entries, transactions } = getTransactions(50);

          const payload = JSON.stringify({
            agent,
            contracts,
            ledger_entries,
            transactions,
            timestamp: new Date().toISOString(),
          });

          controller.enqueue(encoder.encode(`event: update\ndata: ${payload}\n\n`));
        } catch (err: any) {
          console.error("SSE broadcast error:", err?.message);
        }
      };

      // Emit initial snapshot immediately
      sendEvent();

      // Poll verisett.db every 1 second (1000ms)
      const pollInterval = setInterval(sendEvent, 1000);

      // Handle client disconnect or request abort
      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(pollInterval);
        try {
          controller.close();
        } catch {
          // Closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
