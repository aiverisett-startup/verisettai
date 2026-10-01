"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Check,
  BookOpen,
} from "lucide-react";

interface WhitepaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhitepaperModal({ isOpen, onClose }: WhitepaperModalProps) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => {
      const content = `Verisett AI: Settlement Engine for Autonomous Agents
Cryptographic Whitepaper (Architectural Edition)
Founded & Architected by Manoj S.M.

ABSTRACT:
Autonomous multi-agent commerce cannot rely on subjective human arbitration or custodial trust. We present Verisett AI, a deterministic settlement engine built on Model Context Protocol (MCP) using FastMCP. Verisett executes milestone-based, non-custodial escrow using SHA-256 payload assertions, sub-50ms cryptographic disbursement, and automated timeout refunds.

SECTION 1: DETERMINISTIC CODE-LEVEL ENFORCEMENT & VAULT ISOLATION
Funds deposited into Verisett escrow vaults are segregated and locked programmatically. Term transitions require mathematical satisfaction of SHA-256 deliverable payload hashes and JSON-Schema assertions.

SECTION 2: FAST PROTOCOL SLA (<50MS) & MERKLE ATTESTATION
When autonomous agents submit deliverables, Verisett evaluates assertion predicates in under 50 milliseconds, immediately initiating atomic vault disbursement at a flat 1.5% settlement fee.

SECTION 3: PROGRAMMATIC TIMEOUT REFUND GUARANTEES
If a counterparty agent fails to deliver before contract expiration, 100% of the locked principal reverts automatically to the payer agent's vault.

STAGE: Public Testnet Simulation Sandbox (Zero Monetary Fiat Liability)
`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Verisett-Settlement-Engine-Whitepaper.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-[#e5e7eb] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#6b7280] hover:text-[#111827] bg-[#faf9f6] border border-[#e5e7eb] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5e7eb]">
          <div className="p-2.5 rounded-xl bg-[#111827] text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-[#111827] tracking-tight">
                Cryptographic Whitepaper
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#faf9f6] text-[#2563eb] font-mono text-[10px] border border-[#e5e7eb]">
                MCP SPEC
              </span>
            </div>
            <p className="text-xs text-[#6b7280] font-mono">
              VERISETT SETTLEMENT ENGINE — BUILT ON MODEL CONTEXT PROTOCOL (MCP)
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-[#6b7280] leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb]">
            <h4 className="font-mono text-xs font-semibold text-[#111827] mb-1.5 uppercase">
              {"// Abstract"}
            </h4>
            <p className="leading-relaxed">
              Autonomous multi-agent commerce cannot rely on subjective human arbitration or custodial trust. 
              We present <strong>Verisett AI</strong>, a deterministic settlement engine built on Model Context Protocol (MCP) using FastMCP. 
              Verisett executes milestone-based, non-custodial escrow using SHA-256 payload assertions, sub-50ms cryptographic disbursement, and automated timeout refunds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb]">
              <div className="text-[#059669] font-semibold mb-1">01 / ISOLATION</div>
              <div className="text-[#6b7280] text-[11px]">
                AMD SEV-SNP RAM encryption. Zero hypervisor memory snooping.
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb]">
              <div className="text-[#2563eb] font-semibold mb-1">02 / POLICY GATE</div>
              <div className="text-[#6b7280] text-[11px]">
                Declarative Rego invariants. Formal mathematical proofs.
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb]">
              <div className="text-[#111827] font-semibold mb-1">03 / MERKLE LOG</div>
              <div className="text-[#6b7280] text-[11px]">
                SHA-256 state tree with hardware attestation leaf receipts.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb] font-mono space-y-1.5">
            <div className="text-[#111827] font-medium flex items-center justify-between">
              <span>MATHEMATICAL INVARIANT PROOF:</span>
              <span className="text-[#059669] font-semibold">VERIFIED</span>
            </div>
            <div className="text-[#2563eb] text-[11px]">
              ∀ t ∈ Operations: Δ(GL_Debit) - Δ(GL_Credit) = 0.000000 ∧ Attest(PCR_Node) = VALID
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[#e5e7eb] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] font-mono text-[#6b7280]">
            SHA-256 CHECKSUM: 9A3E48BF7D...01C4
          </div>

          <button
            onClick={handleDownload}
            className="btn-primary w-full sm:w-auto px-6 py-2.5 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-zinc-300" />
                <span>Download Specification</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
