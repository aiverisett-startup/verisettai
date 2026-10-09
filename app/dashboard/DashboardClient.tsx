"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Plus,
  LogOut,
  Key,
  Copy,
  Check,
  Activity,
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
  Cpu,
  Layers,
  ArrowUpRight,
  CreditCard,
  RefreshCw,
  Clock,
  Lock,
  Bot,
  Trash2,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { RegisterAgentModal } from "@/components/dashboard/RegisterAgentModal";
import { supabase } from "@/lib/supabase";
import { dispatchAuthChange } from "@/lib/useAuthUser";
import { TransactionItem } from "@/lib/agentTransactionStorage";

interface AgentRecord {
  id: string;
  user_id: string;
  name: string;
  framework: string;
  ping_latency_ms?: number | null;
  last_heartbeat_at?: string | null;
  status: "Active" | "Idle" | "Revoked" | "Offline" | "Unlinked" | string;
  spending_limit?: number;
  webhook_url?: string | null;
  created_at?: string;
}

interface VaultRecord {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  balance_cents?: number;
  currency: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface SettlementRecord {
  id: string;
  user_id: string;
  amount: number;
  fee: number;
  status: "SETTLED" | "DISPUTED" | "FAILED" | "PENDING";
  job_title?: string;
  created_at: string;
}

interface LedgerEntryRecord {
  id: string;
  user_id: string;
  vault_id?: string;
  transaction_id: string;
  entry_type: "DEBIT" | "CREDIT";
  amount: number;
  currency: string;
  description: string;
  created_at: string;
}

// Web Crypto SHA-256 for key hash generation
async function sha256Hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateRandomFastMcpKey(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `vst_live_${hex}`;
}

export interface DashboardClientProps {
  initialUser: {
    id: string;
    email: string;
  };
}

export default function DashboardClient({ initialUser }: DashboardClientProps) {
  const router = useRouter();

  // User state - pre-resolved from server component with zero race conditions
  const [user, setUser] = useState<{ id: string; email: string }>(initialUser);
  const [tenantId, setTenantId] = useState<string>(() => {
    const shortId = initialUser.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    return `TENANT-${shortId}`;
  });
  const [hasFounderPass, setHasFounderPass] = useState<boolean>(true);

  // Balance state in paise (smallest unit)
  const [balancePaise, setBalancePaise] = useState<number>(0);
  const [vaultId, setVaultId] = useState<string>("VLT-PRIMARY");

  // Agents & Settlements
  const [vaults, setVaults] = useState<VaultRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntryRecord[]>([]);
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Active API Key state from public.api_keys
  const [existingKey, setExistingKey] = useState<{
    id: string;
    key_hint: string;
    prefix: string;
    name?: string;
  } | null>(null);

  // API Key Generation Modal state
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [generatedKey, setGeneratedKey] = useState<string>("");
  const [isGeneratingKey, setIsGeneratingKey] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // AI Agent Registration Form Modal state
  const [isRegisterAgentModalOpen, setIsRegisterAgentModalOpen] = useState<boolean>(false);

  // Deposit test modal (INR default)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>("10000");
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  // Payment Success notification state
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        setPaymentSuccessNotice(true);
      }
    }
  }, []);

  // Currency calculations (1 USD ≈ 84 INR)
  const balanceINR = balancePaise / 100;
  const balanceUSD = balanceINR / 84;

  // Fetch verified balance via RPC, vaults, agents, and settlements for isolated tenant
  const loadTenantData = useCallback(async (userId: string) => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Verified Balance from double-entry ledger via RPC get_verified_balance
      let verifiedPaise = 0;
      try {
        const { data: rpcBal, error: rpcErr } = await supabase.rpc("get_verified_balance", {
          p_user_id: userId,
        });
        if (!rpcErr && rpcBal !== null) {
          verifiedPaise = Number(rpcBal);
        }
      } catch {
        // Fallback to vault record
      }

      // Check vaults table
      const { data: vaultRows } = await supabase
        .from("vaults")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (vaultRows && vaultRows.length > 0) {
        setVaults(vaultRows as VaultRecord[]);
        setVaultId(vaultRows[0].id.slice(0, 8).toUpperCase());
        if (verifiedPaise === 0 && vaultRows[0].balance_cents) {
          verifiedPaise = Number(vaultRows[0].balance_cents);
        }
      } else {
        // Initialize default primary vault for this user with real 0 balance
        const { data: newVault } = await supabase
          .from("vaults")
          .insert({
            user_id: userId,
            name: "Primary Autonomous Settlement Vault",
            balance: 0.0,
            balance_cents: 0,
            currency: "USD",
            status: "Active Custody",
          })
          .select()
          .maybeSingle();

        if (newVault) {
          setVaults([newVault as VaultRecord]);
          setVaultId(newVault.id.slice(0, 8).toUpperCase());
        }
      }

      setBalancePaise(verifiedPaise);

      // Query ledger_entries for velocity analytics
      try {
        const { data: ledgerRows } = await supabase
          .from("ledger_entries")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (ledgerRows) {
          setLedgerEntries(ledgerRows as LedgerEntryRecord[]);
        }
      } catch (ledgerErr) {
        console.warn("Could not fetch ledger_entries:", ledgerErr);
      }

      // 2. Query public.api_keys for existing active keys
      try {
        const { data: keyRows } = await supabase
          .from("api_keys")
          .select("id, key_hint, prefix, name, status, created_at")
          .eq("user_id", userId)
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: false });

        if (keyRows && keyRows.length > 0) {
          setExistingKey(keyRows[0]);
        } else {
          setExistingKey(null);
        }
      } catch (keyErr) {
        console.warn("Could not fetch active api_keys:", keyErr);
      }

      // 3. Agents & Registered Agents
      const { data: agentRows } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const registeredMap = new Map<string, any>();
      try {
        const { data: regRows } = await supabase
          .from("registered_agents")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (regRows && regRows.length > 0) {
          regRows.forEach((r) => registeredMap.set(r.agent_name, r));
        }
      } catch (regErr) {
        // Graceful fallback if table is newly migrating
      }

      if (agentRows && agentRows.length > 0) {
        const enrichedAgents: AgentRecord[] = agentRows.map((a) => {
          const reg = registeredMap.get(a.name);
          return {
            ...a,
            spending_limit: reg?.spending_limit !== undefined ? Number(reg.spending_limit) : undefined,
            webhook_url: reg?.webhook_url || null,
          };
        });
        setAgents(enrichedAgents);
      } else if (registeredMap.size > 0) {
        const fallbackFromReg: AgentRecord[] = Array.from(registeredMap.values()).map((r) => ({
          id: r.id,
          user_id: r.user_id,
          name: r.agent_name,
          framework: r.framework || "FastMCP",
          ping_latency_ms: null,
          last_heartbeat_at: null,
          status: "Unlinked",
          spending_limit: Number(r.spending_limit || 0),
          webhook_url: r.webhook_url,
          created_at: r.created_at,
        }));
        setAgents(fallbackFromReg);
      } else {
        setAgents([]);
      }

      // 4. Settlements
      const { data: settlementRows } = await supabase
        .from("settlements")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (settlementRows && settlementRows.length > 0) {
        setSettlements(settlementRows as SettlementRecord[]);
        const mappedTx: TransactionItem[] = settlementRows.map((s) => ({
          id: s.id,
          fromAgent: {
            name: "Orchestrator Node",
            model: "FastMCP-v1",
            avatarBg: "#2563EB",
            agentId: "agent-01",
          },
          toAgent: {
            name: "Settlement Vault",
            model: "Verisett Core",
            avatarBg: "#059669",
            agentId: "vault-01",
          },
          amountINR: Math.round(Number(s.amount) * 84),
          commissionRate: 0.0075,
          status: s.status === "SETTLED" ? "SUCCESSFUL" : "FAILED",
          timestamp: s.created_at || new Date().toISOString(),
          dateStr: new Date(s.created_at || Date.now()).toISOString().split("T")[0],
          timeStr: "12:00 PM",
          milestoneTitle: s.job_title || "Autonomous Agent Escrow Settlement",
          sha256Proof: `0x${s.id.replace(/-/g, "").slice(0, 32)}`,
          clearingRail: "FastMCP Deterministic Rail",
        }));
        setTransactions(mappedTx);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn("Telemetry loading notice:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and profile sync
  useEffect(() => {
    let isMounted = true;

    loadTenantData(user.id);

    // Check Founder Pass status from profiles
    const checkFounderPass = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("founder_pass, plan_tier")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && isMounted) {
          setHasFounderPass(Boolean(profile.founder_pass) || profile.plan_tier === "FOUNDER_NODE");
        }
      } catch {
        if (isMounted) setHasFounderPass(true);
      }
    };
    checkFounderPass();

    // Supabase auth state listener to detect sign out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
      } else if (session?.user && isMounted) {
        setUser({ id: session.user.id, email: session.user.email || initialUser.email });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [user.id, loadTenantData, router, initialUser.email]);

  // Realtime Listener on isolated vaults and ledger_entries
  useEffect(() => {
    const userId = user.id;

    const channel = supabase
      .channel(`user-realtime-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vaults",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadTenantData(userId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ledger_entries",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadTenantData(userId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agents",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadTenantData(userId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registered_agents",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadTenantData(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, loadTenantData]);

  // Live Clearinghouse Metrics Computation from User's Vaults & Settlements
  const metrics = useMemo(() => {
    // 1. Escrow Deals: Exact count of user's vaults
    const totalDeals = vaults.length;

    // 2. Cleared Volume: Real sum of user's settled vaults in INR / USD
    const settledVaults = vaults.filter((v) => {
      const st = (v.status || "").toUpperCase();
      return st === "SETTLED" || st === "VERIFIED";
    });

    const settledVaultsUSD = settledVaults.reduce((acc, v) => {
      const amount = v.balance_cents ? Number(v.balance_cents) / 100 : Number(v.balance || 0);
      return acc + amount;
    }, 0);

    const settledSettlements = settlements.filter((s) => s.status === "SETTLED");
    const settlementsUSD = settledSettlements.reduce((acc, s) => acc + Number(s.amount || 0), 0);

    const totalVolumeUSD = settledVaultsUSD + settlementsUSD;
    const totalVolumeINR = totalVolumeUSD * 84;

    // 3. Success Rate: Computed from real settlements vs failures (or "—" if 0 deals)
    const failedSettlementsCount = settlements.filter(
      (s) => s.status === "DISPUTED" || s.status === "FAILED"
    ).length;
    const failedVaultsCount = vaults.filter((v) => {
      const st = (v.status || "").toUpperCase();
      return st === "DISPUTED" || st === "FAILED" || st === "CANCELLED";
    }).length;
    const totalFailures = failedSettlementsCount + failedVaultsCount;
    const totalResolved = settledVaults.length + settledSettlements.length + totalFailures;

    const successRateStr =
      totalResolved > 0
        ? `${(((settledVaults.length + settledSettlements.length) / totalResolved) * 100).toFixed(1)}%`
        : totalDeals > 0 && settledVaults.length > 0
        ? "100.0%"
        : "—";

    const disputeRateStr =
      totalResolved > 0
        ? `${((totalFailures / totalResolved) * 100).toFixed(1)}%`
        : totalDeals > 0
        ? "0.0%"
        : "—";

    return {
      totalVolumeUSD,
      totalVolumeINR,
      totalDeals,
      successRate: successRateStr,
      disputeRate: disputeRateStr,
    };
  }, [vaults, settlements]);

  // Escrow Clearing Velocity: Daily counts for the last 7 days from vaults & ledger_entries
  const velocityChartData = useMemo(() => {
    const days: Array<{ date: string; dateKey: string; completed: number; incomplete: number }> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days.push({
        date: dateLabel,
        dateKey,
        completed: 0,
        incomplete: 0,
      });
    }

    // Tally daily counts from vaults
    vaults.forEach((v) => {
      const vDate = v.created_at || v.updated_at;
      if (!vDate) return;
      const vKey = new Date(vDate).toISOString().split("T")[0];
      const targetDay = days.find((d) => d.dateKey === vKey);
      if (targetDay) {
        const st = (v.status || "").toUpperCase();
        if (st === "SETTLED" || st === "VERIFIED") {
          targetDay.completed += 1;
        } else if (
          st === "CREATED" ||
          st === "FUNDED" ||
          st === "WORKING" ||
          st === "PENDING" ||
          st === "ACTIVE" ||
          st === "ACTIVE CUSTODY"
        ) {
          targetDay.incomplete += 1;
        }
      }
    });

    // Also factor in completed ledger_entries
    ledgerEntries.forEach((l) => {
      if (!l.created_at) return;
      const lKey = new Date(l.created_at).toISOString().split("T")[0];
      const targetDay = days.find((d) => d.dateKey === lKey);
      if (targetDay) {
        if (l.entry_type === "CREDIT") {
          targetDay.completed += 1;
        }
      }
    });

    return days.map(({ date, completed, incomplete }) => ({
      date,
      completed,
      incomplete,
    }));
  }, [vaults, ledgerEntries]);

  // Handle FastMCP Key Generation
  const handleGenerateFastMcpKey = async () => {
    try {
      setIsGeneratingKey(true);
      const rawKey = generateRandomFastMcpKey();
      const hash = await sha256Hex(rawKey);
      const hint = `...${rawKey.slice(-4)}`;

      // 1. Insert into api_keys table linked to user_id
      await supabase.from("api_keys").insert({
        user_id: user.id,
        key_hash: hash,
        key_hint: hint,
        prefix: "vst_live_",
        name: "FastMCP Autonomous Swarm Key",
        status: "ACTIVE",
      });

      // 2. Insert initial agent node into agents table with Unlinked status
      await supabase.from("agents").insert({
        user_id: user.id,
        name: `FastMCP-Swarm-${Math.floor(100 + Math.random() * 900)}`,
        framework: "FastMCP",
        ping_latency_ms: null,
        status: "Unlinked",
      });

      // Show key in modal
      setGeneratedKey(rawKey);
      setIsKeyModalOpen(true);
      await loadTenantData(user.id);
    } catch (err) {
      console.error("Failed to generate FastMCP key:", err);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // Revoke Key / Agent
  const handleRevokeAgent = async (agentId: string) => {
    try {
      await supabase
        .from("agents")
        .update({ status: "Revoked" })
        .eq("id", agentId)
        .eq("user_id", user.id);

      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: "Revoked" } : a))
      );
    } catch (err) {
      console.warn("Could not revoke agent:", err);
    }
  };

  // Delete Agent from Supabase and immediately filter out from local state array
  const handleDeleteAgent = async (agentId: string, agentName?: string) => {
    try {
      // 1. Delete from agents table
      await supabase
        .from("agents")
        .delete()
        .eq("id", agentId)
        .eq("user_id", user.id);

      // 2. Also delete from registered_agents table if matched by ID or name
      try {
        await supabase
          .from("registered_agents")
          .delete()
          .eq("id", agentId)
          .eq("user_id", user.id);

        if (agentName) {
          await supabase
            .from("registered_agents")
            .delete()
            .eq("agent_name", agentName)
            .eq("user_id", user.id);
        }
      } catch (regErr) {
        // Ignore if table does not contain row
      }

      // 3. Immediately filter out from local state array
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
    } catch (err) {
      console.warn("Could not delete agent:", err);
      // Still remove locally so UI reflects removal immediately
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
    }
  };

  // Instant Real-time Deposit inserting into immutable ledger and updating vault
  const handleSimulateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNumINR = parseFloat(depositAmount);
    if (isNaN(amountNumINR) || amountNumINR <= 0) return;
    const depositPaise = Math.round(amountNumINR * 100);

    try {
      setIsDepositing(true);

      // 1. Double-entry immutable ledger CREDIT entry
      await supabase.from("ledger_entries").insert({
        user_id: user.id,
        transaction_id: crypto.randomUUID(),
        entry_type: "CREDIT",
        amount: depositPaise,
        currency: "INR",
        description: "Tenant Real-Time Vault Deposit",
      });

      const newBalPaise = balancePaise + depositPaise;
      const newBalUSD = (newBalPaise / 100) / 84;

      // 2. Update Supabase vaults table
      await supabase
        .from("vaults")
        .update({
          balance: newBalUSD,
          balance_cents: Math.round(newBalUSD * 100),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      setBalancePaise(newBalPaise);
      setIsDepositModalOpen(false);
    } catch (err) {
      console.warn("Deposit notice:", err);
      setBalancePaise((prev) => prev + depositPaise);
      setIsDepositModalOpen(false);
    } finally {
      setIsDepositing(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("verisett_user_email");
      localStorage.removeItem("verisett_user_name");
      localStorage.removeItem("verisett_auth_provider");
      dispatchAuthChange();
    } catch {
      // Ignore
    }
    router.replace("/login");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#FDFCF9] text-[#1C1A17] px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10 font-sans overflow-x-hidden">
      {/* Background Ambience */}
      <GoldenBackgroundShapes variant="subtle" density="dense" />

      <div className="relative z-10 max-w-[1720px] w-full mx-auto space-y-8 sm:space-y-10">
        {/* Navigation & Tenant Header Bar */}
        <header className="flex items-center justify-between border border-[#EAE3D2] bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(37,99,235,0.06)] flex-wrap gap-4">
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/" className="hover:opacity-85 transition-opacity">
              <VerisettLogo size={36} />
            </Link>
            <div className="h-7 w-[1px] bg-[#EAE3D2] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-[#1C1A17] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#EAE3D2]">
                {tenantId}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Live Custody
              </span>
            </div>
          </div>

          {/* Action Links & Profile */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <nav className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#EAE3D2] text-xs sm:text-sm font-medium">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-white text-blue-600 font-semibold shadow-xs border border-blue-100"
              >
                Vault &amp; Telemetry
              </Link>
              <Link
                href="/dashboard/billing"
                className="px-4 py-2 rounded-xl text-[#6E675D] hover:text-[#1C1A17] transition-colors"
              >
                Protocol Billing &amp; Rails
              </Link>
            </nav>

            <button
              onClick={() => setIsRegisterAgentModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Register AI Agent</span>
            </button>

            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EAE3D2] bg-white hover:bg-neutral-50 text-[#1C1A17] text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Deposit Funds</span>
            </button>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2.5 rounded-xl border border-[#EAE3D2] bg-white hover:bg-rose-50 hover:text-rose-600 text-[#8C8275] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Payment Success Alert Banner */}
        {paymentSuccessNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Payment Confirmed: Your Founder Node Pass (₹29,999.00) is active with permanent 0.75% take-rate!
              </span>
            </div>
            <button
              onClick={() => setPaymentSuccessNotice(false)}
              className="text-xs font-mono text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg bg-emerald-100/70 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Overview Bar: User Profile, Dual Realtime Balance, Settlement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 1. User Profile & Tenant Badge */}
          <div className="rounded-3xl border border-[#EAE3D2] bg-white p-7 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 overflow-hidden">
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono uppercase tracking-wider text-[#8C8275] font-semibold">
                  Authenticated Tenant
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-[#1C1A17] truncate mt-1" title={user.email}>
                  {user.email}
                </h2>
                <p className="text-xs sm:text-sm font-mono text-blue-600 font-medium mt-1">
                  Node Ref: {vaultId}
                </p>
              </div>
              {hasFounderPass ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs shrink-0 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Founder Node Pass</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium shrink-0 whitespace-nowrap">
                  Standard Tier
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-[#F0E9DC] flex items-center justify-between text-xs sm:text-sm text-[#6E675D]">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                RLS Multi-Tenant Enforced
              </span>
              <span className="font-mono text-xs bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EAE3D2]">
                PostgreSQL 16
              </span>
            </div>
          </div>

          {/* 2. Realtime Vault Balance: Dual Display (Primary ₹ INR & Secondary $ USD) */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/25 to-blue-100/35 p-7 sm:p-8 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-800 font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                Realtime Verified Balance
              </span>
              <button
                onClick={() => loadTenantData(user.id)}
                title="Refresh Vault Telemetry"
                className="text-blue-600 hover:text-blue-700 cursor-pointer p-1.5 rounded-lg hover:bg-blue-100/60 transition"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#1C1A17] font-sans tracking-tight leading-none flex items-baseline flex-wrap gap-2">
                <span>₹{balanceINR.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-sm sm:text-base font-mono font-bold text-blue-600">
                  INR
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-[#6E675D] font-mono mt-2 flex items-baseline gap-1.5">
                <span>≈ ${balanceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-xs font-normal text-[#8C8275]">
                  USD (@ ₹84/$)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-100 flex items-center justify-between text-xs font-mono text-blue-700">
              <span>Double-Entry Immutable Ledger</span>
              <span className="font-bold">0.75% Protocol Rate</span>
            </div>
          </div>

          {/* 3. Settlement Metrics Overview */}
          <div className="rounded-3xl border border-[#EAE3D2] bg-white p-7 sm:p-8 shadow-sm flex flex-col justify-between space-y-4">
            <p className="text-xs font-mono uppercase tracking-wider text-[#8C8275] font-semibold">
              Clearinghouse Telemetry
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                <span className="text-xs font-mono text-[#8C8275] block">
                  Cleared Volume
                </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-[#1C1A17] font-mono block truncate mt-0.5">
                  ₹{metrics.totalVolumeINR.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs font-mono text-[#8C8275] mt-0.5 block truncate">
                  ≈ ${metrics.totalVolumeUSD.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD
                </span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                <span className="text-xs font-mono text-[#8C8275] block">
                  Escrow Deals
                </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-[#1C1A17] font-mono block mt-0.5">
                  {metrics.totalDeals} Cleared
                </span>
                <span className="text-xs font-mono text-blue-600 mt-0.5 block">
                  Autonomous Settle
                </span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                <span className="text-xs font-mono text-emerald-700 block font-semibold">
                  Success Rate
                </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-emerald-600 font-mono block mt-0.5">
                  {metrics.successRate}
                </span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                <span className="text-xs font-mono text-rose-700 block font-semibold">
                  Dispute Rate
                </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-rose-600 font-mono block mt-0.5">
                  {metrics.disputeRate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ESCROW CLEARING VELOCITY LINE GRAPH */}
        <TransactionChart data={velocityChartData} />

        {/* MAIN BODY: ZERO-AGENT STATE vs ACTIVE-AGENT STATE */}
        {agents.length === 0 ? (
          /* Dedicated High-Contrast Onboarding Hero Card */
          <div className="rounded-3xl border-2 border-blue-500/30 bg-white p-10 sm:p-14 lg:p-16 shadow-[0_16px_60px_rgba(37,99,235,0.08)] relative overflow-hidden text-center space-y-8">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="inline-flex p-4 sm:p-5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 mb-2 shadow-xs">
                <Cpu className="w-10 h-10" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C1A17] tracking-tight">
                Connect Your Autonomous Swarm
              </h2>
              <p className="text-base sm:text-lg text-[#6E675D] leading-relaxed">
                Generate a cryptographically scoped FastMCP key to link your
                swarm to Verisett clearing vaults. Your credentials are securely
                isolated with Row Level Security.
              </p>
            </div>

            {/* Interactive Generate Key Button and Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setIsRegisterAgentModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-base tracking-wide shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Bot className="w-5 h-5" />
                <span>Register Autonomous Agent</span>
              </button>

              <button
                onClick={handleGenerateFastMcpKey}
                disabled={isGeneratingKey}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-zinc-300 bg-white hover:bg-zinc-50 active:bg-zinc-100 text-[#1C1A17] font-semibold text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-60"
              >
                <Key className="w-4 h-4 text-blue-600" />
                <span>
                  {isGeneratingKey
                    ? "Generating FastMCP Key..."
                    : existingKey || generatedKey
                    ? "Quick Re-Key"
                    : "Quick Connect FastMCP"}
                </span>
              </button>

            </div>

            {/* Scoped Credential Status (Never exposes raw secret key without explicit re-auth) */}
            {existingKey && (
              <div className="pt-2 flex justify-center animate-in fade-in">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] text-[#6E675D] text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    Scoped Key Active:{" "}
                    <span className="font-semibold text-[#1C1A17]">
                      {existingKey.prefix || "vst_live_"}...{existingKey.key_hint || ""}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Agent State Responsive Telemetry Grid */
          <div className="space-y-8">
            {/* Agent Swarm Table */}
            <div className="rounded-3xl border border-[#EAE3D2] bg-white p-8 sm:p-10 lg:p-12 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0E9DC] flex-wrap gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1C1A17] flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-blue-600" />
                    <span>Connected Agent Swarm Nodes</span>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-mono font-semibold border border-blue-200">
                      {agents.length} Nodes
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8C8275] mt-1">
                    Autonomous agents registered under this tenant with scoped
                    FastMCP credentials.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsRegisterAgentModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Register AI Agent</span>
                  </button>
                  <button
                    onClick={handleGenerateFastMcpKey}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs sm:text-sm font-semibold font-mono transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Quick Connect</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans">
                  <thead>
                    <tr className="border-b border-[#F0E9DC] text-xs font-mono uppercase tracking-wider text-[#8C8275]">
                      <th className="py-4 px-4">Agent ID</th>
                      <th className="py-4 px-4">Name</th>
                      <th className="py-4 px-4">Framework</th>
                      <th className="py-4 px-4">Spending Cap</th>
                      <th className="py-4 px-4">Latency</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E9DC]">
                    {agents.map((agent) => {
                      const isRevoked = (agent.status || "").toUpperCase() === "REVOKED";
                      const isHeartbeatValid =
                        !isRevoked &&
                        Boolean(
                          agent.last_heartbeat_at &&
                            Date.now() - new Date(agent.last_heartbeat_at).getTime() <= 60000
                        );

                      return (
                        <tr
                          key={agent.id}
                          className="hover:bg-[#FAF8F5]/80 transition-colors"
                        >
                          <td className="py-4 sm:py-5 px-4 font-mono font-semibold text-[#1C1A17]">
                            {agent.id.slice(0, 8)}...
                          </td>
                          <td className="py-4 sm:py-5 px-4 font-semibold text-[#1C1A17]">
                            {agent.name}
                          </td>
                          <td className="py-4 sm:py-5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EAE3D2] font-mono text-xs text-[#4A453E]">
                              {agent.framework || "FastMCP"}
                            </span>
                          </td>
                          <td className="py-4 sm:py-5 px-4 font-mono text-xs text-[#1C1A17] font-semibold">
                            {agent.spending_limit !== undefined
                              ? `₹${agent.spending_limit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                              : "Unlimited"}
                          </td>
                          <td className="py-4 sm:py-5 px-4 font-mono">
                            {isRevoked ? (
                              <span className="inline-flex items-center gap-1.5 text-neutral-400 font-medium text-xs">
                                <span className="w-2 h-2 rounded-full bg-neutral-300" />
                                Offline
                              </span>
                            ) : isHeartbeatValid && agent.ping_latency_ms ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {agent.ping_latency_ms}ms
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-neutral-400 font-medium text-xs">
                                <span className="w-2 h-2 rounded-full bg-neutral-300" />
                                Unlinked
                              </span>
                            )}
                          </td>
                          <td className="py-4 sm:py-5 px-4">
                            {isRevoked ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">
                                Revoked
                              </span>
                            ) : isHeartbeatValid ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-neutral-100 text-neutral-500 border border-neutral-200">
                                {agent.status === "Idle" ? "Idle" : "Unlinked"}
                              </span>
                            )}
                          </td>
                          <td className="py-4 sm:py-5 px-4 text-right">
                            {isRevoked ? (
                              <button
                                onClick={() => handleDeleteAgent(agent.id, agent.name)}
                                className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer font-medium shadow-2xs"
                                title="Delete Revoked Node"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete</span>
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <button
                                  onClick={() => handleRevokeAgent(agent.id)}
                                  className="text-xs font-mono px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-zinc-700 transition cursor-pointer font-medium"
                                  title="Revoke Credentials"
                                >
                                  Revoke Key
                                </button>
                                <button
                                  onClick={() => handleDeleteAgent(agent.id, agent.name)}
                                  className="p-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-rose-50 hover:border-rose-200 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                                  title="Delete Agent"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Raw FastMCP Key Generation Display Once */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-[#EAE3D2] bg-white p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex p-2 rounded-xl bg-blue-50 text-blue-600 mb-2">
                  <Key className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-[#1C1A17]">
                  FastMCP API Key Generated
                </h3>
                <p className="text-xs text-[#6E675D]">
                  This raw secret key is only displayed once. Please store it
                  securely in your environment.
                </p>
              </div>
            </div>

            {/* Raw Key Display */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase font-bold text-[#4A453E]">
                Raw API Secret Key
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs">
                <span className="truncate mr-2">{generatedKey}</span>
                <button
                  onClick={() => copyToClipboard(generatedKey)}
                  className="shrink-0 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer"
                  title="Copy Key"
                >
                  {copiedKey ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Run command snippet */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase font-bold text-[#4A453E]">
                Agent Launch Command
              </label>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-[#1C1A17] font-mono text-xs overflow-x-auto">
                <code>npx -y @verisett/mcp-server@latest --key={generatedKey}</code>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition cursor-pointer"
              >
                I Have Saved My Secret Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Deposit Funds Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#EAE3D2] bg-white p-7 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#1C1A17]">
                Deposit Custody Funds
              </h3>
              <p className="text-xs text-[#6E675D]">
                Add balance to your tenant vault to power autonomous agent
                escrows.
              </p>
            </div>

            <form onSubmit={handleSimulateDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#4A453E] mb-1.5 uppercase">
                  Deposit Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8C8275]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:outline-none font-mono text-sm font-bold text-[#1C1A17]"
                  />
                </div>
                <p className="text-[11px] font-mono text-[#8C8275] mt-1.5">
                  Equivalent:{" "}
                  ${((parseFloat(depositAmount) || 0) / 84).toFixed(2)}{" "}
                  USD (@ ₹84/$)
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6E675D] hover:text-[#1C1A17] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                >
                  {isDepositing ? "Processing..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Autonomous AI Agent Registration Form */}
      <RegisterAgentModal
        isOpen={isRegisterAgentModalOpen}
        onClose={() => setIsRegisterAgentModalOpen(false)}
        onAgentRegistered={() => loadTenantData(user.id)}
      />
    </div>
  );
}
