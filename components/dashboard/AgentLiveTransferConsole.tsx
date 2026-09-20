"use client";

import React, { useState } from "react";
import {
  Send,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { TransactionItem } from "@/lib/agentTransactionStorage";

interface AgentLiveTransferConsoleProps {
  onTransferSuccess?: (tx: TransactionItem, newBalance: number) => void;
  availableBalance: number;
}

export function AgentLiveTransferConsole({
  onTransferSuccess,
  availableBalance,
}: AgentLiveTransferConsoleProps) {
  const [fromAgent, setFromAgent] = useState("Google Antigravity Agent #1");
  const [toAgent, setToAgent] = useState("Google Antigravity Agent #2");
  const [amount, setAmount] = useState<number>(2500);
  const [outcome, setOutcome] = useState<"SUCCESSFUL" | "FAILED">("SUCCESSFUL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const curlSnippet = `curl -X POST ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/transfer \\
  -H "Content-Type: application/json" \\
  -d '{
    "fromAgent": "${fromAgent}",
    "toAgent": "${toAgent}",
    "amount": ${amount},
    "status": "${outcome}"
  }'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleExecuteTransfer = async () => {
    if (amount <= 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAgent,
          toAgent,
          amount,
          status: outcome,
          milestone: `Autonomous Task: ${fromAgent} -> ${toAgent}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        const timeNow = new Date().toLocaleTimeString();
        setLogs((prev) => [
          `[${timeNow}] ⚡ HTTP 200 OK — ${outcome === "SUCCESSFUL" ? "SETTLED" : "FAILED"}: ₹${amount.toLocaleString()} transferred. Line graph updated (${outcome === "SUCCESSFUL" ? "+1 Step Up" : "-1 Step Down"}). Vault Balance: ₹${data.vaultBalance.available_balance.toLocaleString()}`,
          ...prev.slice(0, 4),
        ]);

        if (onTransferSuccess) {
          onTransferSuccess(data.transaction, data.vaultBalance.available_balance);
        }
      }
    } catch (err: any) {
      setLogs((prev) => [`[ERR] Failed to execute transfer: ${err?.message}`, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)] space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0E9DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[10px] font-mono text-[#9E7A45] mb-1">
            <Zap className="w-3 h-3 text-[#C59B5F]" />
            <span>FastMCP &amp; REST Gateway Live Dispatcher</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1A17] tracking-tight flex items-center gap-2">
            <span>Agent-to-Agent Live Transfer Console</span>
          </h2>
          <p className="text-xs text-[#8C8275] mt-0.5">
            Test transfer between Google Antigravity agents in real time: watch vault money deduct, 1.5% fee collect, and the line graph dynamically adjust.
          </p>
        </div>

        {/* Copy cURL for Antigravity Agents */}
        <button
          onClick={handleCopyCurl}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] hover:bg-white text-xs font-mono text-[#8C8275] hover:text-[#1C1A17] transition cursor-pointer shadow-2xs"
          title="Copy cURL endpoint for external agents"
        >
          {copiedCurl ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">cURL Copied</span>
            </>
          ) : (
            <>
              <Terminal className="w-3.5 h-3.5 text-[#9E7A45]" />
              <span>Copy Agent cURL API</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Transfer Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From Agent */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-[#8C8275] uppercase">
            From Agent (Sender)
          </label>
          <input
            type="text"
            value={fromAgent}
            onChange={(e) => setFromAgent(e.target.value)}
            className="w-full rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#1C1A17] focus:border-[#D4AF37] focus:bg-white focus:outline-none transition shadow-2xs font-mono"
          />
        </div>

        {/* To Agent */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-[#8C8275] uppercase">
            To Agent (Recipient)
          </label>
          <input
            type="text"
            value={toAgent}
            onChange={(e) => setToAgent(e.target.value)}
            className="w-full rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#1C1A17] focus:border-[#D4AF37] focus:bg-white focus:outline-none transition shadow-2xs font-mono"
          />
        </div>

        {/* Amount in INR */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-[#8C8275] uppercase">
            Transfer Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C8275] font-mono">
              ₹
            </span>
            <input
              type="number"
              min={100}
              max={availableBalance}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] pl-7 pr-3 py-2 text-xs font-bold text-[#1C1A17] font-mono focus:border-[#D4AF37] focus:bg-white focus:outline-none transition shadow-2xs"
            />
          </div>
        </div>

        {/* Outcome Selector */}
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
      </div>

      {/* Action Buttons & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs font-mono text-[#8C8275]">
          1.5% Fee: <strong className="text-[#9E7A45]">₹{Math.round(amount * 0.015).toLocaleString("en-IN")}</strong> • Recipient Net: <strong className="text-emerald-700">₹{(amount - Math.round(amount * 0.015)).toLocaleString("en-IN")}</strong>
        </div>

        <button
          onClick={handleExecuteTransfer}
          disabled={isSubmitting || amount <= 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] px-6 py-2.5 text-xs font-bold text-white transition shadow-md shadow-[#C59B5F]/20 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Broadcasting FastMCP Transfer...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Live Transfer to Agents</span>
            </>
          )}
        </button>
      </div>

      {/* Live Transaction Execution Log */}
      {logs.length > 0 && (
        <div className="rounded-2xl border border-[#EAE3D2] bg-[#1C1A17] p-4 text-[11px] font-mono text-emerald-400 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[#8C8275] border-b border-stone-800 pb-1 text-[10px]">
            <span>LIVE GATEWAY TELEMETRY LOG</span>
            <span>REAL-TIME SETTLEMENT ACTIVE</span>
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
