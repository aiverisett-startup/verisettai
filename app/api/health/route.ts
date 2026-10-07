import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = performance.now();

  try {
    // Ping Supabase database using SELECT on core tables via admin client
    const { error } = await supabaseAdmin
      .from("vaults")
      .select("id")
      .limit(1);

    const dbLatencyMs = Math.round(performance.now() - startTime);

    if (error && (error.message.includes("fetch failed") || error.code === "ECONNREFUSED")) {
      return NextResponse.json(
        {
          status: "degraded",
          error: "db_unreachable",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "operational",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        db_latency_ms: dbLatencyMs,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Health probe exception:", err);
    return NextResponse.json(
      {
        status: "degraded",
        error: "db_unreachable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
