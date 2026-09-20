"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

export default function ContactModal({
  isOpen,
  onClose,
  defaultTopic = "General Enterprise Inquiry",
}: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(defaultTopic);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const founderEmail = "contact@vellixy.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(founderEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      setStatus("error");
      setErrorMessage("Please provide both your email and message.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          topic,
          message,
          type: "inquiry",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setTicketId(data.ticketId);
      setMailtoUrl(data.mailtoUrl || `mailto:${founderEmail}`);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please email us directly.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#e5e7eb] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#6b7280] hover:text-[#111827] bg-[#faf9f6] border border-[#e5e7eb] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5e7eb]">
          <div className="p-2 rounded-xl bg-[#111827] text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#111827] tracking-tight">
              Direct Executive Inquiry
            </h3>
            <p className="text-xs text-[#6b7280] font-mono">
              VELLIXY ARCHITECTURE &amp; FOUNDING GROUP
            </p>
          </div>
        </div>

        {status === "success" ? (
          <div className="py-4 space-y-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-[#111827] text-base">
                Inquiry Dispatched
              </h4>
              <p className="text-xs text-[#6b7280]">
                A confirmation receipt and reply will be dispatched to{" "}
                <span className="font-medium font-mono text-[#111827]">{email}</span>.
              </p>
              <div className="p-3 rounded-xl bg-white border border-[#e5e7eb] font-mono text-xs space-y-1 text-left">
                <div className="text-[#6b7280]">
                  TICKET ID: <span className="text-[#059669] font-medium">{ticketId}</span>
                </div>
                <div className="text-[#6b7280]">
                  RECIPIENT: <span className="text-[#111827] font-medium">{founderEmail}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={mailtoUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary w-full sm:w-auto flex-1 px-4 py-2.5 text-xs font-mono flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Open in Mail App</span>
              </a>

              <button
                onClick={onClose}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-mono cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Direct Email Header Bar */}
            <div className="p-3 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb] flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-[#6b7280]">
                <span>OFFICIAL INBOX:</span>
                <span className="font-medium text-[#2563eb]">{founderEmail}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-2.5 py-1 rounded-full bg-white border border-[#e5e7eb] hover:border-zinc-300 text-[#111827] flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedEmail ? <Check className="w-3 h-3 text-[#059669]" /> : <Copy className="w-3 h-3 text-[#6b7280]" />}
                <span className="text-[10px]">{copiedEmail ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-medium text-[#111827] mb-1">
                  YOUR NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full px-4 py-2.5 rounded-full bg-[#faf9f6] border border-[#e5e7eb] text-[#111827] placeholder-[#6b7280] text-xs font-mono focus:border-[#111827] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#111827] mb-1">
                  YOUR EMAIL <span className="text-[#2563eb]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 rounded-full bg-[#faf9f6] border border-[#e5e7eb] text-[#111827] placeholder-[#6b7280] text-xs font-mono focus:border-[#111827] focus:outline-none"
                />
              </div>
            </div>

            {/* Topic Selector */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#111827] mb-1">
                TOPIC / INQUIRY TYPE
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb] text-[#111827] text-xs font-mono focus:border-[#111827] focus:outline-none"
              >
                <option value="General Enterprise Inquiry">General Enterprise Inquiry</option>
                <option value="Custom ERP Connector (SAP / Oracle / NetSuite)">Custom ERP Connector (SAP / Oracle / NetSuite)</option>
                <option value="Confidential Compute Enclave Sizing (AWS / GCP)">Confidential Compute Enclave Sizing (AWS / GCP)</option>
                <option value="SOC-2 & ISO 27001 Auditor Attestation Bundle">SOC-2 & ISO 27001 Auditor Attestation Bundle</option>
                <option value="Direct Question to Founder / Engineering">Direct Question to Founder / Engineering</option>
              </select>
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-xs font-mono font-medium text-[#111827] mb-1">
                MESSAGE <span className="text-[#2563eb]">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detail your cross-SaaS reconciliation throughput or security compliance prerequisites..."
                className="w-full p-4 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb] text-[#111827] placeholder-[#6b7280] text-xs font-mono focus:border-[#111827] focus:outline-none resize-none"
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <a
                href={`mailto:${founderEmail}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(message)}`}
                className="text-xs font-mono text-[#6b7280] hover:text-[#2563eb] flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open direct email</span>
              </a>

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary px-6 py-2.5 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-zinc-300" />
                <span>{status === "sending" ? "Dispatching..." : "Send Message"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
