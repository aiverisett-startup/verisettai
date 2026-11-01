"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Lock,
  Layers,
  Search,
} from "lucide-react";
import { SettlementAgreement } from "@/lib/settlement/types";

export default function SettlementIndexPage() {
  const [agreements, setAgreements] = useState<SettlementAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/settlement");
        const data = await res.json();
        if (data.success) {
          setAgreements(data.agreements || []);
        }
      } catch (err) {
        console.error("Failed to load settlements:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = agreements.filter((agr) => {
    if (filter !== "ALL" && agr.state !== filter) return false;
    if (
      search &&
      !agr.agreementHash.toLowerCase().includes(search.toLowerCase()) &&
      !agr.buyerAgentId.toLowerCase().includes(search.toLowerCase()) &&
      !agr.workerAgentId.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalEscrowPaise = agreements.reduce((acc, a) => acc + a.escrowAmountPaise, 0);
  const settledCount = agreements.filter((a) => a.state === "SETTLED").length;
  const activeCount = agreements.filter((a) => a.state !== "SETTLED" && a.state !== "REFUNDED").length;

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 relative overflow-hidden font-sans selection:bg-blue-600/30">
      {/* Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[360px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-32 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#09090B]/70 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs font-mono text-slate-400 hover:text-white transition-colors">
              ← DASHBOARD
            </Link>
            <span className="text-slate-600">/</span>
            <div className="font-mono text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-md">
              PROTOCOL // SETTLEMENT_VM_REGISTRY
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-mono text-blue-400 bg-blue-950/40 border border-blue-800/40 px-3 py-1.5 rounded-lg hover:border-blue-500/50 transition-colors"
          >
            VIEW DAG DEPENDENCY GRAPH →
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            Universal Settlement State Machines
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Autonomous clearing agreements with cryptographic proof verification, policy guardrails, and deterministic state transitions.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 backdrop-blur-md">
            <span className="font-mono text-xs text-slate-400">TOTAL ESCROW IN FLIGHT</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              ₹{(totalEscrowPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 backdrop-blur-md">
            <span className="font-mono text-xs text-slate-400">ACTIVE STATE MACHINES</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {activeCount} NODES
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 backdrop-blur-md">
            <span className="font-mono text-xs text-slate-400">SETTLED DISBURSEMENTS</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {settledCount} COMPLETED
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            {["ALL", "INITIALIZED", "ESCROW_LOCKED", "VERIFYING", "SETTLED", "CHALLENGED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filter === st
                    ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                    : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by hash or agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/[0.02] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 w-64"
            />
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="py-20 flex items-center justify-center font-mono text-xs text-cyan-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            LOADING_AGREEMENTS...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-12 text-center font-mono text-xs text-slate-500">
            NO_SETTLEMENT_AGREEMENTS_MATCHING_FILTER
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {filtered.map((agr) => {
              const inr = (agr.escrowAmountPaise / 100).toLocaleString("en-IN");
              let badgeColor = "text-slate-400 border-slate-700 bg-slate-900/60";
              if (agr.state === "SETTLED") {
                badgeColor = "text-emerald-400 border-emerald-500/40 bg-emerald-950/40";
              } else if (agr.state === "VERIFYING") {
                badgeColor = "text-cyan-400 border-cyan-500/40 bg-cyan-950/40";
              } else if (agr.state === "ESCROW_LOCKED") {
                badgeColor = "text-blue-400 border-blue-500/40 bg-blue-950/40";
              } else if (agr.state === "CHALLENGED") {
                badgeColor = "text-amber-400 border-amber-500/40 bg-amber-950/40";
              }

              return (
                <div
                  key={agr.id}
                  className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-4 backdrop-blur-md transition-all flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{agr.agreementHash}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] ${badgeColor}`}>
                        {agr.state}
                      </span>
                      {agr.parentAgreementId && (
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                          DAG CHILD
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span>Buyer: <span className="text-slate-200">{agr.buyerAgentId}</span></span>
                      <span>•</span>
                      <span>Worker: <span className="text-slate-200">{agr.workerAgentId}</span></span>
                      <span>•</span>
                      <span>Method: <span className="text-cyan-300">{agr.verificationMethod}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="text-base font-bold text-white">₹{inr}</div>
                      <div className="text-[10px] text-slate-500">Take Rate: {(agr.platformTakeRate * 100).toFixed(0)}%</div>
                    </div>

                    <Link
                      href={`/settlement/${agr.id}`}
                      className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 hover:border-blue-500/50"
                    >
                      <span>INSPECT_VM</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
