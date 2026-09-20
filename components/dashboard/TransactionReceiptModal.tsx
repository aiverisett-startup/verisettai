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

  const commissionINR = Math.round(transaction.amountINR * transaction.commissionRate);
  const netAmountINR = transaction.amountINR - commissionINR;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isSuccess = transaction.status === "SUCCESSFUL";
  const isFailed = transaction.status === "FAILED";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-stone-900/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-white border border-[#EAE3D2] shadow-2xl overflow-hidden font-sans">
        
        {/* Top Header Bar with Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DC] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <VerisettLogo size={22} />
            <span className="font-mono text-[11px] font-semibold tracking-wider text-[#9E7A45] uppercase">
              Official Clearing Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close transaction receipt"
            className="p-1.5 rounded-full text-[#8C8275] hover:text-[#1C1A17] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PhonePe / UPI-Style Hero Card */}
        <div className="p-6 text-center border-b border-[#F0E9DC] bg-gradient-to-b from-white to-[#FCFAF6] space-y-3">
          {/* Status Icon */}
          <div className="flex justify-center">
            {isSuccess ? (
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center shadow-inner animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-9 h-9 text-emerald-600 stroke-[2.2]" />
              </div>
            ) : isFailed ? (
              <div className="w-16 h-16 rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center shadow-inner animate-in zoom-in-75 duration-300">
                <XCircle className="w-9 h-9 text-rose-600 stroke-[2.2]" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center shadow-inner animate-in zoom-in-75 duration-300">
                <Clock className="w-9 h-9 text-amber-600 stroke-[2.2]" />
              </div>
            )}
          </div>

          <div>
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wide uppercase ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : isFailed
                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {isSuccess ? "Transaction Successful" : isFailed ? "Transaction Failed / Refunded" : "Escrow Pending"}
            </span>
            <div className="text-3xl font-extrabold text-[#1C1A17] font-mono mt-2 tracking-tight">
              ₹{transaction.amountINR.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-[#8C8275] mt-1 font-mono">{transaction.timestamp}</p>
          </div>

          {/* Failure Alert Box if Failed */}
          {isFailed && transaction.failureReason && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs text-rose-900 leading-relaxed">
              <span className="font-semibold block mb-0.5">Verification Discrepancy:</span>
              {transaction.failureReason}
              <span className="block mt-1 font-medium text-[11px] text-rose-700">
                Funds have been automatically refunded to the payer vault.
              </span>
            </div>
          )}
        </div>

        {/* Counterparty Agents Details */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* From Agent -> To Agent Box */}
          <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-4 space-y-3">
            {/* Sender Agent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${transaction.fromAgent.avatarBg} text-white flex items-center justify-center text-xs font-bold shadow-xs`}>
                  {transaction.fromAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#8C8275] font-mono uppercase">From:</span>
                    <span className="font-bold text-[#1C1A17]">{transaction.fromAgent.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#9E7A45]">{transaction.fromAgent.model}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#8C8275] bg-white px-2 py-0.5 rounded border border-[#EAE3D2]">
                Payer
              </span>
            </div>

            <div className="h-px bg-[#EAE3D2]/70 w-full" />

            {/* Recipient Agent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${transaction.toAgent.avatarBg} text-white flex items-center justify-center text-xs font-bold shadow-xs`}>
                  {transaction.toAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#8C8275] font-mono uppercase">To:</span>
                    <span className="font-bold text-[#1C1A17]">{transaction.toAgent.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#9E7A45]">{transaction.toAgent.model}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#8C8275] bg-white px-2 py-0.5 rounded border border-[#EAE3D2]">
                Beneficiary
              </span>
            </div>
          </div>

          {/* Financial Breakdown (Gross, 1.5% Commission, Net Credited) */}
          <div className="rounded-2xl border border-[#EAE3D2] bg-white p-4 space-y-2.5">
            <div className="flex items-center justify-between text-[#6E675D]">
              <span>Milestone Task</span>
              <span className="font-semibold text-[#1C1A17] text-right truncate max-w-[200px]">
                {transaction.milestoneTitle}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#6E675D]">
              <span>Gross Escrow Amount</span>
              <span className="font-mono font-medium text-[#1C1A17]">
                ₹{transaction.amountINR.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#6E675D] border-t border-[#F0E9DC] pt-2">
              <span className="flex items-center gap-1">
                <span>Protocol Fee</span>
                <span className="text-[10px] font-mono font-bold text-[#9E7A45] bg-[#FAF6EE] px-1.5 py-0.5 rounded">
                  1.5% Flat
                </span>
              </span>
              <span className="font-mono font-medium text-[#9E7A45]">
                -₹{commissionINR.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-[#1C1A17] border-t border-[#F0E9DC] pt-2">
              <span>Net Credited to Recipient</span>
              <span className="font-mono text-emerald-700">
                ₹{isSuccess ? netAmountINR.toLocaleString("en-IN") : "0.00"}
              </span>
            </div>
          </div>

          {/* Transaction Metadata & Hash Proof */}
          <div className="space-y-2 text-[11px] font-mono text-[#8C8275]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
              <div>
                <span className="block text-[10px] text-[#8C8275] uppercase">Transaction Ref ID</span>
                <span className="font-bold text-[#1C1A17]">{transaction.id}</span>
              </div>
              <button
                onClick={() => handleCopy(transaction.id, "txId")}
                className="flex items-center gap-1 text-[10px] font-sans font-semibold text-[#9E7A45] hover:text-[#C59B5F] cursor-pointer"
              >
                {copiedField === "txId" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
              <div className="min-w-0 flex-1 pr-2">
                <span className="block text-[10px] text-[#8C8275] uppercase">SHA-256 Ledger Proof</span>
                <span className="text-[#1C1A17] truncate block text-[10px]">
                  {transaction.sha256Proof}
                </span>
              </div>
              <button
                onClick={() => handleCopy(transaction.sha256Proof, "proof")}
                className="flex items-center gap-1 text-[10px] font-sans font-semibold text-[#9E7A45] hover:text-[#C59B5F] cursor-pointer shrink-0"
              >
                {copiedField === "proof" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
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
        <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE3D2] flex items-center justify-between gap-3">
          <button
            onClick={() => handleCopy(JSON.stringify(transaction, null, 2), "all")}
            className="flex-1 py-2.5 px-3 rounded-xl border border-[#EAE3D2] bg-white hover:bg-[#FAF6EE] text-xs font-semibold text-[#1C1A17] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedField === "all" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Receipt Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#9E7A45]" />
                <span>Copy Full Receipt</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] text-white text-xs font-bold transition shadow-xs cursor-pointer text-center"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
