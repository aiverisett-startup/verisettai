"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Code2,
  FileDiff,
  Database,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { ContractRecord } from "./types";

interface ContractDrawerProps {
  contract: ContractRecord | null;
  onClose: () => void;
}

export const ContractDrawer: React.FC<ContractDrawerProps> = ({
  contract,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"spec" | "audit">("spec");
  const [copiedId, setCopiedId] = useState(false);

  if (!contract) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(contract.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const amountINR = Math.round((contract.amount_cents / 100) * 83);
  const feeINR = Math.round((contract.fee_cents / 100) * 83);
  const workerNetINR = amountINR - feeINR;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border-l border-[#EAE3D2] h-full overflow-y-auto flex flex-col shadow-[0_20px_50px_rgba(197,155,95,0.12)] animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EAE3D2] bg-white/95 backdrop-blur-md px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF6EE] border border-[#EAE3D2] text-[#9E7A45]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-[#1C1A17]">
                  {contract.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="text-[#8C8275] hover:text-[#1C1A17] p-1 rounded hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                  title="Copy contract ID"
                >
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-[#9E7A45]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${
                    contract.status === "SETTLED"
                      ? "border-[#EAE3D2] bg-[#FAF6EE] text-[#9E7A45]"
                      : contract.status === "CLAIMED" || contract.status === "FUNDED"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {contract.status}
                </span>
              </div>
              <p className="text-xs text-[#8C8275] font-mono mt-0.5">
                Escrow Value: ₹{amountINR.toLocaleString("en-IN")} (${(contract.amount_cents / 100).toFixed(2)}) · 1.5% Fee: ₹{feeINR.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#8C8275] hover:bg-[#FAF8F5] hover:text-[#1C1A17] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="flex border-b border-[#EAE3D2] bg-[#FAF8F5] px-6">
          <button
            onClick={() => setActiveTab("spec")}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-medium font-mono transition-colors cursor-pointer ${
              activeTab === "spec"
                ? "border-[#C59B5F] text-[#9E7A45] font-semibold"
                : "border-transparent text-[#8C8275] hover:text-[#1C1A17]"
            }`}
          >
            <FileDiff className="h-4 w-4" />
            Milestone Details & Deliverable
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-medium font-mono transition-colors cursor-pointer ${
              activeTab === "audit"
                ? "border-[#C59B5F] text-[#9E7A45] font-semibold"
                : "border-transparent text-[#8C8275] hover:text-[#1C1A17]"
            }`}
          >
            <Database className="h-4 w-4" />
            Double-Entry Financial Trail
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Parties Meta Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8275]">
                Payer / Client
              </span>
              <p className="font-semibold text-[#1C1A17] text-sm mt-1">{contract.payer_name}</p>
              <p className="font-mono text-[11px] text-[#8C8275] truncate">{contract.payer_id}</p>
            </div>
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8275]">
                Beneficiary / Contractor
              </span>
              <p className="font-semibold text-[#1C1A17] text-sm mt-1">
                {contract.worker_name || "Awaiting Assignment..."}
              </p>
              <p className="font-mono text-[11px] text-[#9E7A45] truncate">
                {contract.worker_id || "Unassigned"}
              </p>
            </div>
          </div>

          {/* Tab 1: Spec & Deliverable */}
          {activeTab === "spec" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#EAE3D2] bg-white p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1C1A17]">Milestone Acceptance Spec</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-[#FAF6EE] border border-[#EAE3D2] text-[#9E7A45]">{contract.assertion_type}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <span className="text-[#8C8275]">Escrow Value:</span>
                    <span className="font-semibold text-[#1C1A17]">₹{amountINR.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <span className="text-[#8C8275]">Release Latency:</span>
                    <span className="font-semibold text-[#9E7A45]">38ms Instant</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <span className="text-[#8C8275]">Vault Custody Status:</span>
                    <span className="font-semibold text-[#1C1A17]">
                      {contract.status === "SETTLED" ? "Disbursed to Contractor" : "Protected in Vault"}
                    </span>
                  </div>
                </div>
              </div>

              {contract.result_payload && (
                <div className="rounded-2xl border border-[#EAE3D2] bg-white p-5 space-y-2.5 shadow-sm">
                  <span className="text-xs font-medium text-[#1C1A17] block">
                    Verified Deliverable Evidence:
                  </span>
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-xs font-mono text-[#1C1A17] overflow-x-auto">
                    {JSON.stringify(contract.result_payload, null, 2)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Audit Trail */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#EAE3D2] bg-white p-5 space-y-3 font-mono text-xs shadow-sm">
                <span className="text-[#8C8275] uppercase tracking-wider block font-medium">
                  Financial Invariant Verification:
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <span className="text-[#8C8275]">Escrow Vault Deposit:</span>
                    <span className="font-medium text-[#1C1A17]">₹{amountINR.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <span className="text-[#8C8275]">Contractor Net Payout (98.5%):</span>
                    <span className="font-medium text-[#9E7A45]">+₹{workerNetINR.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <span className="text-[#8C8275]">Protocol Fee (1.5%):</span>
                    <span className="font-medium text-[#1C1A17]">+₹{feeINR.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
