import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/verisettDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 50;

    const { contracts, ledger_entries, transactions } = getTransactions(limit);

    return NextResponse.json({
      success: true,
      count: contracts.length,
      contracts,
      ledger_entries,
      transactions,
    });
  } catch (error: any) {
    console.error("Error querying transactions from verisett.db:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal database error",
      },
      { status: 500 }
    );
  }
}
