import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ADMIN_SECRET =
  process.env.ADMIN_SECRET_KEY?.trim() || "verisett_admin_super_secret_2026";

export async function verifyAdminRequest(req: NextRequest): Promise<{
  authorized: boolean;
  userEmail?: string;
  userId?: string;
  reason?: string;
}> {
  // 1. Check Passcode / Secret Header
  const headerKey = req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key");
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (headerKey === ADMIN_SECRET || bearerToken === ADMIN_SECRET) {
    return { authorized: true, userEmail: "root@verisett.internal" };
  }

  // 2. Check Supabase User Session
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      // Check user role in public.profiles
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role, email")
        .eq("id", user.id)
        .maybeSingle();

      const userRole = (profile?.role || user.user_metadata?.role || "").toUpperCase();
      const email = (user.email || profile?.email || "").toLowerCase();

      if (
        userRole === "ADMIN" ||
        email === "operator@verisett.ai" ||
        email === "admin@verisett.ai" ||
        email.endsWith("@verisett.ai")
      ) {
        return {
          authorized: true,
          userId: user.id,
          userEmail: email,
        };
      }
    }
  } catch (err: any) {
    console.warn("[ADMIN_AUTH_CHECK_NOTE]:", err?.message || err);
  }

  return { authorized: false, reason: "Unauthorized: Admin privileges required." };
}

