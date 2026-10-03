"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Download,
  Share2,
  ShieldCheck,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  X,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";

import { TransactionItem } from "@/lib/agentTransactionStorage";

export type TransactionReceiptData = TransactionItem;

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionReceiptData | null;
}

export function TransactionReceiptModal({
  isOpen,
  onClose,
  transaction,
}: TransactionReceiptModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const commission = Number((transaction.amountINR * transaction.commissionRate).toFixed(2));
  const netAmount = Number((transaction.amountINR - commission).toFixed(2));

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isSuccess = transaction.status === "SUCCESSFUL";
  const isFailed = transaction.status === "FAILED";

  const formatUSD = (val: number) =>
    `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-[#09090B] border border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-200">
        
        {/* Top Header Bar with Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <VerisettLogo size={22} />
            <span className="font-mono text-[11px] font-semibold tracking-wider text-blue-400 uppercase">
              Official Clearing Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close transaction receipt"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Card */}
        <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-[#09090B] to-slate-900/40 space-y-3">
          {/* Status Icon */}
          <div className="flex justify-center">
            {isSuccess ? (
              <div className="w-16 h-16 rounded-full bg-emerald-950/40 border-4 border-emerald-900/50 flex items-center justify-center shadow-inner animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-9 h-9 text-emerald-400 stroke-[2.2]" />
              </div>
            ) : isFailed ? (
              <div className="w-16 h-16 rounded-full bg-rose-950/40 border-4 border-rose-900/50 flex items-center justify-center shadow-inner animate-in zoom-in-75 duration-300">
                <XCircle className="w-9 h-9 text-rose-400 stroke-[2.2]" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-950/40 border-4 border-blue-900/50 flex items-center justify-center shadow-inner animate-in zoom-in-75 duration-300">
                <Clock className="w-9 h-9 text-blue-400 stroke-[2.2]" />
              </div>
            )}
          </div>

          <div>
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wide uppercase ${
                isSuccess
                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/50"
                  : isFailed
                  ? "bg-rose-950/40 text-rose-400 border border-rose-800/50"
                  : "bg-blue-950/40 text-blue-400 border border-blue-800/50"
              }`}
            >
              {isSuccess ? "Transaction Successful" : isFailed ? "Transaction Failed / Refunded" : "Escrow Pending"}
            </span>
            <div className="text-3xl font-extrabold text-white font-mono mt-2 tracking-tight">
              {formatUSD(transaction.amountINR)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{transaction.timestamp}</p>
          </div>

          {/* Failure Alert Box if Failed */}
          {isFailed && transaction.failureReason && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-left text-xs text-rose-300 leading-relaxed">
              <span className="font-semibold block mb-0.5 text-rose-200">Verification Discrepancy:</span>
              {transaction.failureReason}
              <span className="block mt-1 font-medium text-[11px] text-rose-400">
                Funds have been automatically refunded to the payer vault.
              </span>
            </div>
          )}
        </div>

        {/* Counterparty Agents Details */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* From Agent -> To Agent Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            {/* Sender Agent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${transaction.fromAgent.avatarBg || "bg-blue-600"} text-white flex items-center justify-center text-xs font-bold shadow-xs`}>
                  {transaction.fromAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">From:</span>
                    <span className="font-bold text-white">{transaction.fromAgent.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400">{transaction.fromAgent.model}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                Payer
              </span>
            </div>

            <div className="h-px bg-slate-800 w-full" />

            {/* Recipient Agent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${transaction.toAgent.avatarBg || "bg-emerald-600"} text-white flex items-center justify-center text-xs font-bold shadow-xs`}>
                  {transaction.toAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">To:</span>
                    <span className="font-bold text-white">{transaction.toAgent.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400">{transaction.toAgent.model}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                Beneficiary
              </span>
            </div>
          </div>

          {/* Financial Breakdown (Gross, 1.5% Commission, Net Credited) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Milestone Task</span>
              <span className="font-semibold text-white text-right truncate max-w-[200px]">
                {transaction.milestoneTitle}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Gross Escrow Amount</span>
              <span className="font-mono font-medium text-white">
                {formatUSD(transaction.amountINR)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 border-t border-slate-800 pt-2">
              <span className="flex items-center gap-1">
                <span>Protocol Fee</span>
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-1.5 py-0.5 rounded">
                  1.5% Flat
                </span>
              </span>
              <span className="font-mono font-medium text-blue-400">
                -{formatUSD(commission)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-white border-t border-slate-800 pt-2">
              <span>Net Credited to Recipient</span>
              <span className="font-mono text-emerald-400">
                {isSuccess ? formatUSD(netAmount) : "$0.00"}
              </span>
            </div>
          </div>

          {/* Transaction Metadata & Hash Proof */}
          <div className="space-y-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Transaction Ref ID</span>
                <span className="font-bold text-white">{transaction.id}</span>
              </div>
              <button
                onClick={() => handleCopy(transaction.id, "txId")}
                className="flex items-center gap-1 text-[10px] font-sans font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                {copiedField === "txId" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="min-w-0 flex-1 pr-2">
                <span className="block text-[10px] text-slate-500 uppercase">SHA-256 Ledger Proof</span>
                <span className="text-slate-300 truncate block text-[10px]">
                  {transaction.sha256Proof}
                </span>
              </div>
              <button
                onClick={() => handleCopy(transaction.sha256Proof, "proof")}
                className="flex items-center gap-1 text-[10px] font-sans font-semibold text-blue-400 hover:text-blue-300 cursor-pointer shrink-0"
              >
                {copiedField === "proof" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => handleCopy(JSON.stringify(transaction, null, 2), "all")}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedField === "all" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Receipt Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                <span>Copy Full Receipt</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer text-center"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
