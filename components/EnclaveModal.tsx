"use client";

import React, { useState } from "react";
import {
  X,
  Shield,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";

interface EnclaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnclaveModal({ isOpen, onClose }: EnclaveModalProps) {
  const [cloud, setCloud] = useState<"aws" | "gcp" | "azure" | "sovereign">("aws");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [step, setStep] = useState<"form" | "provisioning" | "complete">("form");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleStartProvisioning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !org) return;

    setStep("provisioning");
    setTerminalLogs([
      "Initiating hardware enclave cluster request...",
      `Selected provider: ${cloud.toUpperCase()} Confidential Compute`,
      `Binding enterprise identity: ${org} (${email})`,
    ]);

    const logSteps = [
      "Allocating isolated memory segment: 64GB DDR5 ECC (AMD SEV-SNP)...",
      "Generating PCR measurement hash registers (PCR0, PCR1, PCR2)...",
      "Installing deterministic Open Policy Agent (OPA) policy gates...",
      "Configuring hardware vsock encrypted communication pipe...",
      "Signing root enclave attestation with Nitro Root CA...",
      "Vellixy Sovereign Node successfully deployed to staging enclave.",
    ];

    logSteps.forEach((log, index) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [...prev, log]);
        if (index === logSteps.length - 1) {
          setTimeout(() => {
            setStep("complete");
            try {
              confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.6 },
                colors: ["#111827", "#059669", "#2563eb"],
              });
            } catch {
              // Graceful fallback
            }
          }, 500);
        }
      }, (index + 1) * 500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-[#e5e7eb] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#6b7280] hover:text-[#111827] bg-[#faf9f6] border border-[#e5e7eb] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5e7eb]">
          <div className="p-2 rounded-xl bg-[#111827] text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#111827] tracking-tight">
              Request Sovereign Enclave Allocation
            </h3>
            <p className="text-xs text-[#6b7280] font-mono">
              VELLIXY // HARDWARE-ISOLATED ATTESTATION
            </p>
          </div>
        </div>

        {step === "form" && (
          <form onSubmit={handleStartProvisioning} className="space-y-5">
            {/* Cloud Provider selector */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#111827] mb-2">
                01. TARGET CONFIDENTIAL COMPUTE ENVIRONMENT
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "aws", label: "AWS Nitro", tag: "EIF MicroVM" },
                  { id: "gcp", label: "GCP Space", tag: "AMD SEV-SNP" },
                  { id: "azure", label: "Azure CC", tag: "Intel SGX" },
                  { id: "sovereign", label: "On-Prem", tag: "FIPS HSM" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCloud(item.id as "aws" | "gcp" | "azure" | "sovereign")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      cloud === item.id
                        ? "bg-[#faf9f6] border-[#111827] ring-1 ring-[#111827]"
                        : "bg-white border-[#e5e7eb] hover:border-zinc-300"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold ${
                        cloud === item.id ? "text-[#111827]" : "text-[#111827]"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#6b7280] mt-0.5 font-mono">
                      {item.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Enterprise Domain & Org */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-[#111827] mb-1.5">
                  02. CORPORATE EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.com"
                  className="w-full px-4 py-2.5 rounded-full bg-[#faf9f6] border border-[#e5e7eb] focus:border-[#111827] focus:outline-none text-xs text-[#111827] font-mono placeholder-[#6b7280] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#111827] mb-1.5">
                  03. ENTERPRISE ENTITY NAME
                </label>
                <input
                  type="text"
                  required
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Acme Global Inc"
                  className="w-full px-4 py-2.5 rounded-full bg-[#faf9f6] border border-[#e5e7eb] focus:border-[#111827] focus:outline-none text-xs text-[#111827] font-mono placeholder-[#6b7280] transition-colors"
                />
              </div>
            </div>

            {/* Attestation Security Notice */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb] flex items-start gap-3 text-xs text-[#6b7280] leading-relaxed">
              <Lock className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" />
              <p>
                Deployment initiates cryptographic attestation via hardware security modules (HSM).
                Operations execute inside memory-encrypted microVMs with zero interactive shell access.
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Deploy Attestation Request</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        {step === "provisioning" && (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#111827]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-spin text-[#2563eb]" />
                <span className="font-medium">PROVISIONING SECURE ENCLAVE CLUSTER...</span>
              </div>
              <span className="text-[#059669] font-medium">LIVE</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-zinc-800 font-mono text-xs text-emerald-400 space-y-2 h-56 overflow-y-auto">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-zinc-600 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669]">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="text-xl font-bold text-[#111827]">
              Enclave Allocation Confirmed
            </h4>

            <p className="text-xs sm:text-sm text-[#6b7280] max-w-md mx-auto leading-relaxed">
              Your cryptographic root certificate has been generated. Our engineering
              group will dispatch enclave parameters to <span className="text-[#111827] font-semibold font-mono">{email}</span> within 2 business hours.
            </p>

            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb] font-mono text-xs text-left max-w-md mx-auto space-y-1.5">
              <div className="text-[#6b7280]">
                TENANT: <span className="text-[#111827] font-medium">{org}</span>
              </div>
              <div className="text-[#6b7280]">
                PLATFORM: <span className="text-[#2563eb] font-medium">{cloud.toUpperCase()} ENCLAVE</span>
              </div>
              <div className="text-[#6b7280]">
                STATUS: <span className="text-[#059669] font-medium">RESERVATION_SECURED</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-primary px-6 py-2.5 text-xs font-mono cursor-pointer"
            >
              Close Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
