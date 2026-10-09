"use client";

import React, { useState } from "react";
import {
  X,
  Bot,
  Key,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Zap,
  Globe,
  DollarSign,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  registerAgentAction,
  RegisterAgentResult,
} from "@/app/actions/registerAgentAction";

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentRegistered?: () => void;
}

const FRAMEWORK_OPTIONS = [
  { value: "FastMCP", label: "FastMCP (Model Context Protocol)", recommended: true },
  { value: "LangGraph", label: "LangGraph (LangChain Workflows)" },
  { value: "CrewAI", label: "CrewAI (Autonomous Swarms)" },
  { value: "AutoGen", label: "AutoGen (Microsoft Multi-Agent)" },
  { value: "Custom REST", label: "Custom REST / Webhook Worker" },
];

export function RegisterAgentModal({
  isOpen,
  onClose,
  onAgentRegistered,
}: RegisterAgentModalProps) {
  // Form State
  const [agentName, setAgentName] = useState("");
  const [framework, setFramework] = useState("FastMCP");
  const [spendingLimit, setSpendingLimit] = useState("50000");
  const [webhookUrl, setWebhookUrl] = useState("");

  // UI / Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterAgentResult | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setAgentName("");
    setFramework("FastMCP");
    setSpendingLimit("50000");
    setWebhookUrl("");
    setErrorMessage(null);
    setResult(null);
    setCopiedKey(false);
    setCopiedSnippet(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = agentName.trim();
    if (!trimmedName) {
      setErrorMessage("Please specify a unique Agent Identifier.");
      return;
    }

    const limitNum = parseFloat(spendingLimit);
    if (isNaN(limitNum) || limitNum < 0) {
      setErrorMessage("Spending cap must be a valid positive number.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerAgentAction({
        agentName: trimmedName,
        framework,
        spendingLimit: limitNum,
        webhookUrl: webhookUrl.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to register agent. Please try again.");
      } else {
        setResult(res);
        if (onAgentRegistered) {
          onAgentRegistered();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = () => {
    if (!result?.apiKey) return;
    navigator.clipboard.writeText(result.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2200);
  };

  const launchSnippet = result?.apiKey
    ? `npx -y @verisett/mcp-server@latest --key=${result.apiKey}`
    : "";

  const handleCopySnippet = () => {
    if (!launchSnippet) return;
    navigator.clipboard.writeText(launchSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#EAE3D2] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#F0E9DC] bg-[#FAF8F5]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1C1A17] tracking-tight">
                {result ? "Agent Credentials Provisioned" : "Register Autonomous Agent"}
              </h3>
              <p className="text-xs text-[#8C8275]">
                {result
                  ? "Secure token generated for clearinghouse consensus"
                  : "Bind programmatic escrow limits and execution credentials"}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-[#8C8275] hover:text-[#1C1A17] hover:bg-neutral-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-7 overflow-y-auto space-y-6">
          {/* SUCCESS SCREEN */}
          {result?.apiKey ? (
            <div className="space-y-6">
              {/* Security Warning Alert */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <p className="font-bold text-amber-950">
                    Important: Copy Your API Secret Key Now
                  </p>
                  <p className="text-amber-800 leading-relaxed text-xs">
                    This raw secret key is displayed only once. It will not be stored
                    in plaintext and cannot be recovered if lost. Store it in a secure
                    environment variable.
                  </p>
                </div>
              </div>

              {/* Generated API Key Card */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#6E675D] font-bold block">
                  Agent Authentication Key
                </label>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 shadow-inner">
                  <span className="font-mono text-xs sm:text-sm text-emerald-400 select-all truncate">
                    {result.apiKey}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Registered Configuration Summary */}
              {result.agent && (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] space-y-3">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#8C8275] font-bold">
                    Provisioned Node Metadata
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#8C8275] block text-[11px]">Identifier</span>
                      <span className="font-bold text-[#1C1A17] font-mono">
                        {result.agent.agentName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C8275] block text-[11px]">Protocol</span>
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[11px] font-mono">
                        {result.agent.framework}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C8275] block text-[11px]">Spending Cap</span>
                      <span className="font-bold text-[#1C1A17] font-mono">
                        ₹{result.agent.spendingLimit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C8275] block text-[11px]">Webhook Endpoint</span>
                      <span className="font-mono text-[#1C1A17] truncate block text-[11px]">
                        {result.agent.webhookUrl || "None (Polling Mode)"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Launch CLI Command Snippet */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#6E675D] font-bold block">
                  Quickstart CLI Integration
                </label>
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs font-mono text-zinc-300">
                  <code className="text-zinc-300 truncate">{launchSnippet}</code>
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="shrink-0 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer"
                    title="Copy command"
                  >
                    {copiedSnippet ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmation Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-sm transition cursor-pointer"
                >
                  I Have Stored My API Key Safely
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION INPUT FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Agent Name / Identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4A453E]">
                  Agent Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. autonomous-settler-node-01"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-semibold text-[#1C1A17] placeholder:text-[#A8A196] transition"
                />
                <p className="text-[11px] text-[#8C8275]">
                  Human-readable alias identifying this agent in consensus ledgers.
                </p>
              </div>

              {/* 2. Protocol / Framework Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4A453E]">
                  Protocol / Framework Architecture <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-semibold text-[#1C1A17] transition appearance-none cursor-pointer"
                  >
                    {FRAMEWORK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8C8275]">
                    ▾
                  </div>
                </div>
                <p className="text-[11px] text-[#8C8275]">
                  Standardizes the communication schema and capability manifest.
                </p>
              </div>

              {/* 3. Spending Cap / Escrow Limit */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4A453E]">
                  Spending Cap / Escrow Limit (INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-[#8C8275]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    placeholder="50000"
                    value={spendingLimit}
                    onChange={(e) => setSpendingLimit(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-mono font-bold text-[#1C1A17] transition"
                  />
                </div>
                <p className="text-[11px] text-[#8C8275]">
                  Maximum cumulative vault balance this agent is authorized to lock or settle.
                </p>
              </div>

              {/* 4. Webhook URL (Optional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4A453E]">
                    Webhook URL (Optional)
                  </label>
                  <span className="text-[10px] font-mono text-[#8C8275]">Optional</span>
                </div>
                <input
                  type="url"
                  placeholder="https://api.yourdomain.com/v1/agent-webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-mono text-[#1C1A17] placeholder:text-[#A8A196] transition"
                />
                <p className="text-[11px] text-[#8C8275]">
                  Receives asynchronous settlement consensus & escrow milestone triggers.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#F0E9DC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#6E675D] hover:text-[#1C1A17] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning Node...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Register &amp; Generate Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
