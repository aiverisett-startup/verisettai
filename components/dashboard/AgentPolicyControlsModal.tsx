"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Sliders,
  X,
  Check,
  Loader2,
  DollarSign,
  Lock,
  Plus,
  ShieldCheck,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName?: string;
  onPolicyUpdated?: () => void;
}

export function AgentPolicyControlsModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  onPolicyUpdated,
}: Props) {
  const [maxPerTxInr, setMaxPerTxInr] = useState<number>(5000);
  const [dailyLimitInr, setDailyLimitInr] = useState<number>(50000);
  const [allowedNodes, setAllowedNodes] = useState<string[]>([
    "agent-deepseek-code-v3",
    "subcontractor-vector-search",
  ]);
  const [tagInput, setTagInput] = useState("");
  const [requireProof, setRequireProof] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen || !agentId) return;

    async function loadPolicy() {
      setLoading(true);
      try {
        const res = await fetch(`/api/agent/policy?agentId=${encodeURIComponent(agentId)}`);
        const data = await res.json();
        if (data.success && data.policy) {
          setMaxPerTxInr(data.policy.maxPerTxSpend / 100);
          setDailyLimitInr(data.policy.dailySpendLimit / 100);
          setAllowedNodes(data.policy.allowedNodes || []);
          setRequireProof(data.policy.requireProof !== false);
        }
      } catch (err) {
        console.error("Failed to load agent policy:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicy();
  }, [isOpen, agentId]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !allowedNodes.includes(trimmed)) {
      setAllowedNodes([...allowedNodes, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setAllowedNodes(allowedNodes.filter((t) => t !== tag));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/agent/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          maxPerTxSpend: Math.round(maxPerTxInr * 100),
          dailySpendLimit: Math.round(dailyLimitInr * 100),
          allowedNodes,
          requireProof,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        if (onPolicyUpdated) onPolicyUpdated();
        setTimeout(() => {
          setSaved(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to save policy:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#09090B] border border-white/[0.08] rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-1/4 w-72 h-20 bg-blue-600/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Economic Guardrails &amp; Policy Controls
              </h3>
              <p className="text-[11px] font-mono text-cyan-400">
                AGENT: {agentName || agentId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center font-mono text-xs text-cyan-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>LOADING_ECONOMIC_POLICY...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 font-mono text-xs">
            {/* 1. Max Single Task Spend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold uppercase tracking-wider">
                  Max Single Task Spend (Cap)
                </label>
                <span className="text-cyan-400 font-bold">
                  ₹{maxPerTxInr.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={maxPerTxInr}
                onChange={(e) => setMaxPerTxInr(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Manual Amount (₹):</span>
                <input
                  type="number"
                  value={maxPerTxInr}
                  onChange={(e) => setMaxPerTxInr(Math.max(0, Number(e.target.value)))}
                  className="bg-white/[0.02] border border-white/[0.08] focus:border-blue-500/50 text-slate-100 font-mono text-xs rounded-lg px-3 py-2 w-32 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Escrow locks above this limit will be automatically rejected by the settlement state machine.
              </p>
            </div>

            {/* 2. 24h Daily Cumulative Cap */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold uppercase tracking-wider">
                  24h Cumulative Daily Spend Limit
                </label>
                <span className="text-emerald-400 font-bold">
                  ₹{dailyLimitInr.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="250000"
                step="2000"
                value={dailyLimitInr}
                onChange={(e) => setDailyLimitInr(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Manual Amount (₹):</span>
                <input
                  type="number"
                  value={dailyLimitInr}
                  onChange={(e) => setDailyLimitInr(Math.max(0, Number(e.target.value)))}
                  className="bg-white/[0.02] border border-white/[0.08] focus:border-blue-500/50 text-slate-100 font-mono text-xs rounded-lg px-3 py-2 w-32 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Total aggregate volume across all active settlement state machines in a rolling 24-hour window.
              </p>
            </div>

            {/* 3. Node Whitelist Tags */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <label className="text-slate-300 font-bold uppercase tracking-wider block">
                Authorized Counterparty Nodes (Whitelist)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {allowedNodes.length === 0 ? (
                  <span className="text-slate-500 text-[11px]">No restriction (all verified nodes permitted)</span>
                ) : (
                  allowedNodes.map((node) => (
                    <span
                      key={node}
                      className="inline-flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 px-2 py-0.5 rounded text-[11px]"
                    >
                      <span>{node}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(node)}
                        className="text-slate-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. subcontractor-vector-search"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="bg-white/[0.02] border border-white/[0.08] focus:border-blue-500/50 text-slate-100 font-mono text-xs rounded-lg px-3 py-2 flex-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>ADD</span>
                </button>
              </div>
            </div>

            {/* 4. Require Cryptographic Proof Verification */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Enforce Cryptographic Proof</span>
                <span className="text-[11px] text-slate-500">
                  Block zero-proof or non-attested settlements
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireProof}
                onChange={(e) => setRequireProof(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saved ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{saved ? "GUARDRAILS_SAVED" : "APPLY_POLICY_RULES"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
