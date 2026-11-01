import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const USD_EXCHANGE_RATE = 84.0;

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;

    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        userId = user.id;
      }
    } catch {
      // Graceful session error fallback
    }

    if (!userId) {
      const searchParams = req.nextUrl.searchParams;
      userId = searchParams.get("userId") || req.headers.get("x-user-id");
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: true,
          balancePaise: 0,
          balanceInr: "0.00",
          balanceUsd: "0.00",
          currency: "INR",
          isGuest: true,
        },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
          },
        }
      );
    }

    // Query UserVault from PostgreSQL
    let vault = await prisma.userVault.findUnique({
      where: { userId },
    });

    if (!vault) {
      try {
        vault = await prisma.userVault.create({
          data: {
            userId,
            balancePaise: BigInt(0),
            currency: "INR",
          },
        });
      } catch {
        vault = await prisma.userVault.findUnique({
          where: { userId },
        });
      }
    }

    const balancePaise = vault ? Number(vault.balancePaise) : 0;
    const balanceInr = (balancePaise / 100).toFixed(2);
    const balanceUsd = (balancePaise / 100 / USD_EXCHANGE_RATE).toFixed(2);

    return NextResponse.json(
      {
        success: true,
        vaultId: vault?.id,
        userId,
        balancePaise,
        balanceInr,
        balanceUsd,
        currency: vault?.currency || "INR",
        updatedAt: vault?.updatedAt ? vault.updatedAt.toISOString() : new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[VAULT_BALANCE_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch vault balance",
        balancePaise: 0,
        balanceInr: "0.00",
        balanceUsd: "0.00",
        currency: "INR",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  }
}

