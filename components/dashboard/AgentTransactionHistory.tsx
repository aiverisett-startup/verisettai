"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Calendar,
} from "lucide-react";
import { TransactionReceiptModal, TransactionReceiptData } from "./TransactionReceiptModal";

interface AgentTransactionHistoryProps {
  initialTransactions?: TransactionReceiptData[];
}

export const MOCK_HISTORY_ITEMS: TransactionReceiptData[] = [
  {
    id: "TXN-VRS-2026-982147",
    fromAgent: {
      name: "Apex Financial Agent",
      model: "Claude 3.5 Sonnet",
      avatarBg: "bg-amber-600",
      agentId: "agt_payer_apex_01",
    },
    toAgent: {
      name: "Nexus-Crawler LLM",
      model: "GPT-4o",
      avatarBg: "bg-blue-600",
      agentId: "agt_worker_nexus_02",
    },
    amountINR: 25000,
    commissionRate: 0.015,
    status: "SUCCESSFUL",
    timestamp: "Today at 01:14 PM • 20 Sep 2026",
    milestoneTitle: "Real-time SEC 10-K Document Parsing & Extraction",
    sha256Proof: "0x7f4e92a83bd1c44208e9a2b5e612f0a884e1b4c919d38402a7b681e5927c3d11",
    clearingRail: "FastMCP Escrow Protocol v2.4",
    direction: "SENT",
  },
  {
    id: "TXN-VRS-2026-982146",
    fromAgent: {
      name: "Synthetix Risk Engine",
      model: "Llama 3.3 70B",
      avatarBg: "bg-purple-600",
      agentId: "agt_payer_synthetix_03",
    },
    toAgent: {
      name: "AlphaCode Auditor Bot",
      model: "Claude 3.5 Sonnet",
      avatarBg: "bg-emerald-600",
      agentId: "agt_worker_alphacode_04",
    },
    amountINR: 42000,
    commissionRate: 0.015,
    status: "SUCCESSFUL",
    timestamp: "Today at 10:45 AM • 20 Sep 2026",
    milestoneTitle: "Solidity Smart Contract AST Static Security Audit",
    sha256Proof: "0x892a01f4c718b52e0081d332fae1098cb47281a9382103efca772910d8a4e21b",
    clearingRail: "FastMCP Escrow Protocol v2.4",
    direction: "RECEIVED",
  },
  {
    id: "TXN-VRS-2026-982145",
    fromAgent: {
      name: "DocuSign Automation Bot",
      model: "Mistral Large",
      avatarBg: "bg-stone-700",
      agentId: "agt_payer_docusign_05",
    },
    toAgent: {
      name: "Untrusted OcrParser Worker",
      model: "DeepSeek R1",
      avatarBg: "bg-rose-600",
      agentId: "agt_worker_untrusted_06",
    },
    amountINR: 14500,
    commissionRate: 0.015,
    status: "FAILED",
    timestamp: "Today at 08:30 AM • 20 Sep 2026",
    milestoneTitle: "High-Resolution KYC Document OCR Character Vectorization",
    sha256Proof: "0x114fa8290bcda122394018274619bca01928374619283746192837461928374a",
    clearingRail: "FastMCP Escrow Protocol v2.4",
    direction: "SENT",
    failureReason: "JSON Schema draft-07 constraint rejected: extracted confidence score 0.74 fell below contractual threshold 0.95.",
  },
  {
    id: "TXN-VRS-2026-982144",
    fromAgent: {
      name: "Krypton Treasury Bot",
      model: "GPT-4o",
      avatarBg: "bg-teal-600",
      agentId: "agt_payer_krypton_07",
    },
    toAgent: {
      name: "ZeroKnowledge Proof Generator",
      model: "Custom FastMCP Kernel",
      avatarBg: "bg-indigo-600",
      agentId: "agt_worker_zkproof_08",
    },
    amountINR: 75000,
    commissionRate: 0.015,
    status: "SUCCESSFUL",
    timestamp: "Yesterday at 06:15 PM • 19 Sep 2026",
    milestoneTitle: "Groth16 zk-SNARK Verification Key Generation & Audit",
    sha256Proof: "0x4428172901a8264901823746192837461928374619283746192837461928374b",
    clearingRail: "FastMCP Escrow Protocol v2.4",
    direction: "RECEIVED",
  },
  {
    id: "TXN-VRS-2026-982143",
    fromAgent: {
      name: "DeepResearch Agent #4",
      model: "Claude 3.5 Sonnet",
      avatarBg: "bg-sky-600",
      agentId: "agt_payer_research_09",
    },
    toAgent: {
      name: "AlphaMarket Intelligence LLM",
      model: "Gemini 1.5 Pro",
      avatarBg: "bg-amber-600",
      agentId: "agt_worker_alphamarket_10",
    },
    amountINR: 18000,
    commissionRate: 0.015,
    status: "SUCCESSFUL",
    timestamp: "Yesterday at 02:40 PM • 19 Sep 2026",
    milestoneTitle: "Macroeconomic Fed Rate Decision Sentiment Heatmap",
    sha256Proof: "0x981726354819273648192736481927364819273648192736481927364819273c",
    clearingRail: "FastMCP Escrow Protocol v2.4",
    direction: "SENT",
  },
  {
    id: "TXN-VRS-2026-982142",
    fromAgent: {
      name: "Apex Financial Agent",
      model: "Claude 3.5 Sonnet",
      avatarBg: "bg-amber-600",
      agentId: "agt_payer_apex_01",
    },
    toAgent: {
      name: "Untrusted Code Compiler",
      model: "Custom Python Env",
      avatarBg: "bg-rose-600",
      agentId: "agt_worker_untrusted_11",
    },
    amountINR: 31000,
    commissionRate: 0.015,
    status: "FAILED",
    timestamp: "18 Sep 2026 at 04:12 PM",
    milestoneTitle: "Distributed Rust Microservice Binary Build Execution",
    sha256Proof: "0x772819203847192837461928374619283746192837461928374619283746192d",
    clearingRail: "FastMCP Escrow Protocol v2.4",
    direction: "SENT",
    failureReason: "Cryptographic hash mismatch: build binary SHA-256 failed commit commitment check.",
  },
];

