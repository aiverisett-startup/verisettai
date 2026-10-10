"use server";

import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PLANS_CONFIG, isTierCapacityReached } from "@/lib/plansConfig";

export interface RegisterPlanInput {
  orgName: string;
  email: string;
  agentHandle: string;
  planId: "community" | "builder" | "pro" | "enterprise";
  currentClaimed: number;
}

export interface RegisterPlanResult {
  success: boolean;
  reservationCode?: string;
  seatNumber?: number;
  planId?: string;
  newClaimedCount?: number;
  message?: string;
  error?: string;
}

export async function registerPlanAction(
  input: RegisterPlanInput
): Promise<RegisterPlanResult> {
  const { orgName, email, agentHandle, planId, currentClaimed } = input;

  // 1. Validation
  if (!orgName || orgName.trim().length < 2) {
    return { success: false, error: "Please provide a valid organization or developer name." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.includes("@") || !emailRegex.test(email.trim())) {
    return { success: false, error: "Please enter a valid work email address." };
  }

  if (!agentHandle || agentHandle.trim().length < 2) {
    return { success: false, error: "Please enter your Agent ID or node handle (e.g. AGT-NODE-01)." };
  }

  const plan = PLANS_CONFIG[planId];
  if (!plan) {
    return { success: false, error: "Invalid plan selected." };
  }

  // 2. Capacity Check
  if (plan.isPaid && plan.slotCap !== null) {
    if (isTierCapacityReached(planId, currentClaimed)) {
      return {
        success: false,
        error: `The ${plan.name} has reached its strict capacity of ${plan.slotCap} slots.`,
      };
    }
  }

  // 3. Generate Reservation Code
  const hex = crypto.randomBytes(4).toString("hex").toUpperCase();
  const reservationCode = `RES-${planId.toUpperCase().slice(0, 3)}-${hex}`;
  const nextSeatNumber = currentClaimed + 1;

  // 4. Record to Database (Supabase)
  try {
    await supabaseAdmin.from("plan_registrations").insert({
      org_name: orgName.trim(),
      email: email.trim().toLowerCase(),
      agent_handle: agentHandle.trim(),
      plan_tier: planId,
      is_paid: plan.isPaid,
      reservation_code: reservationCode,
    });

    if (plan.isPaid) {
      await supabaseAdmin
        .from("plan_tier_counters")
        .upsert(
          {
            plan_tier: planId,
            claimed_slots: nextSeatNumber,
            max_cap: plan.slotCap,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "plan_tier" }
        );
    }
  } catch (err: any) {
    console.warn("[PLAN-REGISTRATION] Database notice:", err?.message || err);
  }

  return {
    success: true,
    reservationCode,
    seatNumber: nextSeatNumber,
    planId,
    newClaimedCount: nextSeatNumber,
    message: plan.isPaid
      ? `Seat #${nextSeatNumber} of ${plan.slotCap} confirmed for ${plan.name}.`
      : `Community Fleet access verified for ${orgName.trim()}.`,
  };
}
