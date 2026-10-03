"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConnectAgentModal } from "@/components/ConnectAgentModal";
import { LegalConsentModal } from "@/components/LegalConsentModal";
import { VerisettLogo } from "@/components/VerisettLogo";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { AgentTransactionChart } from "@/components/dashboard/AgentTransactionChart";
import { AgentTransactionHistory } from "@/components/dashboard/AgentTransactionHistory";
import {
  TransactionItem,
  getStoredTransactions,
  TX_UPDATE_EVENT,
} from "@/lib/agentTransactionStorage";
import { SettlementWorkspace } from "@/components/dashboard/SettlementWorkspace";
import { ApiKeysSection } from "@/components/dashboard/ApiKeysSection";
import { supabase } from "@/lib/supabase";

interface ProfileData {
  testnet_balance?: number;
  available_balance?: number;
  frozen_balance?: number;
  accepted_terms?: boolean;
  accepted_terms_at?: string;
}

interface VaultData {
  id: string;
  title?: string;
  amount?: number;
  status?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [connectedAgentName, setConnectedAgentName] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>({
    testnet_balance: 169000,
    available_balance: 169000,
    frozen_balance: 0,
    accepted_terms: true,
  });
  const [activeVaults, setActiveVaults] = useState<VaultData[]>([
    {
      id: "VLT-PRIMARY-NODE",
      title: "Primary Autonomous Settlement Vault",
      amount: 169000,
      status: "Active Custody",
    },
  ]);

