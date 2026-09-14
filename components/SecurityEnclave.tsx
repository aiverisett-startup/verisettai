"use client";

import React, { useState } from "react";
import {
  Lock,
  Cpu,
  FileCheck,
  Check,
  Copy,
  Terminal,
} from "lucide-react";

export default function SecurityEnclave() {
  const [activeTab, setActiveTab] = useState<"nitro" | "rego" | "merkle">("nitro");
  const [copied, setCopied] = useState(false);

  const snippets = {
    nitro: `// AWS Nitro / GCP Confidential Enclave Attestation Document
{
  "module_id": "vellixy-enclave-nitro-v1.4",
  "digest": "SHA384",
  "timestamp": 1788358291040,
  "pcrs": {
    "PCR0": "8f3b20c6a5d4e1f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    "PCR1": "e4a1c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    "PCR2": "7d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c"
  },
  "certificate": {
    "issuer": "AWS Nitro Enclaves Root CA",
    "signature_algorithm": "ECDSA_P384_SHA384",
    "hardware_security": "AMD_SEV_SNP_HARDWARE_ENCRYPTED",
    "interactive_access": "BLOCKED_NO_SSH_NO_SHELL"
  }
}`,
    rego: `# Open Policy Agent (OPA) Deterministic Gate
package vellixy.security.gate

default allow = false

# Invariant: Disallow raw direct SQL mutation surface
deny[msg] {
    input.operation.type == "RAW_SQL_EXEC"
    msg := "Direct database execution blocked. All mutations must pass through Enclave State Engine."
}

# Invariant: Debits and credits must balance to exact zero variance
allow {
    input.operation.type == "GENERAL_LEDGER_POST"
    input.payload.debit_sum == input.payload.credit_sum
    input.attestation.valid == true
    input.source_identity.authenticated == true
}

# Invariant: Wire execution requires hardware attestation proof
allow {
    input.operation.type == "TREASURY_SETTLEMENT"
    input.amount <= input.limits.single_transaction_max
    crypto.x509.is_valid(input.enclave_pcr_cert)
}`,
    merkle: `// Cryptographic Merkle State Verification
import { createHash } from "crypto";

export function verifyEnclaveAuditReceipt(
  leafHash: string,
  merklePath: { hash: string; direction: "left" | "right" }[],
  expectedRoot: string
): boolean {
  let current = leafHash;
  for (const step of merklePath) {
    const combined = step.direction === "left"
      ? step.hash + current
      : current + step.hash;
    current = createHash("sha256").update(combined).digest("hex");
  }
  // Enclave Root matches cryptographic state
  return current === expectedRoot;
}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cards = [
    {
      id: "nitro",
      tag: "01 / HARDWARE ISOLATION",
      metaChip: "AMD SEV-SNP",
      icon: Cpu,
      title: "AWS Nitro & GCP Enclaves",
      description:
        "Operations execute inside hardware-isolated microVMs with RAM-level AES-256-XTS memory encryption. Eliminates interactive shell access, SSH daemons, and cloud operator visibility.",
      schematic: {
        hypervisor: "NITRO_SECURE_BOOT",
        memory_mode: "ENCRYPTED_DDR5",
        ssh_daemon: "DISABLED_HARDWARE",
        pcr_validation: "PCR0_PCR1_PCR2",
      },
    },
    {
      id: "rego",
      tag: "02 / DETERMINISTIC POLICY",
      metaChip: "OPA REGO v0.68",
      icon: Lock,
      title: "Deterministic Policy Gate",
      description:
        "Every operation is evaluated against mathematically verified invariants before execution. Direct SQL writes are structurally barred by policy compiler architecture.",
      schematic: {
        engine: "OPEN_POLICY_AGENT",
        direct_sql: "BARRED_BY_COMPILER",
        balance_proof: "DEBIT == CREDIT",
        latency: "0.00ms",
      },
    },
    {
      id: "merkle",
      tag: "03 / CRYPTOGRAPHIC AUDIT",
      metaChip: "SHA-256 MERKLE",
      icon: FileCheck,
      title: "Cryptographic Action Log",
      description:
        "State transitions emit an attested cryptographic leaf committed to an append-only SHA-256 Merkle tree, providing external auditors mathematical certainty of non-repudiation.",
      schematic: {
        tree_type: "APPEND_ONLY_MERKLE",
        hash_standard: "SHA-256_RFC6962",
        soc2_audit: "CONTINUOUS_AUTO",
        non_repudiation: "HARDWARE_SIGNED",
      },
    },
  ];

  return (
    <section id="security" className="py-24 border-t border-[#e5e7eb] bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faf9f6] border border-[#e5e7eb] font-mono text-xs font-medium text-[#2563eb] mb-4">
            <Lock className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>ENCLAVE SECURITY // ZERO-TRUST PREREQUISITES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
            Security Engineered for Zero Trust
          </h2>
          <p className="mt-3 text-base text-[#6b7280] leading-relaxed">
            Traditional architectures rely on human operational trust and database permissions.
            Vellixy replaces human trust with certified hardware cryptography.
          </p>
        </div>

        {/* 3-Column Minimal Card Layout */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeTab === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setActiveTab(card.id as "nitro" | "rego" | "merkle")}
                className={`minimal-card p-6 sm:p-7 flex flex-col justify-between cursor-pointer border transition-all ${
                  isSelected
                    ? "ring-2 ring-[#111827] border-transparent"
                    : "border-[#e5e7eb]"
                }`}
              >
                <div>
                  {/* Top Metadata Row */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e5e7eb]">
                    <span className="font-mono text-[11px] text-[#6b7280]">
                      {card.tag}
                    </span>
                    <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#faf9f6] text-[#2563eb] border border-[#e5e7eb]">
                      {card.metaChip}
                    </span>
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className="w-4 h-4 text-[#111827]" />
                    <h3 className="text-base font-semibold text-[#111827] tracking-tight">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#6b7280] leading-relaxed mb-5">
                    {card.description}
                  </p>

                  {/* Embedded UI Schematic Data-Chip Preview */}
                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e5e7eb] font-mono text-[11px] space-y-1.5">
                    {Object.entries(card.schematic).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[#6b7280]">
                        <span className="uppercase">{k}:</span>
                        <span className="font-medium text-[#111827]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[#e5e7eb] flex items-center justify-between text-xs font-mono text-[#2563eb]">
                  <span>Inspect Spec Code</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean Spec Code Viewer */}
        <div className="mt-10 minimal-card overflow-hidden border border-[#e5e7eb] bg-white">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-[#e5e7eb] bg-[#faf9f6]">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-[#2563eb]" />
              <span className="text-xs font-mono font-medium text-[#111827]">
                CODE_INSPECTOR // ATTESTATION_SPEC
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-full bg-white border border-[#e5e7eb]">
                <button
                  onClick={() => setActiveTab("nitro")}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    activeTab === "nitro"
                      ? "bg-[#111827] text-white font-medium"
                      : "text-[#6b7280] hover:text-[#111827]"
                  }`}
                >
                  attestation.json
                </button>
                <button
                  onClick={() => setActiveTab("rego")}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    activeTab === "rego"
                      ? "bg-[#111827] text-white font-medium"
                      : "text-[#6b7280] hover:text-[#111827]"
                  }`}
                >
                  policy_gate.rego
                </button>
                <button
                  onClick={() => setActiveTab("merkle")}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    activeTab === "merkle"
                      ? "bg-[#111827] text-white font-medium"
                      : "text-[#6b7280] hover:text-[#111827]"
                  }`}
                >
                  merkle_proof.ts
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-full bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827] transition-colors cursor-pointer"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-6 bg-white overflow-x-auto">
            <pre className="font-mono text-xs text-[#111827] leading-relaxed">
              <code>{snippets[activeTab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
