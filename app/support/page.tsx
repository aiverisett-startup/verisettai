"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  FileText,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";

const CATEGORIES = [
  "Payment Issue",
  "API Connectivity",
  "Agent Execution",
  "Billing",
  "General Inquiry",
];

export default function SupportPage() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [category, setCategory] = useState("Payment Issue");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid registered email address.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Please enter a description of at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName.trim(),
          email: email.trim(),
          referenceId: referenceId.trim(),
          category,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit support ticket.");
      }

      setSubmittedTicket({
        ticketId: data.ticketId,
        message: data.message,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mailtoSubject = encodeURIComponent(
    `[Technical Support Desk] - ${category} - Ref: ${referenceId || "Account Inquiry"}`
  );
  const mailtoBody = encodeURIComponent(
    `Name: ${userName || "Operator"}\nEmail: ${email || "Registered Email"}\nReference ID: ${
      referenceId || "N/A"
    }\nCategory: ${category}\n\nDescription:\n${description || ""}`
  );
  const mailtoUrl = `mailto:support@veri-sett.com?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <VerisettLogo size={28} />
              <span className="font-bold text-slate-900 text-sm tracking-tight hidden sm:inline-block">
                Verisett <span className="text-blue-600">AI</span>
              </span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Technical Desk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14 w-full space-y-8">
        {/* Page Title & Mission */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>24/7 Production SLA &amp; Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verisett Support &amp; Technical Desk
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Submit a direct technical inquiry to our platform engineering team or connect with engineering via encrypted email.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative space-y-6">
          {submittedTicket ? (
            /* Ticket Submitted Success State */
            <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900">
                  Support Ticket Dispatched
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  {submittedTicket.message}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs max-w-sm mx-auto text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">TICKET REF:</span>
                  <span className="font-bold text-blue-600">{submittedTicket.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CATEGORY:</span>
                  <span className="font-medium text-slate-900">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">STATUS:</span>
                  <span className="text-emerald-700 font-semibold">Under Review</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedTicket(null);
                    setDescription("");
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Submit Another Ticket
                </button>
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            /* Support Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* User Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    User Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none text-sm text-slate-900 transition"
                  />
                </div>

                {/* Registered Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Registered Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none text-sm text-slate-900 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Order / Account Reference ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Order / Account Reference ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ord_..., pay_..., or AGT-..."
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none text-sm font-mono text-slate-900 transition"
                  />
                </div>

                {/* Issue Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Issue Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none text-sm text-slate-900 transition cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Issue Description &amp; Technical Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the issue, steps to reproduce, or transaction reference..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none text-sm text-slate-900 transition resize-y font-sans"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={mailtoUrl}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email Engineering Directly</span>
                </a>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Technical Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Legal & SLA Disclaimer */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            All support tickets are cryptographically attributed to your tenant context and reviewed under the Verisett 24/7 SLA. For urgent payment reconciliation or dispute settlement, include your Razorpay payment ID.
          </p>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Verisett AI Platform. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-800 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-800 transition">Privacy</Link>
            <Link href="/security" className="hover:text-slate-800 transition">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

