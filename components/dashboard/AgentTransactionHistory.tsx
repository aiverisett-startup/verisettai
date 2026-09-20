"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Lock,
  Cpu,
  ArrowRight,
  Plus,
} from "lucide-react";
import { TransactionReceiptModal } from "./TransactionReceiptModal";
import { TransactionItem } from "@/lib/agentTransactionStorage";

interface AgentTransactionHistoryProps {
  isAgentConnected: boolean;
  transactions: TransactionItem[];
  onConnectAgent: () => void;
  onExecuteTestSettlement?: (isSuccess: boolean) => void;
}

export function AgentTransactionHistory({
  isAgentConnected,
  transactions,
  onConnectAgent,
  onExecuteTestSettlement,
}: AgentTransactionHistoryProps) {
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "SUCCESSFUL" | "FAILED">("ALL");

  // Filtered dataset
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterTab === "SUCCESSFUL" && tx.status !== "SUCCESSFUL") return false;
      if (filterTab === "FAILED" && tx.status !== "FAILED") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = tx.id.toLowerCase().includes(q);
        const matchFrom = tx.fromAgent.name.toLowerCase().includes(q);
        const matchTo = tx.toAgent.name.toLowerCase().includes(q);
        const matchMilestone = tx.milestoneTitle.toLowerCase().includes(q);
        const matchAmount = tx.amountINR.toString().includes(q);
        return matchId || matchFrom || matchTo || matchMilestone || matchAmount;
      }

      return true;
    });
  }, [transactions, filterTab, searchQuery]);

  // 1. STATE: Agent Not Connected
  if (!isAgentConnected) {
    return (
      <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)] relative overflow-hidden font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[10px] font-mono text-[#9E7A45]">
              <Lock className="w-3 h-3 text-[#C59B5F]" />
              <span>CLEARING LEDGER LOCKED</span>
            </div>
            <h3 className="text-lg font-bold text-[#1C1A17]">
              PhonePe-Style Transaction History Ledger
            </h3>
            <p className="text-xs text-[#8C8275] max-w-lg">
              Connect your autonomous agent gateway to view real-time sender/receiver agent names, transaction statuses, timestamps, and 1.5% commission fee deductions.
            </p>
          </div>

          <button
            onClick={onConnectAgent}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-[#FAF6EE] hover:bg-[#FAF6EE]/80 border border-[#C59B5F]/40 text-xs font-semibold text-[#9E7A45] hover:text-[#C59B5F] flex items-center gap-2 transition cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-[#C59B5F]" />
            <span>Connect Agent to Unlock</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. STATE: Agent Connected
  return (
    <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)] space-y-6 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0E9DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[10px] font-mono text-[#9E7A45] mb-1">
            <ShieldCheck className="w-3 h-3 text-[#C59B5F]" />
            <span>Cryptographic Clearing Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1A17] tracking-tight flex items-center gap-2.5">
            <span>Agent Transaction History</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EAE3D2] text-[#8C8275]">
              {filteredList.length} Records
            </span>
          </h2>
          <p className="text-xs text-[#8C8275] mt-0.5">
            PhonePe-style detailed transaction records: sender agent to receiver agent, exact settlement time, outcome, and 1.5% fee breakdown.
          </p>
        </div>

        {/* Search Bar */}
        {transactions.length > 0 && (
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8275]" />
            <input
              type="text"
              placeholder="Search Agent, TX ID, Milestone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[#EAE3D2] bg-[#FAF8F5] py-2 pl-9 pr-3 text-xs text-[#1C1A17] placeholder-[#8C8275] focus:border-[#D4AF37] focus:bg-white focus:outline-none font-mono transition-all shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {transactions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
          {[
            { id: "ALL", label: `All Transactions (${transactions.length})` },
            {
              id: "SUCCESSFUL",
              label: `Successful (${transactions.filter((t) => t.status === "SUCCESSFUL").length})`,
            },
            {
              id: "FAILED",
              label: `Failed / Refunded (${transactions.filter((t) => t.status === "FAILED").length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 cursor-pointer font-medium ${
                filterTab === tab.id
                  ? "bg-[#C59B5F] text-white shadow-xs font-bold"
                  : "bg-[#FAF8F5] border border-[#EAE3D2] text-[#8C8275] hover:text-[#1C1A17] hover:border-[#D4AF37]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty State when 0 Transactions */}
      {transactions.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl border border-dashed border-[#EAE3D2] bg-[#FAF8F5]/60 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] mx-auto flex items-center justify-center text-[#9E7A45]">
            <Clock className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1C1A17]">No Transactions Yet</h3>
            <p className="text-xs text-[#8C8275] mt-1 max-w-md mx-auto leading-relaxed">
              No transactions have been recorded for your connected agent in the last month. When an agent deposits or releases funds through FastMCP or REST API, the full PhonePe ledger will appear here.
            </p>
          </div>
          {onExecuteTestSettlement && (
            <div className="pt-2">
              <button
                onClick={() => onExecuteTestSettlement(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF6EE] border border-[#C59B5F]/40 text-[#9E7A45] hover:text-[#C59B5F] text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Trigger Test Escrow Settlement</span>
              </button>
            </div>
          )}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-[#EAE3D2] bg-[#FAF8F5]/60 text-center space-y-2">
          <p className="text-xs text-[#8C8275] font-mono">No transactions matching your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterTab("ALL");
            }}
            className="text-xs font-semibold text-[#9E7A45] hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* PhonePe / UPI-Style Transaction Cards Feed */
        <div className="space-y-3">
          {filteredList.map((tx) => {
            const isSuccess = tx.status === "SUCCESSFUL";
            const isFailed = tx.status === "FAILED";
            const commission = Math.round(tx.amountINR * tx.commissionRate);
            const netAmount = tx.amountINR - commission;

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="group relative p-4 sm:p-5 rounded-2xl border border-[#EAE3D2] bg-white hover:bg-[#FAF8F5]/50 hover:border-[#C59B5F]/50 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Side: Status Icon + Counterparty Agent Names */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* PhonePe-Style Round Status Badge */}
                  <div className="relative shrink-0 mt-0.5 sm:mt-0">
                    {isSuccess ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    ) : isFailed ? (
                      <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
                        <XCircle className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
                        <Clock className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    )}
                  </div>

                  {/* Agent Details & Milestone */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#1C1A17] text-sm group-hover:text-[#9E7A45] transition-colors">
                        {tx.fromAgent.name}
                      </span>
                      <span className="text-[#8C8275] text-xs font-mono">→</span>
                      <span className="font-bold text-[#1C1A17] text-sm group-hover:text-[#9E7A45] transition-colors">
                        {tx.toAgent.name}
                      </span>
                    </div>

                    <div className="text-xs text-[#6E675D] line-clamp-1">
                      {tx.milestoneTitle}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#8C8275] pt-0.5">
                      <span>{tx.timestamp}</span>
                      <span>•</span>
                      <span className="text-[#9E7A45] font-semibold">{tx.id}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Financial Amounts + 1.5% Fee Breakdown */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0E9DC]">
                  <div className="text-left sm:text-right">
                    {/* Gross Amount */}
                    <div className="text-base sm:text-lg font-bold font-mono text-[#1C1A17] flex items-center sm:justify-end gap-1">
                      <span>₹{tx.amountINR.toLocaleString("en-IN")}</span>
                      {tx.direction === "SENT" ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#9E7A45]" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>

                    {/* 1.5% Fee Breakdown */}
                    <div className="text-[10px] font-mono text-[#8C8275]">
                      Fee: <strong className="text-[#9E7A45]">₹{commission.toLocaleString("en-IN")}</strong> (1.5%)
                      {isSuccess && (
                        <span className="text-emerald-700 ml-1.5 font-medium">
                          • Net: ₹{netAmount.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div className="mt-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                          isSuccess
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : isFailed
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {isSuccess ? "Settled" : isFailed ? "Failed / Refunded" : "Escrow Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Right Arrow Chevron to View Receipt */}
                  <div className="h-8 w-8 rounded-full bg-[#FAF8F5] border border-[#EAE3D2] group-hover:border-[#C59B5F] group-hover:bg-white flex items-center justify-center text-[#8C8275] group-hover:text-[#1C1A17] transition-all shrink-0">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />

    </div>
  );
}
