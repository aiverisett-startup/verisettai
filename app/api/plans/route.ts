import { NextRequest, NextResponse } from "next/server";
import { getPlanConfigs } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const plans = await getPlanConfigs(includeArchived);

    // Global pause indicator: true if any or all unarchived plans are paused
    const anyPaused = plans.some((p) => p.isPaused);
    const allPaused = plans.length > 0 && plans.every((p) => p.isPaused);

    return NextResponse.json({
      plans,
      globalPause: anyPaused,
      allPaused,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[API_GET_PLANS_ERROR]:", err);
    return NextResponse.json({
      plans: [
        {
          id: "builder",
          displayName: "Builder Protocol",
          basePrice: 2500,
          gstAmount: 450,
          totalPrice: 2950,
          maxSubscribers: null,
          currentSubscribers: 0,
          isPaused: false,
          isArchived: false,
          isSoldOut: false,
        },
        {
          id: "enterprise",
          displayName: "Enterprise Protocol",
          basePrice: 30000,
          gstAmount: 5400,
          totalPrice: 35400,
          maxSubscribers: 200,
          currentSubscribers: 0,
          isPaused: false,
          isArchived: false,
          isSoldOut: false,
        },
      ],
      globalPause: false,
      allPaused: false,
      serverTime: new Date().toISOString(),
      fallback: true,
    });
  }
}
