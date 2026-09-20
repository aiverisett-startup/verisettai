"use client";

import React, { useState } from "react";
import {
  Send,
  Zap,
  CheckCircle2,
  XCircle,
  Terminal,
  Copy,
  Check,
  Loader2,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { TransactionItem } from "@/lib/agentTransactionStorage";

interface AgentLiveTransferConsoleProps {
  onTransferSuccess?: (tx: TransactionItem, newBalance: number) => void;
  availableBalance: number;
  connectedAgentName?: string;
  apiKey?: string;
}

export function AgentLiveTransferConsole({
  onTransferSuccess,
  availableBalance,
  connectedAgentName = "Aiverisett Primary Payer Agent",
  apiKey,
}: AgentLiveTransferConsoleProps) {
  const [mode, setMode] = useState<"TRANSFER" | "DEPOSIT">("TRANSFER");
  const [fromAgent, setFromAgent] = useState(connectedAgentName);
  const [toAgent, setToAgent] = useState("Gemini-Flash-Extractor (Worker)");
  const [amount, setAmount] = useState<number>(2500);
  const [outcome, setOutcome] = useState<"SUCCESSFUL" | "FAILED">("SUCCESSFUL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [activeApiKey, setActiveApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("verisett_api_key") || apiKey || "vrs_live_aiverisettgmailcom89f72b";
    }
    return apiKey || "vrs_live_aiverisettgmailcom89f72b";
  });

  React.useEffect(() => {
    if (apiKey) {
      setActiveApiKey(apiKey);
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("verisett_api_key");
      if (stored) setActiveApiKey(stored);
    }
  }, [apiKey]);

  React.useEffect(() => {
    if (connectedAgentName && connectedAgentName !== "My Autonomous Agent") {
      setFromAgent(connectedAgentName);
    }
  }, [connectedAgentName]);

  const originUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const curlTransfer = `curl -X POST ${originUrl}/api/transfer \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeApiKey}" \\
  -d '{
    "fromAgent": "${fromAgent}",
    "toAgent": "${toAgent}",
    "amount": ${amount},
    "status": "${outcome}"
  }'`;

  const curlDeposit = `curl -X POST ${originUrl}/api/vault/deposit \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeApiKey}" \\
  -d '{
    "agent_name": "${fromAgent}",
    "amount": ${amount}
  }'`;

  const activeCurl = mode === "TRANSFER" ? curlTransfer : curlDeposit;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(activeCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activeApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExecute = async () => {
    if (amount <= 0) return;
    setIsSubmitting(true);

    try {
      if (mode === "DEPOSIT") {
        // 1. Agent Adds Money To Vault
        const res = await fetch("/api/vault/deposit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeApiKey}`,
            "x-api-key": activeApiKey,
          },
          body: JSON.stringify({
            agent_name: fromAgent,
            amount,
            apiKey: activeApiKey,
            milestone: `Vault Liquidity Deposit by ${fromAgent}`,
          }),
        });

        const data = await res.json();
        if (data.success && data.transaction) {
          const timeNow = new Date().toLocaleTimeString();
          setLogs((prev) => [
            `[${timeNow}] 💰 REAL-TIME DEPOSIT: ₹${amount.toLocaleString("en-IN")} added to Vault by '${fromAgent}'. New Vault Balance: ₹${data.newBalance.toLocaleString("en-IN")}. Ref: ${data.transaction.id}`,
            ...prev.slice(0, 4),
          ]);

          if (onTransferSuccess) {
            onTransferSuccess(data.transaction, data.newBalance);
          }
        }
      } else {
        // 2. Transfer Between Agents
        const res = await fetch("/api/transfer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeApiKey}`,
            "x-api-key": activeApiKey,
          },
          body: JSON.stringify({
            fromAgent,
            toAgent,
            amount,
            status: outcome,
            apiKey: activeApiKey,
            milestone: `Autonomous Task: ${fromAgent} -> ${toAgent}`,
          }),
        });

        const data = await res.json();
        if (data.success && data.transaction) {
          const timeNow = new Date().toLocaleTimeString();
          setLogs((prev) => [
            `[${timeNow}] ⚡ HTTP 200 OK — ${outcome === "SUCCESSFUL" ? "SETTLED" : "FAILED"}: ₹${amount.toLocaleString("en-IN")} transferred from '${fromAgent}' to '${toAgent}'. Line graph updated (${outcome === "SUCCESSFUL" ? "+1 Up" : "-1 Down"}). Vault Balance: ₹${data.vaultBalance.available_balance.toLocaleString("en-IN")}`,
            ...prev.slice(0, 4),
          ]);

          if (onTransferSuccess) {
            onTransferSuccess(data.transaction, data.vaultBalance.available_balance);
          }
        }
      }
    } catch (err: any) {
      setLogs((prev) => [`[ERR] Request failed: ${err?.message}`, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)] space-y-6 font-sans">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0E9DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[10px] font-mono text-[#9E7A45] mb-1">
            <Zap className="w-3 h-3 text-[#C59B5F]" />
            <span>FastMCP &amp; REST Gateway Live Dispatcher</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1A17] tracking-tight flex items-center gap-2">
            <span>Live Agent Transaction &amp; Vault Console</span>
          </h2>
          <p className="text-xs text-[#8C8275] mt-0.5">
            Test agent transactions in real time: watch vault money update, 1.5% fee compute, and the line graph move dynamically.
          </p>
        </div>

        {/* Action Toggle (Transfer vs Deposit) */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setMode("TRANSFER")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                mode === "TRANSFER"
                  ? "bg-[#C59B5F] text-white shadow-xs"
                  : "text-[#8C8275] hover:text-[#1C1A17]"
              }`}
            >
              Transfer Funds
            </button>
            <button
              onClick={() => setMode("DEPOSIT")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                mode === "DEPOSIT"
                  ? "bg-[#C59B5F] text-white shadow-xs"
                  : "text-[#8C8275] hover:text-[#1C1A17]"
              }`}
            >
              + Add Money to Vault
            </button>
          </div>

          <button
            onClick={handleCopyCurl}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] hover:bg-white text-xs font-mono text-[#8C8275] hover:text-[#1C1A17] transition cursor-pointer shadow-2xs"
            title="Copy cURL endpoint for your external agent"
          >
            {copiedCurl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied cURL</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-[#9E7A45]" />
                <span>Copy cURL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active API Key Indicator */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#8C8275]">Active Database API Key:</span>
          <span className="text-[#1C1A17] font-semibold">{activeApiKey}</span>
        </div>
        <button
          onClick={handleCopyKey}
          className="inline-flex items-center gap-1 text-[11px] text-[#9E7A45] hover:text-[#C59B5F] font-semibold cursor-pointer transition"
        >
          {copiedKey ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700">Copied Key</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy API Key</span>
            </>
          )}
        </button>
      </div>

      {/* Dynamic Form based on Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Agent Name */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-[#8C8275] uppercase">
            {mode === "DEPOSIT" ? "Depositing Agent Name" : "From Agent (Sender)"}
          </label>
          <input
            type="text"
            value={fromAgent}
            onChange={(e) => setFromAgent(e.target.value)}
            placeholder="Enter your exact agent name..."
            className="w-full rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#1C1A17] focus:border-[#D4AF37] focus:bg-white focus:outline-none transition shadow-2xs font-mono"
          />
        </div>

        {/* Recipient Agent (Only in Transfer Mode) */}
        {mode === "TRANSFER" ? (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-[#8C8275] uppercase">
              To Agent (Recipient)
            </label>
            <input
              type="text"
              value={toAgent}
              onChange={(e) => setToAgent(e.target.value)}
              placeholder="Enter recipient agent name..."
              className="w-full rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#1C1A17] focus:border-[#D4AF37] focus:bg-white focus:outline-none transition shadow-2xs font-mono"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-[#8C8275] uppercase">
              Destination
            </label>
            <div className="w-full rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#9E7A45] font-mono">
              Verisett Vault Storage
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-[#8C8275] uppercase">
            {mode === "DEPOSIT" ? "Deposit Amount (₹)" : "Transfer Amount (₹)"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C8275] font-mono">
              ₹
            </span>
            <input
              type="number"
              min={100}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] pl-7 pr-3 py-2 text-xs font-bold text-[#1C1A17] font-mono focus:border-[#D4AF37] focus:bg-white focus:outline-none transition shadow-2xs"
            />
          </div>
        </div>

        {/* Outcome (Only in Transfer Mode) */}
        {mode === "TRANSFER" ? (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-[#8C8275] uppercase">
              Expected Outcome
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setOutcome("SUCCESSFUL")}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  outcome === "SUCCESSFUL"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs"
                    : "bg-[#FAF8F5] text-[#8C8275] border border-[#EAE3D2]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Success (+1)</span>
              </button>
              <button
                type="button"
                onClick={() => setOutcome("FAILED")}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  outcome === "FAILED"
                    ? "bg-rose-50 text-rose-800 border border-rose-300 shadow-xs"
                    : "bg-[#FAF8F5] text-[#8C8275] border border-[#EAE3D2]"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Fail (-1)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-[#8C8275] uppercase">
              Vault Action
            </label>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800 font-semibold flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Vault Funding (+1)</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Submit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs font-mono text-[#8C8275]">
          {mode === "TRANSFER" ? (
            <>
              1.5% Fee: <strong className="text-[#9E7A45]">₹{Math.round(amount * 0.015).toLocaleString("en-IN")}</strong> • Recipient Net: <strong className="text-emerald-700">₹{(amount - Math.round(amount * 0.015)).toLocaleString("en-IN")}</strong>
            </>
          ) : (
            <>
              Adds <strong className="text-emerald-700">+₹{amount.toLocaleString("en-IN")}</strong> directly to Vault Testnet Balance in real time. Zero deposit fee.
            </>
          )}
        </div>

        <button
          onClick={handleExecute}
          disabled={isSubmitting || amount <= 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] px-6 py-2.5 text-xs font-bold text-white transition shadow-md shadow-[#C59B5F]/20 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Broadcasting Live Action...</span>
            </>
          ) : mode === "DEPOSIT" ? (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Add Money to Vault (Live)</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Transfer Between Agents</span>
            </>
          )}
        </button>
      </div>

      {/* Live Transaction Execution Log */}
      {logs.length > 0 && (
        <div className="rounded-2xl border border-[#EAE3D2] bg-[#1C1A17] p-4 text-[11px] font-mono text-emerald-400 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[#8C8275] border-b border-stone-800 pb-1 text-[10px]">
            <span>LIVE GATEWAY TELEMETRY LOG</span>
            <span>REAL-TIME VAULT SYNC ACTIVE</span>
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="leading-relaxed truncate">
              {log}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
