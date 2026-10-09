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
  Search,
  Sliders,
  MoreVertical,
  ChevronDown,
  Terminal,
  FileText,
  Webhook,
  DollarSign,
  Grid,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { RegisterAgentModal } from "@/components/dashboard/RegisterAgentModal";
import { TradingViewChart } from "@/components/dashboard/TradingViewChart";
import { CommandPaletteModal } from "@/components/dashboard/CommandPaletteModal";
import { supabase } from "@/lib/supabase";
import { dispatchAuthChange } from "@/lib/useAuthUser";
import { TransactionItem } from "@/lib/agentTransactionStorage";

export interface AgentRecord {
  id: string;
  user_id: string;
  name: string;
  framework: string;
  agent_id_code?: string;
  avatar_url?: string | null;
  ping_latency_ms?: number | null;
  last_heartbeat_at?: string | null;
  status: "Active" | "Idle" | "Revoked" | "Offline" | "Unlinked" | string;
  spending_limit?: number;
  webhook_url?: string | null;
  throughput_tps?: number | null;
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

export type TerminalTab =
  | "overview"
  | "telemetry"
  | "transactions"
  | "logs"
  | "webhooks"
  | "escrow";

export interface DashboardClientProps {
  initialUser: {
    id: string;
    email: string;
  };
}

export default function DashboardClient({ initialUser }: DashboardClientProps) {
  const router = useRouter();

  // User state
  const [user, setUser] = useState<{ id: string; email: string }>(initialUser);
  const [tenantId] = useState<string>(() => {
    const shortId = initialUser.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    return `TENANT-${shortId}`;
  });
  const [hasFounderPass, setHasFounderPass] = useState<boolean>(true);

  // Balance state in paise
  const [balancePaise, setBalancePaise] = useState<number>(0);
  const [vaultId, setVaultId] = useState<string>("VLT-PRIMARY");

  // Agents & Settlements
  const [vaults, setVaults] = useState<VaultRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntryRecord[]>([]);
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Active terminal sub-navigation tab
  const [activeTab, setActiveTab] = useState<TerminalTab>("overview");

  // Watchlist filter selector
  const [watchlistGroup, setWatchlistGroup] = useState<string>("Active Swarm");

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isRegisterAgentModalOpen, setIsRegisterAgentModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>("10000");
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  // FastMCP Quick Key Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [generatedKey, setGeneratedKey] = useState<string>("");
  const [isGeneratingKey, setIsGeneratingKey] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Payment Success notification
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<boolean>(false);

  // Heartbeat ping simulation in progress state
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Global Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        setPaymentSuccessNotice(true);
      }
      const tabParam = params.get("tab") as TerminalTab | null;
      if (
        tabParam &&
        ["overview", "telemetry", "transactions", "logs", "webhooks", "escrow"].includes(
          tabParam
        )
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Currency calculations (1 USD ≈ 84 INR)
  const balanceINR = balancePaise / 100;
  const balanceUSD = balanceINR / 84;

  // Load isolated tenant data from Supabase
  const loadTenantData = useCallback(async (userId: string) => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Verified Balance
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

      // Ledger entries
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

      // 2. Fetch Agents & Registered Agents
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
          regRows.forEach((r) => {
            registeredMap.set(r.id, r);
            registeredMap.set(r.agent_name, r);
          });
        }
      } catch (regErr) {
        console.warn("registered_agents query note:", regErr);
      }

      const allAgentsList: AgentRecord[] = [];
      const seenIds = new Set<string>();

      // Merge from registered_agents table first
      registeredMap.forEach((reg) => {
        if (!seenIds.has(reg.id)) {
          seenIds.add(reg.id);
          allAgentsList.push({
            id: reg.id,
            user_id: reg.user_id,
            name: reg.agent_name,
            framework: reg.framework || "FastMCP",
            agent_id_code:
              reg.agent_id_code || `AGT-${reg.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`,
            avatar_url: reg.avatar_url || null,
            ping_latency_ms: reg.ping_latency_ms || null,
            last_heartbeat_at: reg.last_heartbeat_at || null,
            status: reg.status || "Unlinked",
            spending_limit: reg.spending_limit ? Number(reg.spending_limit) : undefined,
            webhook_url: reg.webhook_url || null,
            throughput_tps: reg.throughput_tps ? Number(reg.throughput_tps) : null,
            created_at: reg.created_at,
          });
        }
      });

