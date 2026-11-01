import { NextRequest, NextResponse } from "next/server";
import {
  getPlanConfigs,
  updatePlanConfig,
  adjustSubscriberSlots,
  toggleGlobalPause,
} from "@/lib/plans";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  try {
    const plans = await getPlanConfigs(true); // Return all, including archived
    const anyPaused = plans.some((p) => p.isPaused);

    return NextResponse.json({
      plans,
      globalPause: anyPaused,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, planId, delta, isPaused, isArchived, updates } = body;

    if (action === "toggle_global_pause") {
      const targetState = Boolean(isPaused);
      const plans = await toggleGlobalPause(targetState);
      return NextResponse.json({
        success: true,
        message: `Global platform checkout pause set to ${targetState}`,
        plans,
      });
    }

    if (action === "adjust_slots") {
      if (!planId || typeof delta !== "number") {
        return NextResponse.json({ error: "Missing planId or delta" }, { status: 400 });
      }
      const updated = await adjustSubscriberSlots(planId, delta);
      return NextResponse.json({
        success: true,
        message: `Subscriber slots updated for ${planId}`,
        plan: updated,
      });
    }

    if (action === "archive_plan") {
      if (!planId) {
        return NextResponse.json({ error: "Missing planId" }, { status: 400 });
      }
      const targetArchive = isArchived !== undefined ? Boolean(isArchived) : true;
      const updated = await updatePlanConfig(planId, {
        isArchived: targetArchive,
        isPaused: targetArchive ? true : false,
      });
      return NextResponse.json({
        success: true,
        message: `Plan ${planId} ${targetArchive ? "archived / sunsetted" : "unarchived"}`,
        plan: updated,
      });
    }

    if (action === "toggle_plan_pause") {
      if (!planId) {
        return NextResponse.json({ error: "Missing planId" }, { status: 400 });
      }
      const updated = await updatePlanConfig(planId, {
        isPaused: Boolean(isPaused),
      });
      return NextResponse.json({
        success: true,
        message: `Plan ${planId} pause set to ${Boolean(isPaused)}`,
        plan: updated,
      });
    }

    if (action === "update_plan" && planId && updates) {
      const updated = await updatePlanConfig(planId, updates);
      return NextResponse.json({
        success: true,
        message: `Plan ${planId} configuration updated`,
        plan: updated,
      });
    }

    return NextResponse.json({ error: "Unknown action specified" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Execution error" }, { status: 500 });
  }
}

