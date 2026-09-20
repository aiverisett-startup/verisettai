import { NextResponse } from "next/server";
import { resetServerVault } from "@/lib/serverStore";

export async function POST() {
  const state = resetServerVault();
  return NextResponse.json({
    success: true,
    message: "Vault reset successfully to 10,000 VRS initial balance",
    vaultBalance: {
      testnet_balance: state.testnet_balance,
      available_balance: state.available_balance,
    },
  });
}