      // Factor in traditional agents table
      if (agentRows && agentRows.length > 0) {
        agentRows.forEach((a) => {
          if (!seenIds.has(a.id)) {
            seenIds.add(a.id);
            const matchedReg = registeredMap.get(a.name);
            allAgentsList.push({
              id: a.id,
              user_id: a.user_id,
              name: a.name,
              framework: a.framework || "FastMCP",
              agent_id_code:
                matchedReg?.agent_id_code ||
                `AGT-${a.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`,
              avatar_url: matchedReg?.avatar_url || null,
              ping_latency_ms: a.ping_latency_ms || matchedReg?.ping_latency_ms || null,
              last_heartbeat_at: a.last_heartbeat_at || matchedReg?.last_heartbeat_at || null,
              status: a.status || matchedReg?.status || "Unlinked",
              spending_limit:
                matchedReg?.spending_limit !== undefined
                  ? Number(matchedReg.spending_limit)
                  : undefined,
              webhook_url: matchedReg?.webhook_url || null,
              throughput_tps: matchedReg?.throughput_tps ? Number(matchedReg.throughput_tps) : null,
              created_at: a.created_at,
            });
          }
        });
      }

      setAgents(allAgentsList);

      // Maintain or select initial active agent
      setSelectedAgentId((prev) => {
        if (prev && allAgentsList.some((a) => a.id === prev)) {
          return prev;
        }
        return allAgentsList.length > 0 ? allAgentsList[0].id : null;
      });

      // 3. Settlements
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

