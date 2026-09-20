import { NextRequest, NextResponse } from "next/server";
import { recordAgentTransfer } from "@/lib/serverStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    let amount = 25000;
    if (body.amount_cents) amount = Math.round(Number(body.amount_cents) / 100);
    else if (body.amount_inr) amount = Number(body.amount_inr);
    else if (body.amount) amount = Number(body.amount);

    const result = recordAgentTransfer({
      amountINR: amount,
      fromAgentName: body.payer_id || body.payer_name || "Autonomous Payer Agent",
      toAgentName: body.beneficiary_id || body.worker_id || "Autonomous Worker Agent",
      milestoneTitle: body.milestone_id || body.milestone_title || "Programmatic Escrow Milestone",
      status: "SUCCESSFUL",
    });

    return NextResponse.json({
      success: true,
      contract_id: result.transaction.id,
      amount_cents: amount * 100,
      amount_inr: amount,
      fee_cents: Math.round(amount * 0.015 * 100),
      status: "SETTLED",
      transaction: result.transaction,
      vaultBalance: {
        testnet_balance: result.state.testnet_balance,
        available_balance: result.state.available_balance,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
