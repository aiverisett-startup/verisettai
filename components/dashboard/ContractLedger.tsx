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
  AlertTriangle,
} from "lucide-react";
import { ContractRecord } from "./types";

interface ContractLedgerProps {
  contracts: ContractRecord[];
  onSelectContract: (contract: ContractRecord) => void;
}

export const ContractLedger: React.FC<ContractLedgerProps> = ({
  contracts,
  onSelectContract,
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

  return (
    <div id="contracts" className="rounded-2xl bg-white border border-[#EAE3D2] shadow-[0_4px_24px_rgba(197,155,95,0.06)] overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-7 border-b border-[#EAE3D2] bg-[#FAF8F5]">
        <div>
          <h2 className="text-xl font-bold text-[#1C1A17] flex items-center gap-2.5">
            <span>Institutional Escrow Ledger</span>
            <span className="rounded-full bg-white border border-[#EAE3D2] px-2.5 py-0.5 text-xs font-mono text-[#9E7A45] shadow-2xs">
              {filteredContracts.length} records
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C8275] mt-1">
            Audited transaction ledger with double-entry cryptographic verification records
          </p>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Status Filters */}
          <div className="flex items-center rounded-full border border-[#EAE3D2] bg-white p-0.5 shadow-2xs">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`rounded-full px-3 py-1 text-xs font-mono font-medium transition-all cursor-pointer ${
                  statusFilter === opt
                    ? "bg-[#C59B5F] text-white shadow-xs font-semibold"
                    : "text-[#8C8275] hover:text-[#1C1A17]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8275]" />
            <input
              type="text"
              placeholder="Search ID, Client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-[#EAE3D2] bg-white py-1.5 pl-8 pr-3 text-xs text-[#1C1A17] placeholder-[#8C8275] focus:border-[#D4AF37] focus:outline-none font-mono transition-colors shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#EAE3D2] bg-[#FAF8F5] text-[11px] font-mono text-[#8C8275] uppercase tracking-wider">
              <th className="py-3.5 px-5">Contract ID</th>
              <th className="py-3.5 px-4">Payer / Client</th>
              <th className="py-3.5 px-4">Contractor / Vendor</th>
              <th className="py-3.5 px-4 text-right">Escrow Value</th>
              <th className="py-3.5 px-4">Rule</th>
              <th className="py-3.5 px-4">Vault Status</th>
              <th className="py-3.5 px-4">Release Guarantee</th>
              <th className="py-3.5 px-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE3D2] font-mono bg-white">
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#8C8275] font-mono">
                  No escrow contracts found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract) => {
                const amountINR = Math.round((contract.amount_cents / 100) * 83);
                const isSettled = contract.status === "SETTLED";
                const isFunded = contract.status === "FUNDED";
                const isClaimed = contract.status === "CLAIMED";

                return (
                  <tr
                    key={contract.id}
                    onClick={() => onSelectContract(contract)}
                    className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                  >
                    {/* Contract ID */}
                    <td className="py-4 px-5 font-mono font-medium text-[#1C1A17] flex items-center gap-1.5">
                      <span className="text-[#9E7A45] font-semibold">{contract.id}</span>
                      <button
                        onClick={(e) => handleCopy(contract.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-[#8C8275] hover:text-[#1C1A17] transition-opacity p-0.5 cursor-pointer"
                        title="Copy ID"
                      >
                        {copiedId === contract.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </td>

                    {/* Payer Agent */}
                    <td className="py-4 px-4 font-sans font-medium text-[#1C1A17]">
                      {contract.payer_name}
                    </td>

                    {/* Worker Agent */}
                    <td className="py-4 px-4 font-sans">
                      {contract.worker_name ? (
                        <span className="text-[#1C1A17] font-medium">{contract.worker_name}</span>
                      ) : (
                        <span className="text-[#8C8275] italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Escrow Amount */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-[#1C1A17]">
                        ₹{amountINR.toLocaleString("en-IN")}
                      </span>
                      <span className="block text-[10px] text-[#8C8275]">
                        ${(contract.amount_cents / 100).toFixed(2)} USD
                      </span>
                    </td>

                    {/* Milestone Rule */}
                    <td className="py-4 px-4">
                      <span className="rounded-full border border-[#EAE3D2] bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-medium text-[#1C1A17]">
                        {contract.assertion_type}
                      </span>
                    </td>

                    {/* Vault Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isSettled
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : isClaimed
                            ? "bg-[#FAF6EE] text-[#9E7A45] border-[#EAE3D2]"
                            : isFunded
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
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
                    <td className="py-4 px-4">
                      <span className="text-[11px] text-[#8C8275] flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Instant Release</span>
                      </span>
                    </td>

                    {/* Chevron */}
                    <td className="py-4 px-3 text-right">
                      <ChevronRight className="h-4 w-4 text-[#8C8275] group-hover:text-[#1C1A17] transition-colors" />
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
