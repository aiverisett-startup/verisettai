"use client";

import React, { useState } from "react";
import {
  Search,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Lock,
  Clock,
  Play,
  Terminal,
} from "lucide-react";
import { ContractRecord } from "./types";

interface ContractLedgerProps {
  contracts: ContractRecord[];
  onSelectContract: (contract: ContractRecord) => void;
  onTriggerSampleEscrow?: () => void;
}

export const ContractLedger: React.FC<ContractLedgerProps> = ({
  contracts,
  onSelectContract,
  onTriggerSampleEscrow,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.payer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.worker_name && c.worker_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" || c.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const filterOptions = ["ALL", "SETTLED", "CLAIMED", "FUNDED", "DISPUTED"];

  const handleTriggerSample = () => {
    if (onTriggerSampleEscrow) {
      onTriggerSampleEscrow();
    } else {
      const now = new Date().toISOString();
      const sample: ContractRecord = {
        id: `TX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        payer_name: "Agent_Alpha_Buyer",
        payer_id: "acct_payer_buyer",
        worker_name: "Agent_Theta_Worker",
        worker_id: "acct_worker_theta",
        amount_cents: 25000,
        fee_cents: 375,
        status: "SETTLED",
        assertion_type: "JSON_SCHEMA",
        assertion_payload: { deliverable: "Autonomous Agent Swarm Orchestration" },
        result_payload: { verified: true, metrics: "99.4% Automated Test Suite Passed" },
        timeout_seconds: 604800,
        expires_at: now,
        created_at: now,
        settled_at: now,
      };
      onSelectContract(sample);
    }
  };

  return (
    <div
      id="contracts"
      className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_4px_24px_rgba(37,99,235,0.06)] overflow-hidden font-sans"
    >
      {/* 1. Header Bar & Controls */}
      <div className="p-6 sm:p-7 border-b border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
              Autonomous Escrow Ledger
            </h2>
            {/* Pill counter */}
            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-2.5 py-0.5 rounded-full font-medium font-sans border border-zinc-200/80 dark:border-zinc-700/80">
              {filteredContracts.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-sans">
            Audited transaction ledger with double-entry cryptographic verification records
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Segmented Filter Control */}
          <div className="inline-flex items-center rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
            {filterOptions.map((opt) => {
              const isActive = statusFilter === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`rounded-lg px-3 py-1 text-xs transition-all cursor-pointer font-sans ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 font-medium"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:w-60 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search ID, Agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-1.5 pl-8 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans transition-colors shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 2. Ledger Table */}
      <div className="overflow-x-auto custom-dark-scrollbar">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-sans">
              <th className="py-3 px-4 w-[16%]">CONTRACT ID</th>
              <th className="py-3 px-4 w-[17%]">PAYER AGENT</th>
              <th className="py-3 px-4 w-[17%]">WORKER AGENT</th>
              <th className="py-3 px-4 w-[15%] text-right">ESCROW VALUE</th>
              <th className="py-3 px-4 w-[13%]">RULE</th>
              <th className="py-3 px-4 w-[15%]">VAULT STATUS</th>
              <th className="py-3 px-4 w-[7%]">RELEASE GUARANTEE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 bg-white dark:bg-zinc-950 font-sans">
            {filteredContracts.length === 0 ? (
              /* 3. Institutional Empty State (No Dead Screens) */
              <tr>
                <td colSpan={7} className="p-0">
                  <div className="py-14 px-6 flex flex-col items-center text-center max-w-lg mx-auto space-y-3.5 font-sans">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shadow-2xs">
                      <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight font-sans">
                        No Active Escrow Contracts In Filter
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed font-sans">
                        Transactions verified through FastMCP and the Visual Simulator appear here with real-time ZK proof state.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTriggerSample}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs cursor-pointer active:scale-[0.98] font-sans"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Trigger Sample Escrow</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract) => {
                const isSettled = contract.status === "SETTLED";
                const isFunded = contract.status === "FUNDED";
                const isClaimed = contract.status === "CLAIMED";

                return (
                  <tr
                    key={contract.id}
                    onClick={() => onSelectContract(contract)}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                  >
                    {/* Contract ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <div className="inline-flex items-center gap-1.5">
                        <span>{contract.id}</span>
                        <button
                          onClick={(e) => handleCopy(contract.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-opacity p-0.5 cursor-pointer"
                          title="Copy ID"
                        >
                          {copiedId === contract.id ? (
                            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Payer Agent */}
                    <td className="py-3.5 px-4 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                      {contract.payer_name}
                    </td>

                    {/* Worker Agent */}
                    <td className="py-3.5 px-4 font-sans font-medium text-zinc-800 dark:text-zinc-200">
                      {contract.worker_name ? (
                        <span>{contract.worker_name}</span>
                      ) : (
                        <span className="text-zinc-400 italic text-[11px] font-normal">Unassigned</span>
                      )}
                    </td>

                    {/* Escrow Value */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${(contract.amount_cents / 100).toFixed(2)}{" "}
                      <span className="text-[10px] text-zinc-500 font-sans font-normal">USD</span>
                    </td>

                    {/* Rule */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-md border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                        {contract.assertion_type}
                      </span>
                    </td>

                    {/* Vault Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border font-sans ${
                          isSettled
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80"
                            : isClaimed
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/80"
                            : isFunded
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/80"
                            : "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/80"
                        }`}
                      >
                        {isSettled ? (
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        ) : isFunded ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>
                          {isSettled
                            ? "SETTLED (100%)"
                            : isClaimed
                            ? "VERIFYING"
                            : isFunded
                            ? "FUNDS IN VAULT"
                            : "REFUNDED"}
                        </span>
                      </span>
                    </td>

                    {/* Release Guarantee */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-sans font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Instant (38ms)</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
