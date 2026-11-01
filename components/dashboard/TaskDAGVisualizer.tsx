"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Share2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Lock,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import { DAGNode, DAGSummary } from "@/lib/settlement/dagEngine";

export function TaskDAGVisualizer() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dagSummary, setDagSummary] = useState<DAGSummary | null>(null);

  const fetchDAG = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settlement/dag");
      const data = await res.json();
      if (data.success && data.tree) {
        setDagSummary(data.tree);
      }
    } catch (err) {
      console.error("Failed to load DAG tree:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDAG();
  }, []);

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "SETTLED":
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SETTLED
          </span>
        );
      case "VERIFYING":
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/40 text-cyan-400">
            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
            VERIFYING
          </span>
        );
      case "ESCROW_LOCKED":
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-full bg-blue-950/40 border border-blue-500/40 text-blue-400">
            <Lock className="w-3 h-3 text-blue-400" />
            ESCROW LOCKED
          </span>
        );
      case "CHALLENGED":
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-400">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            CHALLENGED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/40 text-slate-400">
            {state}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#09090B] p-6 backdrop-blur-xl relative overflow-hidden transition-all shadow-xl">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/3 w-96 h-24 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-transparent blur-2xl pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-sans tracking-tight">
                Multi-Agent Task Dependency Graph (DAG)
              </h3>
              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                AUTONOMOUS CLEARING
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Downstream subcontractor escrow auto-resolves when upstream parent milestones verify
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dagSummary && (
            <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-slate-400 bg-white/[0.02] border border-white/[0.08] px-3 py-1.5 rounded-lg mr-2">
              <span>
                Total Subcontracted:{" "}
                <span className="text-white font-bold">
                  ₹{(dagSummary.totalEscrowPaise / 100).toLocaleString("en-IN")}
                </span>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                Status:{" "}
                <span className="text-cyan-400 font-bold">
                  {dagSummary.settledNodes}/{dagSummary.totalNodes} Nodes Resolved
                </span>
              </span>
            </div>
          )}

          <button
            onClick={fetchDAG}
            title="Refresh DAG Tree"
            className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>

          <Link
            href="/settlement"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>EXPLORER</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          {loading ? (
            <div className="py-12 flex items-center justify-center font-mono text-xs text-cyan-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>BUILDING_DEPENDENCY_TOPOLOGY...</span>
            </div>
          ) : !dagSummary ? (
            <div className="py-8 text-center font-mono text-xs text-slate-500">
              NO_ACTIVE_DEPENDENCY_TREES_FOUND
            </div>
          ) : (
            <div className="space-y-6">
              {/* Root Parent Task Card */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-xl bg-white/[0.02] hover:bg-white/[0.04] border border-blue-500/30 hover:border-blue-500/50 rounded-xl p-4 backdrop-blur-md transition-all shadow-[0_0_20px_rgba(37,99,235,0.15)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded font-bold">
                        ROOT PARENT TASK
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {dagSummary.rootNode.agreementHash.slice(0, 18)}...
                      </span>
                    </div>
                    {getStatusBadge(dagSummary.rootNode.state)}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[11px]">Primary Worker:</span>
                      <div className="text-slate-200 font-bold">{dagSummary.rootNode.workerAgentId}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[11px]">Escrow Value:</span>
                      <div className="text-white font-bold text-sm">
                        ₹{(dagSummary.rootNode.escrowAmountPaise / 100).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Buyer: {dagSummary.rootNode.buyerAgentId}</span>
                    <Link
                      href={`/settlement/${dagSummary.rootNode.id}`}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Inspect VM</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Connecting Line from Parent to Children */}
                {dagSummary.rootNode.children.length > 0 && (
                  <div className="flex flex-col items-center my-1">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-blue-600/60 via-cyan-500/50 to-cyan-500/80" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  </div>
                )}
              </div>

              {/* Subcontractor Child Nodes Grid */}
              {dagSummary.rootNode.children.length > 0 && (
                <div className="relative">
                  {/* Subtle horizontal connecting beam */}
                  <div className="absolute top-0 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-600/30 via-cyan-500/50 to-blue-600/30" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {dagSummary.rootNode.children.map((child, index) => {
                      const inr = (child.escrowAmountPaise / 100).toLocaleString("en-IN");
                      return (
                        <div
                          key={child.id}
                          className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/40 rounded-xl p-4 backdrop-blur-md transition-all shadow-md relative"
                        >
                          {/* Top connector stem */}
                          <div className="absolute -top-4 left-8 w-0.5 h-4 bg-cyan-500/60" />

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded font-bold">
                                SUBCONTRACTOR #{index + 1}
                              </span>
                              <span className="font-mono text-xs text-slate-400">
                                {child.agreementHash.slice(0, 16)}...
                              </span>
                            </div>
                            {getStatusBadge(child.state)}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono my-2">
                            <div>
                              <span className="text-slate-500 text-[11px]">Worker Node:</span>
                              <div className="text-slate-200 font-bold">{child.workerAgentId}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 text-[11px]">Allocated Escrow:</span>
                              <div className="text-emerald-400 font-bold text-sm">₹{inr}</div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="text-slate-500">
                              Dependency: Auto-clears on parent verification
                            </span>
                            <Link
                              href={`/settlement/${child.id}`}
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              <span>Inspect VM</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