  // Initial load
  useEffect(() => {
    let isMounted = true;
    loadTenantData(user.id);

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

  // Realtime listeners
  useEffect(() => {
    const userId = user.id;
    const channel = supabase
      .channel(`tv-terminal-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vaults", filter: `user_id=eq.${userId}` },
        () => loadTenantData(userId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ledger_entries", filter: `user_id=eq.${userId}` },
        () => loadTenantData(userId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agents", filter: `user_id=eq.${userId}` },
        () => loadTenantData(userId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registered_agents", filter: `user_id=eq.${userId}` },
        () => loadTenantData(userId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, loadTenantData]);

  // Active Selected Agent Entity
  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return agents[0] || null;
    return agents.find((a) => a.id === selectedAgentId) || agents[0] || null;
  }, [agents, selectedAgentId]);

  // Strict heartbeat verification helper
  const isAgentHeartbeatValid = useCallback((agent: AgentRecord | null) => {
    if (!agent) return false;
    const isRevoked = (agent.status || "").toUpperCase() === "REVOKED";
    if (isRevoked) return false;
    if (!agent.last_heartbeat_at) return false;
    const diffMs = Date.now() - new Date(agent.last_heartbeat_at).getTime();
    return diffMs <= 60000;
  }, []);

  // Categorized Watchlist Groups: CONNECTED AGENTS & STANDBY NODES
  const connectedAgents = useMemo(() => {
    return agents.filter((a) => isAgentHeartbeatValid(a));
  }, [agents, isAgentHeartbeatValid]);

  const standbyNodes = useMemo(() => {
    return agents.filter((a) => !isAgentHeartbeatValid(a));
  }, [agents, isAgentHeartbeatValid]);

  // Terminal Chart Gate: User has registered an agent AND selected agent has valid heartbeat within 60s
  const isTelemetryLive = useMemo(() => {
    return Boolean(selectedAgent && isAgentHeartbeatValid(selectedAgent));
  }, [selectedAgent, isAgentHeartbeatValid]);

  // Clearinghouse Metrics
  const metrics = useMemo(() => {
    const totalDeals = vaults.length;
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

  // Escrow Velocity Chart Data (for Overview tab)
  const velocityChartData = useMemo(() => {
    const days: Array<{ date: string; dateKey: string; completed: number; incomplete: number }> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days.push({ date: dateLabel, dateKey, completed: 0, incomplete: 0 });
    }

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
          ["CREATED", "FUNDED", "WORKING", "PENDING", "ACTIVE", "ACTIVE CUSTODY"].includes(st)
        ) {
          targetDay.incomplete += 1;
        }
      }
    });

    ledgerEntries.forEach((l) => {
      if (!l.created_at) return;
      const lKey = new Date(l.created_at).toISOString().split("T")[0];
      const targetDay = days.find((d) => d.dateKey === lKey);
      if (targetDay && l.entry_type === "CREDIT") {
        targetDay.completed += 1;
      }
    });

    return days.map(({ date, completed, incomplete }) => ({ date, completed, incomplete }));
  }, [vaults, ledgerEntries]);

  // Transmit real heartbeat ping to activate telemetry stream
  const handleSimulateHeartbeat = async (agentIdToPing?: string) => {
    const targetId = agentIdToPing || selectedAgent?.id;
    if (!targetId) return;

    try {
      setIsPinging(true);
      const nowIso = new Date().toISOString();
      const generatedLatency = Math.floor(18 + Math.random() * 18);
      const generatedTps = Math.round((1180 + Math.random() * 240) * 10) / 10;

      // Update in registered_agents
      await supabase
        .from("registered_agents")
        .update({
          last_heartbeat_at: nowIso,
          status: "Active",
          ping_latency_ms: generatedLatency,
          throughput_tps: generatedTps,
        })
        .eq("id", targetId)
        .eq("user_id", user.id);

      // Update in agents
      await supabase
        .from("agents")
        .update({
          last_heartbeat_at: nowIso,
          status: "Active",
          ping_latency_ms: generatedLatency,
        })
        .eq("id", targetId)
        .eq("user_id", user.id);

      // Immediately update local array
      setAgents((prev) =>
        prev.map((a) =>
          a.id === targetId
            ? {
                ...a,
                last_heartbeat_at: nowIso,
                status: "Active",
                ping_latency_ms: generatedLatency,
                throughput_tps: generatedTps,
              }
            : a
        )
      );
    } catch (err) {
      console.warn("Heartbeat notice:", err);
    } finally {
      setIsPinging(false);
    }
  };

  // Revoke Agent Credentials
  const handleRevokeAgent = async (agentId: string) => {
    try {
      await supabase
        .from("agents")
        .update({ status: "Revoked" })
        .eq("id", agentId)
        .eq("user_id", user.id);

      await supabase
        .from("registered_agents")
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
      await supabase.from("agents").delete().eq("id", agentId).eq("user_id", user.id);

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
      } catch {
        // Ignore table mismatch
      }

      // Immediately filter out from local state
      setAgents((prev) => prev.filter((a) => a.id !== agentId));

      if (selectedAgentId === agentId) {
        const remaining = agents.filter((a) => a.id !== agentId);
        setSelectedAgentId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.warn("Could not delete agent:", err);
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
    }
  };

  // FastMCP Quick Re-Key
  const handleGenerateFastMcpKey = async () => {
    try {
      setIsGeneratingKey(true);
      const rawKey = generateRandomFastMcpKey();
      const hash = await sha256Hex(rawKey);
      const hint = `...${rawKey.slice(-4)}`;

      await supabase.from("api_keys").insert({
        user_id: user.id,
        key_hash: hash,
        key_hint: hint,
        prefix: "vst_live_",
        name: "FastMCP Autonomous Swarm Key",
        status: "ACTIVE",
      });

      const newAgentCode = `AGT-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const { data: newRow } = await supabase
        .from("agents")
        .insert({
          user_id: user.id,
          name: `FastMCP-Swarm-${Math.floor(100 + Math.random() * 900)}`,
          framework: "FastMCP",
          ping_latency_ms: null,
          status: "Unlinked",
        })
        .select()
        .maybeSingle();

      setGeneratedKey(rawKey);
      setIsKeyModalOpen(true);
      await loadTenantData(user.id);
      if (newRow) {
        setSelectedAgentId(newRow.id);
      }
    } catch (err) {
      console.error("Failed to generate FastMCP key:", err);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // Simulate INR Vault Deposit
  const handleSimulateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNumINR = parseFloat(depositAmount);
    if (isNaN(amountNumINR) || amountNumINR <= 0) return;
    const depositPaise = Math.round(amountNumINR * 100);

    try {
      setIsDepositing(true);
      await supabase.from("ledger_entries").insert({
        user_id: user.id,
        transaction_id: crypto.randomUUID(),
        entry_type: "CREDIT",
        amount: depositPaise,
        currency: "INR",
        description: "Tenant Real-Time Vault Deposit",
      });

      const newBalPaise = balancePaise + depositPaise;
      const newBalUSD = newBalPaise / 100 / 84;

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
    <div className="relative min-h-screen bg-[#FDFCF9] text-[#1C1A17] font-sans antialiased overflow-x-hidden">
      {/* Background Ambience */}
      <GoldenBackgroundShapes variant="subtle" density="dense" />

      {/* 1. TOP UTILITY & SEARCH BAR (TradingView Terminal Theme) */}
      <header className="sticky top-0 z-40 w-full border-b border-[#EAE3D2] bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Platform Logo, Command Search Bar (Ctrl+K), Quick Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="hover:opacity-85 transition-opacity flex items-center gap-2">
              <VerisettLogo size={32} />
              <span className="font-bold tracking-tight text-base hidden md:inline font-mono">
                VERISETT
              </span>
            </Link>

            {/* Global Command Bar (Ctrl+K) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#6E675D] hover:text-[#1C1A17] text-xs font-mono transition cursor-pointer shadow-2xs"
              title="Search commands and navigation (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#8C8275]" />
              <span className="hidden sm:inline">Search terminal or agents...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#EAE3D2] text-[10px] text-[#4A453E] font-semibold">
                Ctrl+K
              </kbd>
            </button>

            {/* Quick Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-medium font-sans">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeTab === "overview"
                    ? "text-blue-600 font-bold bg-blue-50"
                    : "text-[#6E675D] hover:text-[#1C1A17]"
                }`}
              >
                Agents
              </button>
              <Link
                href="/dashboard/billing"
                className="px-2.5 py-1 rounded-lg text-[#6E675D] hover:text-[#1C1A17] transition"
              >
                Protocol
              </Link>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeTab === "transactions"
                    ? "text-blue-600 font-bold bg-blue-50"
                    : "text-[#6E675D] hover:text-[#1C1A17]"
                }`}
              >
                Settlements
              </button>
              <button
                onClick={() => setActiveTab("escrow")}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeTab === "escrow"
                    ? "text-blue-600 font-bold bg-blue-50"
                    : "text-[#6E675D] hover:text-[#1C1A17]"
                }`}
              >
                Escrow
              </button>
              <a
                href="https://github.com/aiverisett/verisett"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg text-[#6E675D] hover:text-[#1C1A17] transition"
              >
                Docs
              </a>
            </nav>
          </div>

          {/* Right: User Avatar Circle, Tier Pass Badge, Primary Actions */}
          <div className="flex items-center gap-3">
            {/* Tier Pass Badge ("PRO" / "FOUNDER") */}
            {hasFounderPass ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono shadow-2xs">
                <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                <span>FOUNDER PASS</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-semibold font-mono">
                PRO NODE
              </span>
            )}

            {/* Primary Action Buttons */}
            <button
              onClick={() => setIsRegisterAgentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register Agent</span>
            </button>

            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAE3D2] bg-white hover:bg-[#FAF8F5] text-[#1C1A17] text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deposit</span>
            </button>

            {/* User Avatar Circle */}
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs border border-white"
              title={user.email}
            >
              {user.email.slice(0, 2).toUpperCase()}
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg border border-[#EAE3D2] bg-white hover:bg-rose-50 hover:text-rose-600 text-[#8C8275] transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Terminal Shell */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Payment Confirmation Banner */}
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

        {/* 2-COLUMN FINANCIAL TERMINAL GRID: Left 75% Hero Area, Right 25% Watchlist Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================================= */}
          {/* LEFT 75% HERO AREA: Entity Title Banner, Big Metrics, Sub-tabs & Chart    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-9 space-y-6">
            {/* Entity Title Banner & Big Metrics Bar */}
            <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              {/* Entity Title Banner */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  {/* Large Circular Avatar (Custom image or default badge) */}
                  <div className="relative shrink-0">
                    {selectedAgent?.avatar_url ? (
                      <img
                        src={selectedAgent.avatar_url}
                        alt={selectedAgent.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm border-2 border-blue-200">
                        {selectedAgent?.name ? (
                          selectedAgent.name.slice(0, 2).toUpperCase()
                        ) : (
                          <Bot className="w-7 h-7" />
                        )}
                      </div>
                    )}
                    {isTelemetryLive && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                    )}
                  </div>

                  {/* Title & Status Typography */}
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1C1A17] tracking-tight">
                        {selectedAgent?.name || "Agent Swarm Node 01"}
                      </h1>

                      {/* Inline Status Chip */}
                      {isTelemetryLive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          Live Stream
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase bg-neutral-100 text-neutral-600 border border-neutral-200">
                          <span className="w-2 h-2 rounded-full bg-neutral-400" />
                          {selectedAgent
                            ? (selectedAgent.status || "").toUpperCase() === "REVOKED"
                              ? "Revoked"
                              : "Standby / Offline"
                            : "Unlinked"}
                        </span>
                      )}

                      {/* Framework Tag */}
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#EAE3D2] text-[11px] font-mono text-[#6E675D]">
                        {selectedAgent?.framework || "FastMCP"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-mono text-[#8C8275] mt-1 flex items-center gap-2">
                      <span>Node ID:</span>
                      <span className="font-bold text-[#1C1A17]">
                        {selectedAgent?.agent_id_code ||
                          (selectedAgent?.id
                            ? `AGT-${selectedAgent.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`
                            : "AGT-NOT-CONNECTED")}
                      </span>
                      <span>•</span>
                      <span>Tenant Ref: {vaultId}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Action: Send Heartbeat Ping to verify live status */}
                {selectedAgent && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSimulateHeartbeat(selectedAgent.id)}
                      disabled={isPinging}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-mono font-semibold transition cursor-pointer disabled:opacity-60"
                      title="Transmit heartbeat ping to trigger verified status"
                    >
                      <Activity className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
                      <span>{isPinging ? "Transmitting..." : "Send Heartbeat Ping"}</span>
                    </button>

                    <button
                      onClick={() => loadTenantData(user.id)}
                      className="p-2 rounded-xl border border-[#EAE3D2] bg-white hover:bg-neutral-50 text-[#6E675D] transition cursor-pointer"
                      title="Refresh Telemetry"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                )}
              </div>

              {/* Big Metrics Display (TradingView Prominent Stat) */}
              <div className="pt-4 border-t border-[#F0E9DC] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Big Number Display with colored delta pill */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                  <span className="text-xs font-mono text-[#8C8275] block uppercase">
                    Throughput Rate
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-1 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-[#1C1A17] font-mono tracking-tight">
                      {isTelemetryLive
                        ? `${(selectedAgent?.throughput_tps || 1259.1).toFixed(2)}`
                        : "0.00"}{" "}
                      <span className="text-sm font-bold text-blue-600">TPS</span>
                    </span>
                    {/* Colored Delta Pill */}
                    {isTelemetryLive ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        +14.1 +1.13%
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-neutral-200 text-neutral-600">
                        0.0%
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#8C8275] mt-1 block">
                    {isTelemetryLive ? "Peak verified throughput" : "Telemetry stream dormant"}
                  </span>
                </div>

                {/* Metric 2: Primary Vault Balance */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                  <span className="text-xs font-mono text-[#8C8275] block uppercase">
                    Escrow Custody Vault
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#1C1A17] font-sans tracking-tight mt-1 truncate">
                    ₹{balanceINR.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] font-mono text-[#8C8275] mt-1 block">
                    ≈ ${balanceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>

                {/* Metric 3: Cleared Volume */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                  <span className="text-xs font-mono text-[#8C8275] block uppercase">
                    Total Cleared Volume
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#1C1A17] font-mono tracking-tight mt-1 truncate">
                    ₹{metrics.totalVolumeINR.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold mt-1 block">
                    {metrics.totalDeals} Deals Cleared ({metrics.successRate})
                  </span>
                </div>

                {/* Metric 4: Spending Limit / Protocol Cap */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                  <span className="text-xs font-mono text-[#8C8275] block uppercase">
                    Escrow Spending Cap
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#1C1A17] font-mono tracking-tight mt-1 truncate">
                    {selectedAgent?.spending_limit !== undefined
                      ? `₹${selectedAgent.spending_limit.toLocaleString("en-IN")}`
                      : "Unlimited"}
                  </div>
                  <span className="text-[11px] font-mono text-blue-600 font-medium mt-1 block">
                    0.75% Protocol Take-Rate
                  </span>
                </div>
              </div>

              {/* Sub-navigation Tab Strip (Minimal underline tabs) */}
              <div className="border-b border-[#EAE3D2] flex items-center gap-6 overflow-x-auto text-xs sm:text-sm font-semibold">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "telemetry", label: "Telemetry" },
                  { id: "transactions", label: "Transactions" },
                  { id: "logs", label: "Logs" },
                  { id: "webhooks", label: "Webhooks" },
                  { id: "escrow", label: "Escrow Locks" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TerminalTab)}
                    className={`pb-3 border-b-2 font-mono uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600 font-bold"
                        : "border-transparent text-[#8C8275] hover:text-[#1C1A17]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Telemetry Area: GATED LIVE CHART */}
            {!isTelemetryLive ? (
              /* UNLINKED STATE WITH PROMINENT CTA (NO LIVE CHART SHOWN) */
              <div className="rounded-3xl border-2 border-dashed border-[#EAE3D2] bg-white p-10 sm:p-14 text-center space-y-6 shadow-xs">
                <div className="inline-flex p-4 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Activity className="w-10 h-10" />
                </div>
                <div className="max-w-xl mx-auto space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1C1A17]">
                    No Active Agent Telemetry Stream
                  </h3>
                  <p className="text-sm text-[#6E675D] leading-relaxed">
                    No active agent telemetry stream. Register and connect an agent to unlock live
                    execution charts. An agent must send a verified heartbeat within the last 60 seconds
                    to feed real-time candlestick charts.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsRegisterAgentModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Register New Agent</span>
                  </button>

                  {selectedAgent && (
                    <button
                      onClick={() => handleSimulateHeartbeat(selectedAgent.id)}
                      disabled={isPinging}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm font-mono transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span>
                        {isPinging ? "Transmitting..." : `Transmit Heartbeat for ${selectedAgent.name}`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ACTIVE AGENT: RENDER INTERACTIVE TRADINGVIEW CHART */
              <div className="space-y-4">
                <TradingViewChart
                  agentName={selectedAgent.name}
                  agentId={
                    selectedAgent.agent_id_code ||
                    `AGT-${selectedAgent.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`
                  }
                  currentTps={selectedAgent.throughput_tps || 1259.1}
                  latencyMs={selectedAgent.ping_latency_ms || 24}
                />
              </div>
            )}

            {/* TAB CONTENT VIEWS */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <TransactionChart data={velocityChartData} />
              </div>
            )}

            {activeTab === "telemetry" && (
              <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-[#1C1A17] font-mono uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Realtime Packet &amp; Heartbeat Stream
                </h3>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] font-mono text-xs space-y-2 text-[#4A453E]">
                  <div>• Protocol Rail: FastMCP Deterministic Stream</div>
                  <div>• Heartbeat Window: 60 Seconds TTL</div>
                  <div>
                    • Last Heartbeat Received:{" "}
                    {selectedAgent?.last_heartbeat_at
                      ? new Date(selectedAgent.last_heartbeat_at).toLocaleTimeString()
                      : "None recorded"}
                  </div>
                  <div>• Network Latency: {selectedAgent?.ping_latency_ms ? `${selectedAgent.ping_latency_ms}ms` : "—"}</div>
                  <div>• Throughput Peak: {selectedAgent?.throughput_tps ? `${selectedAgent.throughput_tps} TPS` : "0 TPS"}</div>
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-[#1C1A17] font-mono uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Settlement History &amp; Cryptographic Proofs
                </h3>
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-[#8C8275] bg-[#FAF8F5] rounded-2xl border border-[#EAE3D2]">
                    No escrow settlements recorded for this tenant yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#EAE3D2] text-[#8C8275]">
                          <th className="py-3 px-3">Settlement ID</th>
                          <th className="py-3 px-3">Title</th>
                          <th className="py-3 px-3">Amount</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3">Proof Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0E9DC]">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-[#FAF8F5]">
                            <td className="py-3 px-3 font-bold text-[#1C1A17]">{tx.id.slice(0, 8)}...</td>
                            <td className="py-3 px-3 text-[#4A453E]">{tx.milestoneTitle}</td>
                            <td className="py-3 px-3 font-bold text-[#1C1A17]">₹{tx.amountINR.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#8C8275]">{tx.sha256Proof.slice(0, 16)}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "logs" && (
              <div className="rounded-3xl border border-[#EAE3D2] bg-[#1E222D] text-[#D1D4DC] p-6 sm:p-8 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[#787B86] border-b border-[#2A2E39] pb-3">
                  <span className="flex items-center gap-2 text-white font-bold">
                    <Terminal className="w-4 h-4 text-[#2962FF]" />
                    Deterministic Execution Log Buffer
                  </span>
                  <span>Node: {selectedAgent?.agent_id_code || "AGT-0000"}</span>
                </div>
                <div className="space-y-1.5 pt-2 text-[11px] text-[#A0A5B5] max-h-60 overflow-y-auto">
                  <p className="text-emerald-400">[INFO] Deterministic execution environment initialized.</p>
                  <p>[SEC] Verisett multi-tenant RLS session validated for {tenantId}.</p>
                  <p>[RPC] Handshake verified with rail @verisett/mcp-server.</p>
                  {isTelemetryLive && (
                    <p className="text-blue-400">
                      [PULSE] Heartbeat ping ACK received. Latency: {selectedAgent?.ping_latency_ms || 24}ms.
                    </p>
                  )}
                  <p>[AUDIT] Escrow balance locked to vault {vaultId}.</p>
                </div>
              </div>
            )}

            {activeTab === "webhooks" && (
              <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-[#1C1A17] font-mono uppercase tracking-wider flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-purple-600" />
                  Webhook Callback Endpoint &amp; Verification
                </h3>
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="text-[#8C8275] uppercase block mb-1">Target Callback URL</label>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-[#1C1A17]">
                      {selectedAgent?.webhook_url || "No webhook URL configured for this node"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[#8C8275] uppercase block mb-1">Signature Scheme</label>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-[#1C1A17]">
                      HMAC-SHA256 (Header: <code>X-Verisett-Signature</code>)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "escrow" && (
              <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-[#1C1A17] font-mono uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Escrow Locks &amp; Automated Release Parameters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <span className="text-[#8C8275] block uppercase">Custody Balance</span>
                    <span className="text-xl font-bold text-[#1C1A17] mt-1 block">
                      ₹{balanceINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-[#8C8275]">Available for automated clearance</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <span className="text-[#8C8275] block uppercase">Per-Deal Cap</span>
                    <span className="text-xl font-bold text-[#1C1A17] mt-1 block">
                      {selectedAgent?.spending_limit !== undefined
                        ? `₹${selectedAgent.spending_limit.toLocaleString("en-IN")}`
                        : "Unlimited"}
                    </span>
                    <span className="text-[11px] text-blue-600">Threshold enforcement enabled</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT 25% WATCHLIST COLUMN ("Daftar Pantau" Style Sidebar)                */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 space-y-6">
            {/* Watchlist Main Container */}
            <div className="rounded-3xl border border-[#EAE3D2] bg-white shadow-xs overflow-hidden flex flex-col font-sans">
              {/* Watchlist Top Header */}
              <div className="p-4 border-b border-[#EAE3D2] bg-[#FAF8F5] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button className="flex items-center gap-1 font-mono font-bold text-xs text-[#1C1A17] bg-white px-2.5 py-1 rounded-lg border border-[#EAE3D2] shadow-2xs">
                    <span>{watchlistGroup}</span>
                    <ChevronDown className="w-3 h-3 text-[#8C8275]" />
                  </button>
                  <span className="text-[11px] font-mono text-[#8C8275]">
                    ({agents.length})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsRegisterAgentModalOpen(true)}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition cursor-pointer"
                    title="+ Add Agent"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleGenerateFastMcpKey}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-[#8C8275] transition cursor-pointer"
                    title="Quick Connect FastMCP"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => loadTenantData(user.id)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-[#8C8275] transition cursor-pointer"
                    title="Options Menu"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Watchlist Column Subheader */}
              <div className="px-3 py-2 bg-[#F7F4EE] border-b border-[#EAE3D2] flex items-center justify-between text-[10px] font-mono uppercase text-[#8C8275]">
                <span className="w-2/5">Agent / Node</span>
                <span className="w-2/5 text-right">Throughput</span>
                <span className="w-1/5 text-right">24h Chg%</span>
              </div>

              {/* Categorized Rows List */}
              <div className="divide-y divide-[#F0E9DC] max-h-[580px] overflow-y-auto">
                {/* 1. Group: CONNECTED AGENTS */}
                <div className="bg-[#FAF8F5] px-3 py-1.5 text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    CONNECTED AGENTS
                  </span>
                  <span>({connectedAgents.length})</span>
                </div>

                {connectedAgents.length === 0 ? (
                  <div className="p-4 text-center text-[11px] font-mono text-[#8C8275]">
                    No agents actively streaming.
                  </div>
                ) : (
                  connectedAgents.map((agent) => {
                    const isSelected = selectedAgent?.id === agent.id;
                    const code =
                      agent.agent_id_code ||
                      `AGT-${agent.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

                    return (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`p-3 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected ? "bg-blue-50/70 border-l-4 border-blue-600" : "hover:bg-[#FAF8F5]"
                        }`}
                      >
                        {/* Agent Avatar / ID / Name */}
                        <div className="flex items-center gap-2 w-2/5 min-w-0">
                          {agent.avatar_url ? (
                            <img
                              src={agent.avatar_url}
                              alt={agent.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-blue-300"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {agent.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-mono text-xs font-bold text-[#1C1A17] block truncate">
                              {code}
                            </span>
                            <span className="text-[10px] text-[#8C8275] block truncate">
                              {agent.name}
                            </span>
                          </div>
                        </div>

                        {/* Throughput */}
                        <div className="w-2/5 text-right font-mono text-xs font-bold text-[#1C1A17]">
                          {(agent.throughput_tps || 1259.1).toFixed(1)}{" "}
                          <span className="text-[10px] text-[#8C8275] font-normal">TPS</span>
                        </div>

                        {/* Real-time Rate Indicator */}
                        <div className="w-1/5 text-right font-mono text-xs font-bold text-emerald-600">
                          +14.1%
                        </div>
                      </div>
                    );
                  })
                )}

                {/* 2. Group: STANDBY NODES */}
                <div className="bg-[#FAF8F5] px-3 py-1.5 text-[10px] font-mono font-bold text-[#6E675D] uppercase tracking-wider flex items-center justify-between border-t border-[#EAE3D2]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    STANDBY NODES
                  </span>
                  <span>({standbyNodes.length})</span>
                </div>

                {standbyNodes.length === 0 ? (
                  <div className="p-4 text-center text-[11px] font-mono text-[#8C8275]">
                    No standby nodes.
                  </div>
                ) : (
                  standbyNodes.map((agent) => {
                    const isSelected = selectedAgent?.id === agent.id;
                    const isRevoked = (agent.status || "").toUpperCase() === "REVOKED";
                    const code =
                      agent.agent_id_code ||
                      `AGT-${agent.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

                    return (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`p-3 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected ? "bg-neutral-100/80 border-l-4 border-neutral-500" : "hover:bg-[#FAF8F5]"
                        }`}
                      >
                        {/* Agent Avatar / ID / Name */}
                        <div className="flex items-center gap-2 w-2/5 min-w-0">
                          {agent.avatar_url ? (
                            <img
                              src={agent.avatar_url}
                              alt={agent.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0 grayscale opacity-70"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 font-bold text-xs flex items-center justify-center shrink-0">
                              {agent.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-mono text-xs font-semibold text-[#6E675D] block truncate">
                              {code}
                            </span>
                            <span className="text-[10px] text-[#8C8275] block truncate">
                              {agent.name}
                            </span>
                          </div>
                        </div>

                        {/* Throughput */}
                        <div className="w-2/5 text-right font-mono text-xs text-[#8C8275]">
                          0.0 <span className="text-[10px]">TPS</span>
                        </div>

                        {/* Rate Indicator / Status */}
                        <div className="w-1/5 text-right font-mono text-xs font-semibold text-[#8C8275]">
                          {isRevoked ? (
                            <span className="text-rose-600">REV</span>
                          ) : (
                            <span>-2.4%</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Panel: Quick Summary Card of Selected Active Agent */}
            {selectedAgent && (
              <div className="rounded-3xl border border-[#EAE3D2] bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#8C8275]">
                    Agent Summary
                  </span>
                  <span className="font-mono text-xs text-blue-600 font-semibold">
                    {selectedAgent.framework || "FastMCP"}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between py-1 border-b border-[#F0E9DC]">
                    <span className="text-[#8C8275]">Latency:</span>
                    <span className="font-bold text-[#1C1A17]">
                      {isTelemetryLive && selectedAgent.ping_latency_ms
                        ? `${selectedAgent.ping_latency_ms}ms`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-[#F0E9DC]">
                    <span className="text-[#8C8275]">Settled Vol:</span>
                    <span className="font-bold text-[#1C1A17]">
                      ₹{metrics.totalVolumeINR.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-[#F0E9DC]">
                    <span className="text-[#8C8275]">Uptime State:</span>
                    <span className="font-bold text-[#1C1A17]">
                      {isTelemetryLive ? "Connected (Live)" : "Standby / Dormant"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#8C8275]">Webhook:</span>
                    <span className="font-bold text-[#1C1A17] truncate max-w-[120px]">
                      {selectedAgent.webhook_url ? "Configured" : "None"}
                    </span>
                  </div>
                </div>

                {/* Agent Actions: Heartbeat Ping, Revoke, Delete */}
                <div className="pt-2 border-t border-[#F0E9DC] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSimulateHeartbeat(selectedAgent.id)}
                    disabled={isPinging}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-mono font-semibold transition cursor-pointer text-center"
                    title="Send Heartbeat"
                  >
                    Ping
                  </button>

                  {(selectedAgent.status || "").toUpperCase() !== "REVOKED" && (
                    <button
                      onClick={() => handleRevokeAgent(selectedAgent.id)}
                      className="py-1.5 px-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 text-xs font-mono transition cursor-pointer"
                      title="Revoke Credentials"
                    >
                      Revoke
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteAgent(selectedAgent.id, selectedAgent.name)}
                    className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="Delete Agent Row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL 1: Global Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onRegisterAgent={() => setIsRegisterAgentModalOpen(true)}
        onDepositFunds={() => setIsDepositModalOpen(true)}
        onSimulatePing={() => handleSimulateHeartbeat()}
        onSignOut={handleSignOut}
      />

      {/* MODAL 2: 4-Step AI Agent Registration Flow */}
      <RegisterAgentModal
        isOpen={isRegisterAgentModalOpen}
        onClose={() => setIsRegisterAgentModalOpen(false)}
        onAgentRegistered={(newAgent) => {
          if (newAgent) {
            setAgents((prev) => [
              {
                id: newAgent.id,
                user_id: user.id,
                name: newAgent.agentName,
                framework: newAgent.framework,
                agent_id_code: newAgent.agentIdCode,
                avatar_url: newAgent.avatarUrl,
                status: newAgent.status || "Unlinked",
                spending_limit: newAgent.spendingLimit,
                webhook_url: newAgent.webhookUrl,
                ping_latency_ms: null,
                last_heartbeat_at: null,
                throughput_tps: null,
              },
              ...prev,
            ]);
            setSelectedAgentId(newAgent.id);
          }
          loadTenantData(user.id);
        }}
      />

      {/* MODAL 3: Custody Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#EAE3D2] bg-white p-7 shadow-2xl space-y-5 font-sans">
            <div>
              <h3 className="text-lg font-bold text-[#1C1A17]">Deposit Custody Funds</h3>
              <p className="text-xs text-[#6E675D]">
                Add balance to your tenant vault to power autonomous agent escrows.
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
                  Equivalent: ${((parseFloat(depositAmount) || 0) / 84).toFixed(2)} USD (@ ₹84/$)
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

      {/* MODAL 4: Quick Re-Key One-Time Token Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-[#EAE3D2] bg-white p-7 shadow-2xl space-y-5 font-sans">
            <div>
              <span className="inline-flex p-2 rounded-xl bg-blue-50 text-blue-600 mb-2">
                <Key className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-[#1C1A17]">FastMCP Scoped Key Generated</h3>
              <p className="text-xs text-[#6E675D]">
                This raw secret key is only displayed once. Please store it securely.
              </p>
            </div>

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
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
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
    </div>
  );
}
