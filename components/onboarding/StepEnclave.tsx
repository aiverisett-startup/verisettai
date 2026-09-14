"use client";

import React from "react";
import { ShieldCheck, ArrowLeft, CheckCircle2, RotateCw } from "lucide-react";

export interface EnclaveData {
  region: string;
  enableAuditLedger: boolean;
}

interface StepEnclaveProps {
  data: EnclaveData;
  onChange: (updated: Partial<EnclaveData>) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function StepEnclave({
  data,
  onChange,
  onComplete,
  onBack,
  isSubmitting,
}: StepEnclaveProps) {
  const regions = [
    {
      id: "aws-us-east-1",
      name: "AWS Nitro Enclave (US-East-1)",
      spec: "AMD SEV-SNP 64GB ECC / Nitro Hypervisor",
    },
    {
      id: "aws-eu-central-1",
      name: "AWS Nitro Enclave (EU-Central-1 / Frankfurt)",
      spec: "GDPR Compliant / FIPS 140-3 HSM Root",
    },
    {
      id: "gcp-us-central1",
      name: "GCP Confidential Space (US-Central1)",
      spec: "AMD EPYC Memory Encryption / Shielded VM",
    },
    {
      id: "gcp-europe-west3",
      name: "GCP Confidential Space (Europe-West3)",
      spec: "Zero Cloud-Operator Visibility Enclave",
    },
    {
      id: "azure-eastus2",
      name: "Azure Confidential VM (East US 2)",
      spec: "Intel SGX / Isolated Hardware vCPU",
    },
    {
      id: "on-prem-hsm",
      name: "Sovereign On-Premises HSM",
      spec: "Hardware Security Module Air-Gapped Appliance",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Monospace Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <span className="font-mono text-xs font-bold text-[#71717A]">
          [ 03 / RUNTIME ATTESTATION ]
        </span>
        <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-[#059669] border border-emerald-200">
          HARDWARE ATTESTATION
        </span>
      </div>

      <div className="space-y-4">
        {/* Region & Hypervisor Selector */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[#09090B] mb-2 uppercase">
            Confidential Compute Hypervisor &amp; Region
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regions.map((reg) => {
              const isSelected = data.region === reg.id;
              return (
                <div
                  key={reg.id}
                  onClick={() => onChange({ region: reg.id })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-emerald-50/60 border-[#059669] shadow-2xs"
                      : "bg-zinc-50/70 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#09090B] font-display">
                      {reg.name}
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#059669]" />}
                  </div>
                  <div className="text-[10px] font-mono text-[#71717A] mt-1">
                    {reg.spec}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cryptographic Ledger Checkbox */}
        <div
          onClick={() => onChange({ enableAuditLedger: !data.enableAuditLedger })}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
            data.enableAuditLedger
              ? "bg-zinc-50 border-[#09090B] shadow-2xs"
              : "bg-zinc-50/50 border-zinc-200"
          }`}
        >
          <input
            type="checkbox"
            checked={data.enableAuditLedger}
            onChange={() => {}}
            className="mt-1 w-4 h-4 accent-[#09090B] rounded cursor-pointer"
          />
          <div>
            <div className="text-xs font-bold text-[#09090B] font-display">
              Enable Append-Only Cryptographic Audit Ledger
            </div>
            <p className="text-[11px] text-[#52525B] mt-0.5 leading-relaxed">
              Every cross-SaaS state transition will emit a SHA-256 Merkle leaf signed with the enclave’s
              PCR hardware private key, providing verifiable non-repudiation for external auditors.
            </p>
          </div>
        </div>

        {/* Live Root PCR0 Register Simulation */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-[#71717A] text-[10px]">
            <span>INITIALIZED PCR0 HARDWARE REGISTERS</span>
            <span className="text-[#059669] font-bold">READY_TO_ATTEST</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-zinc-200 text-[#0284C7] font-semibold text-[11px] break-all">
            PCR0: 8f3b20c6a5d4e1f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-5 py-3 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 text-[#09090B] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-pill-black px-8 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-xs"
        >
          {isSubmitting ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-zinc-300" />
              <span>Attesting Enclave...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00F5A0] shadow-[0_0_6px_#00F5A0] animate-pulse" />
              <ShieldCheck className="w-4 h-4 text-zinc-300" />
              <span>Complete Sovereign Provisioning</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
