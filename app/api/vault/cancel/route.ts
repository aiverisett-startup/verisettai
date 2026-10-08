import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { authenticateAgentKey } from "@/lib/auth/agent-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;

    // 1. Check for Agent Bearer Token
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer vst_live_")) {
      const agentAuth = await authenticateAgentKey(req);
      if (agentAuth.authorized && agentAuth.userId) {
        userId = agentAuth.userId;
      }
    }

    // 2. If no agent token, check for Supabase session cookies
    if (!userId) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lpoconfurcrrkndguycr.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb2NvbmZ1cmNycmtuZGd1eWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTIzNDIsImV4cCI6MjEwNDc4ODM0Mn0.3yyJUB6duad7COImmhU8afbMoDtOOi7NaaWzL8jHiTA",
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Handled in middleware
              }
            },
          },
        }
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Active user session or agent token required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { vault_id, reason = "User initiated cancellation" } = body;

    if (!vault_id) {
      return NextResponse.json(
        { error: "Bad Request: Missing 'vault_id' parameter" },
        { status: 400 }
      );
    }

    // 3. Execute atomic cancellation via RPC
    const { data: cancelResult, error: rpcError } = await supabaseAdmin.rpc(
      "cancel_vault_atomic",
      {
        p_vault_id: vault_id,
        p_user_id: userId,
        p_reason: reason,
      }
    );

    if (rpcError) {
      return NextResponse.json(
        { error: "Cancellation failed", message: rpcError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(cancelResult || { success: true, status: "CANCELLED" });
  } catch (err: any) {
    console.error("Vault cancellation error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message || "Cancellation failed" },
      { status: 500 }
    );
  }
}
