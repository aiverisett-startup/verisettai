"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Key,
  PlusCircle,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import { EnvironmentMode, VaultBalance } from "./types";
import { useAuthUser } from "@/lib/useAuthUser";

interface GlobalNavProps {
  envMode: EnvironmentMode;
  onToggleEnv: (mode: EnvironmentMode) => void;
  vaultBalance: VaultBalance;
  onOpenDepositModal: () => void;
}

export const GlobalNav: React.FC<GlobalNavProps> = ({
  envMode,
  onToggleEnv,
  vaultBalance,
  onOpenDepositModal,
}) => {
  const { user } = useAuthUser();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const userKeySeed = user
    ? (user.id || user.email || "session").replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)
    : "";
  const activeApiKey = user
    ? `vst_${envMode === "sandbox" ? "test" : "live"}_${userKeySeed.padEnd(24, "8f92b4198ec01289ab7e4209")}`
    : `vst_${envMode === "sandbox" ? "test" : "live"}_••••••••••••••••••••••••`;

  const handleCopyKey = () => {
    if (!user) {
      alert("Authentication Required: You must be logged in to copy API keys.");
      return;
    }
    navigator.clipboard.writeText(activeApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#1E2230] bg-[#090A0F]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Clearinghouse Mark */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981]/20 via-[#090A0F] to-[#06B6D4]/20 border border-[#10B981]/40 shadow-lg shadow-[#10B981]/10">
                <ShieldCheck className="h-5 w-5 text-[#10B981]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-[#090A0F]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-white">
                    VERISETT<span className="text-[#10B981]">.AI</span>
                  </span>
                  <span className="rounded-md border border-[#1E2230] bg-[#11131A] px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-slate-400">
                    SETTLEMENT CORE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Autonomous Agent Clearinghouse
                </p>
              </div>
            </div>

            {/* Environment Toggle Switcher */}
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-[#1E2230] bg-[#0D0F15] p-1 ml-4">
              <button
                onClick={() => onToggleEnv("sandbox")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  envMode === "sandbox"
                    ? "bg-[#161922] text-[#F59E0B] border border-[#F59E0B]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    envMode === "sandbox" ? "bg-[#F59E0B] animate-pulse" : "bg-slate-500"
                  }`}
                />
                Sandbox
              </button>
              <button
                onClick={() => onToggleEnv("mainnet")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  envMode === "mainnet"
                    ? "bg-[#161922] text-[#10B981] border border-[#10B981]/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    envMode === "mainnet" ? "bg-[#10B981] animate-pulse" : "bg-slate-500"
                  }`}
                />
                Mainnet
              </button>
            </div>
          </div>

          {/* Right Section: Vault Balance Pill & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Vault Balance Pill */}
            <div className="flex items-center rounded-xl border border-[#1E2230] bg-[#11131A] px-3 py-1.5 text-xs shadow-inner">
              <div className="flex flex-col pr-3 border-r border-[#1E2230]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Available
                </span>
                <span className="font-semibold text-[#10B981] font-mono">
                  ${(vaultBalance.available_cents / 100).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex flex-col px-3 border-r border-[#1E2230] hidden md:flex">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5 text-[#F59E0B]" />
                  Frozen
                </span>
                <span className="font-semibold text-[#F59E0B] font-mono">
                  ${(vaultBalance.frozen_cents / 100).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex flex-col pl-3 hidden lg:flex">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                  Custody
                </span>
                <span className="font-semibold text-slate-300 font-mono">
                  ${(vaultBalance.total_custody_cents / 100).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Quick Deposit USDC Button */}
            <button
              onClick={onOpenDepositModal}
              className="flex items-center gap-1.5 rounded-lg border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-1.5 text-xs font-semibold text-[#10B981] hover:bg-[#10B981]/20 hover:border-[#10B981] transition-all shadow-sm shadow-[#10B981]/10 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Deposit USDC</span>
            </button>

            {/* API Key Modal Trigger */}
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#1E2230] bg-[#161922] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-600 hover:text-white transition-all cursor-pointer"
            >
              <Key className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">API Key</span>
            </button>
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1E2230] bg-[#11131A] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2230]">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#10B981]" />
                <h3 className="font-semibold text-white">Agent Credentials</h3>
              </div>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Use this bearer token to authorize autonomous agent interactions with the
                Verisett Gateway REST API or FastMCP server tools.
              </p>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Active {envMode.toUpperCase()} API Key
                </label>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-[#1E2230] bg-[#090A0F] px-3 py-2">
                  <span className="font-mono text-xs text-emerald-400 truncate pr-2">
                    {activeApiKey}
                  </span>
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center gap-1 rounded bg-[#1E2230] px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white cursor-pointer"
                    title={!user ? "Login required to copy" : "Copy API Key"}
                  >
                    {!user ? (
                      <>
                        <Lock className="h-3 w-3 text-amber-400" />
                        <span>Login to Copy</span>
                      </>
                    ) : copiedKey ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-[#1E2230] bg-[#0D0F15] p-3 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>FastMCP Service:</span>
                  <span className="font-mono text-slate-200">FastMCP(&quot;Verisett Gateway&quot;)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Settlement Take-Rate:</span>
                  <span className="font-mono text-emerald-400">1.5% Programmatic</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Row Isolation:</span>
                  <span className="font-mono text-slate-200">SELECT ... FOR UPDATE</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="rounded-lg bg-[#1E2230] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
