import { NextResponse } from "next/server";
import { resetServerVault } from "@/lib/serverStore";
import { resetAgentBalanceInDb } from "@/lib/verisettDb";

export async function POST() {
  const state = resetServerVault();
  try {
    resetAgentBalanceInDb();
  } catch (err) {
    console.warn("Could not reset verisett.db balance:", err);
  }
  return NextResponse.json({
    success: true,
    message: "Vault reset successfully to 169,000 VRS initial balance",
    vaultBalance: {
      testnet_balance: 169000,
      available_balance: 169000,
    },
  });
}