export function AgentTransactionHistory({
  initialTransactions = MOCK_HISTORY_ITEMS,
}: AgentTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<TransactionReceiptData[]>(initialTransactions);
  const [selectedTx, setSelectedTx] = useState<TransactionReceiptData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "SUCCESSFUL" | "FAILED" | "SENT" | "RECEIVED">("ALL");

  // Filtered dataset
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      // Status & Direction Filter
      if (filterTab === "SUCCESSFUL" && tx.status !== "SUCCESSFUL") return false;
      if (filterTab === "FAILED" && tx.status !== "FAILED") return false;
      if (filterTab === "SENT" && tx.direction !== "SENT") return false;
      if (filterTab === "RECEIVED" && tx.direction !== "RECEIVED") return false;

      // Search Query
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

  return (
    <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)] space-y-6 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0E9DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[10px] font-mono text-[#9E7A45] mb-1">
            <ShieldCheck className="w-3 h-3 text-[#C59B5F]" />
            <span>Audited Clearing Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1A17] tracking-tight flex items-center gap-2.5">
            <span>Agent Transaction History</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EAE3D2] text-[#8C8275]">
              {filteredList.length} Transactions
            </span>
          </h2>
          <p className="text-xs text-[#8C8275] mt-0.5">
            PhonePe-style detailed transaction records with verified sender/receiver agents, exact amounts, timestamps, and 1.5% protocol fee transparency.
          </p>
        </div>

        {/* Search Bar */}
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
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
        {[
          { id: "ALL", label: "All Transactions" },
          { id: "SUCCESSFUL", label: "Successful Settled" },
          { id: "FAILED", label: "Failed / Refunded" },
          { id: "SENT", label: "Sent (Payer)" },
          { id: "RECEIVED", label: "Received (Worker)" },
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

      {/* Transaction History Items Feed (PhonePe / UPI Style) */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-[#EAE3D2] bg-[#FAF8F5]/60 text-center space-y-2">
            <p className="text-xs text-[#8C8275] font-mono">No transactions found matching the selected filter.</p>
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
          filteredList.map((tx) => {
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
          })
        )}
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />

    </div>
  );
}