  useEffect(() => {
    let es: EventSource | null = null;

    try {
      const email = localStorage.getItem("verisett_user_email");
      const name = localStorage.getItem("verisett_user_name");
      const savedAgentName = localStorage.getItem("verisett_connected_agent_name");
      const storedKey = localStorage.getItem("verisett_api_key") || "";

      if (email) setUserEmail(email);
      if (name) setUserName(name);
      if (savedAgentName) {
        setConnectedAgentName(savedAgentName);
        setIsAgentConnected(true);
      }
    } catch {
      // Ignore
    }

    const currentKey =
      (typeof window !== "undefined" ? localStorage.getItem("verisett_api_key") : null) || "";

    // 1. Initial fetch from verisett.db agent endpoint
    const fetchLiveAgentData = async () => {
      try {
        const res = await fetch(`/api/verisett/agent?key=${encodeURIComponent(currentKey)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.agent) {
            const bal = Number(data.agent.balance_cents);
            setProfile((prev) => ({
              ...prev,
              testnet_balance: bal,
              available_balance: bal,
              frozen_balance: Number(data.agent.frozen_cents || 0),
              accepted_terms: true,
            }));
            setConnectedAgentName(data.agent.name);
            setIsAgentConnected(true);
            setActiveVaults([
              {
                id: "VLT-PRIMARY-NODE",
                title: "Primary Autonomous Settlement Vault",
                amount: bal,
                status: "Active Custody",
              },
            ]);
            try {
              localStorage.setItem("verisett_agent_connected", "true");
              localStorage.setItem("verisett_connected_agent_name", data.agent.name);
            } catch {
              // Ignore
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch live agent data:", err);
      }
    };

    // 2. Initial fetch from verisett.db transactions endpoint
    const fetchLiveTransactions = async () => {
      try {
        const res = await fetch("/api/verisett/transactions?limit=50");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.transactions)) {
            setTransactions(data.transactions);
          }
        }
      } catch (err) {
        console.warn("Could not fetch live transactions:", err);
      }
    };

    // 3. Connect to Server-Sent Events stream (/api/verisett/stream)
    const connectSseStream = () => {
      try {
        es = new EventSource(`/api/verisett/stream?key=${encodeURIComponent(currentKey)}`);

        es.addEventListener("update", (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.agent) {
              const bal = Number(data.agent.balance_cents);
              setProfile((prev) => ({
                ...prev,
                testnet_balance: bal,
                available_balance: bal,
                frozen_balance: Number(data.agent.frozen_cents || 0),
                accepted_terms: true,
              }));
              setConnectedAgentName(data.agent.name);
              setIsAgentConnected(true);
              setActiveVaults([
                {
                  id: "VLT-PRIMARY-NODE",
                  title: "Primary Autonomous Settlement Vault",
                  amount: bal,
                  status: "Active Custody",
                },
              ]);
            }
            if (data.transactions && Array.isArray(data.transactions)) {
              setTransactions(data.transactions);
            }
          } catch (e) {
            console.error("Error parsing verisett SSE frame:", e);
          }
        });

        es.onerror = (e) => {
          console.warn("Verisett SSE reconnecting...", e);
        };
      } catch (err) {
        console.warn("Failed to initialize SSE stream:", err);
      }
    };

    fetchLiveAgentData();
    fetchLiveTransactions();
    connectSseStream();

    const handleTxUpdate = () => {
      fetchLiveAgentData();
      fetchLiveTransactions();
    };

    window.addEventListener(TX_UPDATE_EVENT, handleTxUpdate);
    window.addEventListener("storage", handleTxUpdate);

    return () => {
      if (es) {
        es.close();
      }
      window.removeEventListener(TX_UPDATE_EVENT, handleTxUpdate);
      window.removeEventListener("storage", handleTxUpdate);
    };
  }, []);

  const handleResetVault = async () => {
    try {
      const res = await fetch("/api/vault/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => ({
          ...prev,
          testnet_balance: data.vaultBalance.available_balance,
          available_balance: data.vaultBalance.available_balance,
        }));
      }
    } catch {
      // Ignore
    }
  };

  const handleDisconnectAgent = async () => {
    try {
      localStorage.removeItem("verisett_agent_connected");
      localStorage.removeItem("verisett_connected_agent_id");
      localStorage.removeItem("verisett_connected_agent_name");
      setIsAgentConnected(false);
      setConnectedAgentName("Autonomous Agent");
      await fetch("/api/agent/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
    } catch {
      // Ignore
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem("verisett_user_email");
      localStorage.removeItem("verisett_user_name");
      localStorage.removeItem("verisett_user_avatar");
      localStorage.removeItem("verisett_auth_provider");
      localStorage.removeItem("verisett_session_timestamp");
    } catch {
      // Ignore
    }
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen bg-[#FDFCF9] text-[#1C1A17] p-6 md:p-12 font-sans overflow-hidden">
      {/* Background Half Shapes & Animated Arcs */}
      <GoldenBackgroundShapes variant="subtle" density="dense" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Top Navbar Bar */}
        <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-6 flex-wrap gap-4 bg-white/70 backdrop-blur-md rounded-2xl px-6 py-4 shadow-[0_4px_24px_rgba(197,155,95,0.06)]">
          <div className="flex items-center gap-3">
            <VerisettLogo size={32} />
            <span className="rounded-full bg-[#FAF6EE] px-2.5 py-0.5 text-[10px] font-medium text-[#9E7A45] border border-[#EAE3D2] font-mono">
              Testnet Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#EAE3D2] text-xs font-mono text-[#8C8275]">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[#8C8275] hidden sm:inline">Operator:</span>
                <span className="text-[#1C1A17] font-medium truncate max-w-[160px]">
                  {userName || userEmail}
                </span>
              </div>
            )}

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Connect Your Agent
            </button>

            <button
              onClick={handleSignOut}
              title="Sign Out of Verisett Console"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EAE3D2] bg-white hover:bg-[#FAF8F5] text-[#8C8275] hover:text-[#1C1A17] text-xs font-mono transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Executive Overview Banner & Status Metrics Cards */}
        <SettlementWorkspace
          balanceVRS={profile?.testnet_balance ?? "169,000"}
          vaultCount={activeVaults.length}
          isAgentConnected={isAgentConnected}
          connectedAgentName={connectedAgentName}
          onConnectAgent={() => setModalOpen(true)}
          onDisconnectAgent={handleDisconnectAgent}
          onResetVault={handleResetVault}
        />

        {/* 1. Real Working Last Month Line Graph with Volume Histogram */}
        <AgentTransactionChart
          isAgentConnected={isAgentConnected}
          transactions={transactions}
          onConnectAgent={() => setModalOpen(true)}
        />

        {/* 3. PhonePe-Style Detailed Transaction History Ledger */}
        <AgentTransactionHistory
          isAgentConnected={isAgentConnected}
          transactions={transactions}
          onConnectAgent={() => setModalOpen(true)}
        />

        {/* 3. Active Escrow Vaults Section */}
        <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(37,99,235,0.06)] space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0E9DC]">
            <h2 className="text-base sm:text-lg font-bold text-[#1C1A17] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span>Active Escrow Vault Deployments</span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-mono text-emerald-800 font-semibold">
                {activeVaults.length} Active
              </span>
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer font-mono px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-400 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Deploy Vault Node
            </button>
          </div>

          <div className="space-y-3">
            {activeVaults.map((vault) => (
              <div
                key={vault.id}
                className="p-4 sm:p-5 rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5]/60 hover:bg-white hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1C1A17] bg-white px-2 py-0.5 rounded-md border border-[#EAE3D2]">
                      {vault.id}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {vault.status || "Active Custody"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#1C1A17]">
                    {vault.title || "Primary Autonomous Settlement Vault"}
                  </p>
                  <p className="text-[11px] font-mono text-[#8C8275]">
                    Agent: <strong className="text-blue-600 font-medium">{connectedAgentName || "Autonomous Clearinghouse Node"}</strong> • Verisett Settlement Engine (MCP / FastMCP) • 1.5% Testnet Fee Rail
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-mono text-base sm:text-lg font-bold text-blue-600">
                    ${((vault.amount ?? profile?.testnet_balance ?? 169000) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                  <span className="block text-[10px] font-mono text-[#8C8275]">
                    Deterministic Invariant Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Cryptographic API Key Management Section */}
        <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)]">
          <ApiKeysSection />
        </div>
      </div>

      {/* Connection Modal */}
      <ConnectAgentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnected={(name) => {
          setIsAgentConnected(true);
          if (name) {
            setConnectedAgentName(name);
            try {
              localStorage.setItem("verisett_connected_agent_name", name);
            } catch {
              // Ignore
            }
          }
          localStorage.setItem("verisett_agent_connected", "true");
        }}
      />

      {/* Mandatory Privacy & Terms Gating Rail */}
      <LegalConsentModal
        isOpen={isConsentModalOpen}
        user={currentUser}
        onConsentSuccess={async () => {
          setIsConsentModalOpen(false);
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              const { data: profileRes } = await supabase
                .from("profiles")
                .select("testnet_balance, available_balance, frozen_balance, accepted_terms")
                .eq("id", session.user.id)
                .maybeSingle();

              if (profileRes) {
                setProfile({
                  ...profileRes,
                  accepted_terms: true,
                  testnet_balance: profileRes.testnet_balance ?? 10000,
                });
              } else {
                setProfile({ accepted_terms: true, testnet_balance: 10000 });
              }
            } else {
              setProfile({ accepted_terms: true, testnet_balance: 10000 });
            }
          } catch {
            setProfile({ accepted_terms: true, testnet_balance: 10000 });
          }
        }}
      />
    </div>
  );
}
