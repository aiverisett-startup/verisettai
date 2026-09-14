"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Terminal,
  Mail,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

interface FooterProps {
  onOpenContact?: () => void;
}

export default function Footer({ onOpenContact }: FooterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketHash, setTicketHash] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const founderEmail = "contact@vellixy.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(founderEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const validateEmail = (input: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(input).toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setErrorMessage("Corporate email address is required.");
      return;
    }

    if (!validateEmail(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid corporate email (e.g. name@company.com).");
      return;
    }

    const personalDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
    const domain = email.split("@")[1]?.toLowerCase();
    if (personalDomains.includes(domain)) {
      setStatus("error");
      setErrorMessage("Enclave licenses require a corporate enterprise domain.");
      return;
    }

    setStatus("validating");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: "Waitlist Subscriber",
          subject: "Early Hardware Enclave Allocation",
          type: "waitlist",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register email.");
      }

      setTicketHash(data.ticketId);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit. Please email us directly.");
    }
  };

  return (
    <footer className="bg-white border-t border-[#e5e7eb] pt-20 pb-14 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Pre-Launch Waitlist Bento Card */}
        <div className="minimal-card p-8 sm:p-12 bg-white border border-[#e5e7eb] mb-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faf9f6] border border-[#e5e7eb] text-[#2563eb] font-mono text-xs font-medium mb-4">
              <Terminal className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>PRE-LAUNCH ENCLAVE QUEUE</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              Reserve Early Hardware Node Allocation
            </h3>

            <p className="mt-3 text-sm text-[#6b7280] leading-relaxed">
              We allocate isolated physical microVM enclaves on a rolling cryptographic queue.
              Enter your enterprise email to initiate key generation.
            </p>

            {status === "success" ? (
              <div className="mt-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm font-mono font-bold text-[#059669]">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ALLOTMENT SECURED // HSM QUEUED</span>
                </div>
                <p className="text-xs text-[#6b7280]">
                  Your allocation ticket has been anchored to our root ledger. Our engineering team
                  will dispatch provisioning parameters to your address.
                </p>
                <div className="p-3 rounded-xl bg-white border border-[#e5e7eb] font-mono text-xs text-[#2563eb] break-all">
                  TICKET_ID: {ticketHash}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineering-lead@enterprise.com"
                    className="flex-1 px-4 py-3 rounded-full bg-[#faf9f6] border border-[#e5e7eb] focus:border-[#111827] focus:outline-none text-xs text-[#111827] placeholder-[#6b7280] font-mono transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={status === "validating"}
                    className="btn-primary px-6 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                  >
                    {status === "validating" ? (
                      <span>Attesting...</span>
                    ) : (
                      <>
                        <span>Queue Node</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                      </>
                    )}
                  </button>
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-mono justify-center">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="text-[11px] font-mono text-[#6b7280]">
                  * Restricted to verified enterprise and corporate email domains.
                </div>
              </form>
            )}
          </div>

          {/* Direct Executive Inquiry Row */}
          <div className="mt-10 pt-8 border-t border-[#e5e7eb] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-[#6b7280]">
              <Mail className="w-4 h-4 text-[#2563eb]" />
              <span>DIRECT EXECUTIVE &amp; ARCHITECT INQUIRY:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#faf9f6] border border-[#e5e7eb] text-[#111827] font-mono text-xs">
                <span className="font-semibold text-[#2563eb]">{founderEmail}</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 rounded-full hover:bg-zinc-200 text-[#6b7280] hover:text-[#111827] transition-colors cursor-pointer"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {onOpenContact && (
                <button
                  onClick={onOpenContact}
                  className="btn-primary px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Send Message</span>
                </button>
              )}

              <a
                href={`mailto:${founderEmail}?subject=Vellixy%20Engineering%20Inquiry`}
                className="btn-secondary px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Open Mail</span>
              </a>
            </div>
          </div>
        </div>

        {/* Global Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-14 border-b border-[#e5e7eb] text-xs">
          <div>
            <div className="font-semibold text-[#111827] uppercase tracking-wider mb-4 font-mono">
              [ ARCHITECTURE ]
            </div>
            <ul className="space-y-2.5 text-[#6b7280]">
              <li>
                <a href="#pipeline" className="hover:text-[#111827] transition-colors">
                  Confidential VM Mesh
                </a>
              </li>
              <li>
                <a href="#pipeline" className="hover:text-[#111827] transition-colors">
                  Deterministic State Engine
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-[#111827] transition-colors">
                  Open Policy Agent Gate
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-[#111827] transition-colors">
                  SHA-256 Merkle Ledger
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[#111827] uppercase tracking-wider mb-4 font-mono">
              [ INTEGRATIONS ]
            </div>
            <ul className="space-y-2.5 text-[#6b7280]">
              <li>
                <a href="#pipeline" className="hover:text-[#111827] transition-colors">
                  Salesforce CRM
                </a>
              </li>
              <li>
                <a href="#pipeline" className="hover:text-[#111827] transition-colors">
                  SAP S/4HANA Finance
                </a>
              </li>
              <li>
                <a href="#pipeline" className="hover:text-[#111827] transition-colors">
                  Workday Compensation
                </a>
              </li>
              <li>
                <a href="#pipeline" className="hover:text-[#111827] transition-colors">
                  SWIFT ISO 20022 Rails
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[#111827] uppercase tracking-wider mb-4 font-mono">
              [ COMPLIANCE ]
            </div>
            <ul className="space-y-2.5 text-[#6b7280]">
              <li className="flex items-center gap-2 text-[#111827]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                SOC-2 Type II Attested
              </li>
              <li className="flex items-center gap-2 text-[#111827]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                ISO/IEC 27001 Certified
              </li>
              <li className="flex items-center gap-2 text-[#111827]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                FIPS 140-3 Level 4 HSM
              </li>
              <li className="flex items-center gap-2 text-[#111827]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                GDPR Sovereign Enclave
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[#111827] uppercase tracking-wider mb-4 font-mono">
              [ NODE STATUS ]
            </div>
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb] space-y-1.5 text-xs text-[#6b7280] font-mono">
              <div className="flex items-center gap-2 text-[#059669] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                <span>HYPERVISOR_ONLINE</span>
              </div>
              <div>REGION: US-EAST-1 (NITRO)</div>
              <div>MEMORY: AMD SEV-SNP ENC</div>
              <div className="text-[10px] text-[#2563eb] pt-1 border-t border-[#e5e7eb]">
                ROOT CA: NITRO ATTESTED
              </div>
            </div>
          </div>
        </div>

        {/* Monospace Legal Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#6b7280]">
          <div>
            VELLIXY INC. SOVEREIGN ENTERPRISE RUNTIME.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#111827] cursor-pointer transition-colors">TERMS</span>
            <span className="hover:text-[#111827] cursor-pointer transition-colors">PRIVACY</span>
            <span
              onClick={onOpenContact}
              className="text-[#2563eb] hover:text-[#111827] cursor-pointer font-medium transition-colors"
            >
              EMAIL FOUNDER
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
