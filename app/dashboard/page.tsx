"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, ExternalLink, Activity, ArrowRight, LogOut, User, Sparkles, CheckCircle2, Zap, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConnectAgentModal } from "@/components/ConnectAgentModal";
import { LegalConsentModal } from "@/components/LegalConsentModal";
import { VerisettLogo } from "@/components/VerisettLogo";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { AgentTransactionChart } from "@/components/dashboard/AgentTransactionChart";
import { AgentTransactionHistory } from "@/components/dashboard/AgentTransactionHistory";
import { AgentLiveTransferConsole } from "@/components/dashboard/AgentLiveTransferConsole";
import {
  TransactionItem,
  getStoredTransactions,
  createAgentEscrowTransaction,
  TX_UPDATE_EVENT,
} from "@/lib/agentTransactionStorage";
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
  const [connectedAgentName, setConnectedAgentName] = useState<string>("Autonomous Agent");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeVaults, setActiveVaults] = useState<VaultData[]>([]);

  useEffect(() => {
    try {
      const email = localStorage.getItem("verisett_user_email");
      const name = localStorage.getItem("verisett_user_name");
      const connected = localStorage.getItem("verisett_agent_connected") === "true";
      const savedAgentName = localStorage.getItem("verisett_connected_agent_name");
      if (email) setUserEmail(email);
      if (name) setUserName(name);
      if (connected) setIsAgentConnected(true);
      if (savedAgentName) setConnectedAgentName(savedAgentName);
    } catch {
      // Ignore
    }

    const fetchLiveUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser({ id: session.user.id, email: session.user.email ?? undefined });
          const { data: profileRes } = await supabase
            .from("profiles")
            .select("testnet_balance, available_balance, frozen_balance, accepted_terms, accepted_terms_at")
            .eq("id", session.user.id)
            .maybeSingle();

          const localConsent = localStorage.getItem("verisett_accepted_terms") === "true";
          const hasAccepted = profileRes?.accepted_terms === true || localConsent;

          if (!hasAccepted) {
            setIsConsentModalOpen(true);
            setProfile({
              accepted_terms: false,
              testnet_balance: 0,
              available_balance: 0,
              frozen_balance: 0,
            });
          } else {
            setIsConsentModalOpen(false);
            if (profileRes) {
              setProfile({
                ...profileRes,
                accepted_terms: true,
                testnet_balance: profileRes.testnet_balance ?? 10000,
              });
            } else {
              setProfile({ accepted_terms: true, testnet_balance: 10000 });
            }
          }

          const { data: vaultsRes } = await supabase
            .from("contracts")
            .select("id, title, amount, status")
            .eq("user_id", session.user.id)
            .eq("status", "active");

          if (vaultsRes) {
            setActiveVaults(vaultsRes);
          }
        } else {
          const localConsent = localStorage.getItem("verisett_accepted_terms") === "true";
          if (!localConsent) {
            setIsConsentModalOpen(true);
            setProfile({ accepted_terms: false, testnet_balance: 0 });
          } else {
            setIsConsentModalOpen(false);
            setProfile({ accepted_terms: true, testnet_balance: 10000 });
          }
        }
      } catch {
        const localConsent = localStorage.getItem("verisett_accepted_terms") === "true";
        setIsConsentModalOpen(!localConsent);
        setProfile({ accepted_terms: localConsent, testnet_balance: localConsent ? 10000 : 0 });
      }
    };

    // Real-time server sync polling every 1.5s
    const syncServerState = async () => {
      try {
        const res = await fetch("/api/transfer");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.transactions && Array.isArray(data.transactions)) {
              setTransactions(data.transactions);
            }
            if (data.vaultBalance && data.vaultBalance.available_balance !== undefined) {
              setProfile((prev) => ({
                ...prev,
                testnet_balance: data.vaultBalance.available_balance,
                available_balance: data.vaultBalance.available_balance,
              }));
            }
            if (data.isAgentConnected !== undefined) {
              setIsAgentConnected(Boolean(data.isAgentConnected));
            }
            if (data.connectedAgentName) {
              setConnectedAgentName(data.connectedAgentName);
              try {
                localStorage.setItem("verisett_connected_agent_name", data.connectedAgentName);
              } catch {
                // Ignore
              }
            }
          }
        }
      } catch {
        // Ignore network hiccups
      }
    };

    syncServerState();
    const pollInterval = setInterval(syncServerState, 1500);

    const handleTxUpdate = () => {
      syncServerState();
    };

    window.addEventListener(TX_UPDATE_EVENT, handleTxUpdate);
    window.addEventListener("storage", handleTxUpdate);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener(TX_UPDATE_EVENT, handleTxUpdate);
      window.removeEventListener("storage", handleTxUpdate);
    };
  }, []);

  const handleExecuteTestSettlement = async (isSuccess: boolean = true) => {
    const sender =
      connectedAgentName && connectedAgentName !== "Autonomous Agent"
        ? connectedAgentName
        : userName
        ? `${userName}'s Agent`
        : "Autonomous Agent A";
    const receiver = "Counterparty Agent Node";

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAgent: sender,
          toAgent: receiver,
          amount: 2500,
          status: isSuccess ? "SUCCESSFUL" : "FAILED",
          milestone: "Autonomous Milestone Escrow Verification",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        if (data.vaultBalance) {
          setProfile((prev) => ({
            ...prev,
            testnet_balance: data.vaultBalance.available_balance,
            available_balance: data.vaultBalance.available_balance,
          }));
        }
        setIsAgentConnected(true);
      }
    } catch {
      // Fallback
      const newTx = createAgentEscrowTransaction({
        amountINR: 2500,
        isSuccess,
        payerName: sender,
        workerName: receiver,
        milestone: "Autonomous Milestone Escrow Verification",
      });
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

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
        setTransactions([]);
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
                <span className="w-2 h-2 rounded-full bg-[#C59B5F] animate-pulse" />
                <span className="text-[#8C8275] hidden sm:inline">Operator:</span>
                <span className="text-[#1C1A17] font-medium truncate max-w-[160px]">
                  {userName || userEmail}
                </span>
              </div>
            )}

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-[#C59B5F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B38A4F] transition shadow-md shadow-[#C59B5F]/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Connect Your Agent
            </button>

            <button
              onClick={handleSignOut}
              title="Sign Out of Verisett Console"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EAE3D2] bg-white hover:bg-[#FAF8F5] text-[#8C8275] hover:text-[#1C1A17] text-xs font-mono transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#9E7A45]" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Executive Overview Banner with Half-shape Accents */}
        <div className="relative rounded-3xl border border-[#EAE3D2] bg-white/90 backdrop-blur-md p-6 md:p-8 shadow-[0_8px_32px_rgba(197,155,95,0.08)] overflow-hidden">
          {/* Decorative Corner Half-Shape */}
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <path d="M100 0 C 100 55.2, 55.2 100, 0 100 L 100 100 Z" fill="url(#bannerGoldGrad)" />
              <circle cx="100" cy="0" r="80" stroke="#C59B5F" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="100" cy="0" r="50" stroke="#D4AF37" strokeWidth="1.5" />
              <defs>
                <linearGradient id="bannerGoldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D4AF37" stopOpacity="0.08" />
                  <stop stopColor="#C59B5F" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[10px] font-mono text-[#9E7A45]">
                <Sparkles className="w-3 h-3 text-[#C59B5F]" /> Enterprise Clearinghouse
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1C1A17] tracking-tight">Settlement Workspace</h1>
              <p className="text-sm text-[#8C8275] leading-relaxed">
                Verisett coordinates programmatic verification and software-defined escrow for autonomous AI workflows. 
                Lock transaction value, set deterministic release rules, and disburse upon passing verification.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#9E7A45] hover:text-[#C59B5F] transition cursor-pointer self-start md:self-auto px-4 py-2 rounded-xl bg-[#FAF6EE] border border-[#EAE3D2]"
            >
              Configure Protocol Gateways <ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="group relative rounded-2xl border border-[#EAE3D2] bg-white p-6 shadow-[0_4px_20px_rgba(197,155,95,0.06)] hover:border-[#C59B5F]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8C8275] uppercase tracking-wider font-mono">Vault Testnet Balance</span>
              <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-[#1C1A17] font-mono">
                {profile?.testnet_balance !== undefined ? profile.testnet_balance.toLocaleString() : "10,000"} VRS
              </p>
              <button
                onClick={handleResetVault}
                title="Reset vault balance to 10,000 VRS"
                className="text-[10px] font-mono text-[#8C8275] hover:text-[#9E7A45] underline cursor-pointer"
              >
                Reset Balance
              </button>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#9E7A45]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C59B5F]" />
              Deterministic Escrow Active
            </div>
          </div>

          <div className="group relative rounded-2xl border border-[#EAE3D2] bg-white p-6 shadow-[0_4px_20px_rgba(197,155,95,0.06)] hover:border-[#C59B5F]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8C8275] uppercase tracking-wider font-mono">Pending Settlements</span>
              <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45]">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#1C1A17] mt-3 font-mono">
              {activeVaults.length} Vaults
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#8C8275]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C8275]" />
              Zero active disputes
            </div>
          </div>

          <div className="group relative rounded-2xl border border-[#EAE3D2] bg-white p-6 shadow-[0_4px_20px_rgba(197,155,95,0.06)] hover:border-[#C59B5F]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8C8275] uppercase tracking-wider font-mono">Agent Handshake Status</span>
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                isAgentConnected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-[#FAF6EE] border-[#EAE3D2] text-[#C59B5F]"
              }`}>
                {isAgentConnected ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#C59B5F] animate-ping" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div>
                <p className={`text-2xl sm:text-3xl font-bold ${isAgentConnected ? "text-emerald-700" : "text-[#9E7A45]"}`}>
                  {isAgentConnected ? "Connected" : "Standby"}
                </p>
                {isAgentConnected && (
                  <p className="text-xs font-semibold text-[#1C1A17] mt-0.5 font-mono truncate max-w-[210px]" title={connectedAgentName}>
                    {connectedAgentName}
                  </p>
                )}
              </div>
              {isAgentConnected ? (
                <button
                  onClick={handleDisconnectAgent}
                  className="text-[10px] font-mono text-[#8C8275] hover:text-rose-600 underline cursor-pointer"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-[10px] font-mono text-[#9E7A45] hover:text-[#C59B5F] font-semibold underline cursor-pointer"
                >
                  Connect Agent
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-[#8C8275]">
              <span className={`w-1.5 h-1.5 rounded-full ${isAgentConnected ? "bg-emerald-500" : "bg-[#C59B5F]"}`} />
              {isAgentConnected ? `FastMCP Active` : "Waiting for gateway handshake"}
            </div>
          </div>
        </div>

        {/* 1. Live Agent-to-Agent Transfer Console (FastMCP & REST) */}
        <AgentLiveTransferConsole
          availableBalance={profile?.testnet_balance ?? 10000}
          connectedAgentName={connectedAgentName}
          onTransferSuccess={(tx, newBal) => {
            setTransactions((prev) => [tx, ...prev]);
            setProfile((prev) => ({
              ...prev,
              testnet_balance: newBal,
              available_balance: newBal,
            }));
            setIsAgentConnected(true);
          }}
        />

        {/* 2. Real Working Last Month Line Graph with Volume Histogram */}
        <AgentTransactionChart
          isAgentConnected={isAgentConnected}
          transactions={transactions}
          onConnectAgent={() => setModalOpen(true)}
          onExecuteTestSettlement={handleExecuteTestSettlement}
        />

        {/* 3. PhonePe-Style Detailed Transaction History Ledger */}
        <AgentTransactionHistory
          isAgentConnected={isAgentConnected}
          transactions={transactions}
          onConnectAgent={() => setModalOpen(true)}
          onExecuteTestSettlement={handleExecuteTestSettlement}
        />

        {/* 3. Active Escrow Vaults Section */}
        <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)] space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0E9DC]">
            <h2 className="text-base sm:text-lg font-bold text-[#1C1A17] flex items-center gap-2">
              <span>Active Escrow Vaults</span>
              <span className="rounded-full bg-[#FAF6EE] border border-[#EAE3D2] px-2.5 py-0.5 text-xs font-mono text-[#9E7A45]">
                {activeVaults.length} Active
              </span>
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-semibold text-[#9E7A45] hover:text-[#C59B5F] flex items-center gap-1 cursor-pointer font-mono"
            >
              <Plus className="w-3.5 h-3.5" /> Deploy Vault
            </button>
          </div>

          {activeVaults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#EAE3D2] bg-[#FAF8F5]/60 p-8 text-center">
              <p className="text-xs text-[#8C8275] font-mono">No active escrow vaults deployed.</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-[#FAF6EE] border border-[#C59B5F]/30 text-[#9E7A45] hover:text-[#C59B5F] hover:bg-[#FAF6EE]/80 text-xs font-mono font-medium transition cursor-pointer"
              >
                + Deploy First Agent Vault
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeVaults.map((vault) => (
                <div
                  key={vault.id}
                  className="p-4 rounded-xl border border-[#EAE3D2] bg-white hover:border-[#C59B5F]/40 transition flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-semibold text-[#1C1A17]">{vault.id}</span>
                    <p className="text-xs text-[#8C8275]">{vault.title || "Autonomous Escrow Vault"}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-[#9E7A45]">
                      {vault.amount ? vault.amount.toLocaleString() : "0.00"} VRS
                    </span>
                    <span className="block text-[10px] font-mono text-emerald-700 font-semibold uppercase">
                      {vault.status || "Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
