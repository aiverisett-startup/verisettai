import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";

export const dynamic = "force-dynamic";

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: "BUILDER" | "ENTERPRISE" | "ADMIN" | string;
  plan_tier: string;
  is_suspended: boolean;
  wallet_balance: number;
  node_uid: string;
  agent_status: string;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch profiles
    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, name, role, plan_tier, is_suspended, wallet_balance, created_at")
      .order("created_at", { ascending: false });

    // 2. Fetch registered agents to match node UIDs
    const { data: agents } = await supabaseAdmin
      .from("registered_agents")
      .select("user_id, agent_id_code, status");

    const agentMap = new Map<string, { code: string; status: string }>();
    if (agents) {
      for (const a of agents) {
        if (a.user_id && !agentMap.has(a.user_id)) {
          agentMap.set(a.user_id, {
            code: a.agent_id_code || `AGT-${a.user_id.slice(-6).toUpperCase()}`,
            status: a.status || "Active",
          });
        }
      }
    }

    const defaultUsers: AdminUserRecord[] = [
      {
        id: "usr_operator_01",
        email: "operator@verisett.ai",
        name: "Verisett Core Node",
        role: "ADMIN",
        plan_tier: "ENTERPRISE",
        is_suspended: false,
        wallet_balance: 50000.0,
        node_uid: "AGT-ROOT-001",
        agent_status: "Active",
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: "usr_nexus_02",
        email: "alex.chen@novascale.ai",
        name: "Alex Chen",
        role: "ENTERPRISE",
        plan_tier: "ENTERPRISE",
        is_suspended: false,
        wallet_balance: 14200.0,
        node_uid: "AGT-NOVA-89X",
        agent_status: "Active",
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: "usr_builder_03",
        email: "dev@quantumbits.io",
        name: "Marcus Vance",
        role: "BUILDER",
        plan_tier: "BUILDER",
        is_suspended: false,
        wallet_balance: 2950.0,
        node_uid: "AGT-QB-304",
        agent_status: "Active",
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: "usr_flagged_04",
        email: "sybil_probe@shadow.net",
        name: "Unknown Client",
        role: "BUILDER",
        plan_tier: "BUILDER",
        is_suspended: true,
        wallet_balance: 0.0,
        node_uid: "AGT-FLAG-99",
        agent_status: "Suspended",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];

    if (!profileErr && profiles && profiles.length > 0) {
      const records: AdminUserRecord[] = profiles.map((p) => {
        const ag = agentMap.get(p.id);
        return {
          id: p.id,
          email: p.email || "developer@verisett.ai",
          name: p.name || p.email?.split("@")[0] || "Autonomous Operator",
          role: (p.role || "BUILDER").toUpperCase(),
          plan_tier: (p.plan_tier || "BUILDER").toUpperCase(),
          is_suspended: Boolean(p.is_suspended),
          wallet_balance: Number(p.wallet_balance || 0),
          node_uid: ag?.code || `AGT-${p.id.slice(-6).toUpperCase()}`,
          agent_status: ag?.status || (p.is_suspended ? "Suspended" : "Active"),
          created_at: p.created_at || new Date().toISOString(),
        };
      });

      return NextResponse.json({ users: records, count: records.length });
    }

    return NextResponse.json({ users: defaultUsers, count: defaultUsers.length, isFallback: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, userId, amount, isSuspended, role, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing required userId parameter" }, { status: 400 });
    }

    // 1. Adjust Balance
    if (action === "adjust_balance") {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount)) {
        return NextResponse.json({ error: "Invalid adjustment amount" }, { status: 400 });
      }

      // Read current balance
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("wallet_balance, email")
        .eq("id", userId)
        .maybeSingle();

      const currentBalance = Number(profile?.wallet_balance || 0);
      const newBalance = Math.max(0, currentBalance + numericAmount);

      await supabaseAdmin
        .from("profiles")
        .update({
          wallet_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      // Record in immutable ledger
      try {
        await supabaseAdmin.from("ledger_entries").insert({
          transaction_id: `adj_${Date.now()}`,
          entry_type: numericAmount >= 0 ? "CREDIT" : "DEBIT",
          amount: Math.abs(numericAmount),
          currency: "INR",
          description: `Admin balance adjustment for ${profile?.email || userId}: ${reason || "Support credit/debit"}`,
          created_at: new Date().toISOString(),
        });
      } catch (ledgerErr) {
        console.warn("[LEDGER_ADJUST_NOTE]:", ledgerErr);
      }

      return NextResponse.json({
        success: true,
        message: `Balance adjusted by ₹${numericAmount}. New balance: ₹${newBalance}`,
        newBalance,
      });
    }

    // 2. Toggle Suspend / Kill Switch
    if (action === "toggle_suspend") {
      const targetState = Boolean(isSuspended);

      // Update profile
      await supabaseAdmin
        .from("profiles")
        .update({
          is_suspended: targetState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      // Update linked agents status
      await supabaseAdmin
        .from("registered_agents")
        .update({
          status: targetState ? "Suspended" : "Active",
        })
        .eq("user_id", userId);

      return NextResponse.json({
        success: true,
        message: `Account suspension set to ${targetState}`,
        isSuspended: targetState,
      });
    }

    // 3. Update Role
    if (action === "update_role") {
      const validRoles = ["BUILDER", "ENTERPRISE", "ADMIN"];
      const targetRole = String(role).toUpperCase();

      if (!validRoles.includes(targetRole)) {
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
      }

      await supabaseAdmin
        .from("profiles")
        .update({
          role: targetRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      return NextResponse.json({
        success: true,
        message: `User role updated to ${targetRole}`,
        role: targetRole,
      });
    }

    return NextResponse.json({ error: "Unknown action specified" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
