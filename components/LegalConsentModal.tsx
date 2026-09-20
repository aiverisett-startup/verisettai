"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, FileText, ExternalLink, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { supabase } from "@/lib/supabase";
import { dispatchAuthChange } from "@/lib/useAuthUser";

interface LegalConsentModalProps {
  isOpen: boolean;
  user?: { id?: string; email?: string } | null;
  onConsentSuccess: () => Promise<void> | void;
}

export function LegalConsentModal({
  isOpen,
  user,
  onConsentSuccess,
}: LegalConsentModalProps) {
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmConsent = async () => {
    if (!privacyChecked || !termsChecked) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const targetUserId = session?.user?.id || user?.id;

      if (targetUserId) {
        const { error } = await supabase
          .from("profiles")
          .update({
            accepted_terms: true,
            accepted_terms_at: new Date().toISOString(),
          })
          .eq("id", targetUserId);

        if (error) {
          console.warn("Notice updating profiles accepted_terms:", error.message);
        }
      }

      // Mark locally in storage
      localStorage.setItem("verisett_accepted_terms", "true");
      dispatchAuthChange();

      // Trigger session refresh to reveal updated 10,000 VRS testnet balance
      await onConsentSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred while confirming consent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-consent-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-900/80 backdrop-blur-md transition-all animate-in fade-in duration-300 select-none"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#EAE3D2] shadow-2xl p-6 sm:p-8 space-y-6 text-[#1C1A17] font-sans">
        
        {/* Compliance Header Tag */}
        <div className="flex items-center justify-between border-b border-[#F0E9DC] pb-4">
          <VerisettLogo size={28} />
          <span className="rounded-full bg-[#FAF6EE] px-3 py-1 text-[10px] font-mono font-bold text-[#9E7A45] border border-[#EAE3D2] tracking-wider uppercase">
            COMPLIANCE MANDATE // ONBOARDING GATE
          </span>
        </div>

        {/* Modal Title & Intro */}
        <div>
          <h2
            id="legal-consent-title"
            className="font-montserrat text-xl sm:text-2xl font-extrabold text-[#1C1A17] tracking-tight"
          >
            Protocol Terms &amp; Compliance Consent
          </h2>
          <p className="font-montserrat text-xs sm:text-sm text-[#6E675D] mt-1.5 leading-relaxed font-medium">
            Verisett AI operates as an institutional non-custodial software escrow protocol.
            Legal consent is mandatory before activating your vault.
          </p>
        </div>

        {/* Required Exact Disclosure Banner */}
        <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#EAE3D2] text-[#1C1A17] text-xs sm:text-sm font-medium leading-relaxed font-sans">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#9E7A45] shrink-0 mt-0.5" />
            <p className="text-[#4A453E]">
              Accept the Protocol Privacy Policy and Terms of Service to activate your autonomous agent vault
              and unlock your starting allocation of 10,000 VRS Testnet Tokens.
            </p>
          </div>
        </div>

        {/* Direct Links to Policy Documents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] hover:border-[#C59B5F] hover:bg-white transition flex items-center justify-between text-xs font-semibold text-[#1C1A17] group"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9E7A45]" />
              Privacy Policy
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8C8275] group-hover:text-[#9E7A45]" />
          </Link>

          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] hover:border-[#C59B5F] hover:bg-white transition flex items-center justify-between text-xs font-semibold text-[#1C1A17] group"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9E7A45]" />
              Terms of Service
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8C8275] group-hover:text-[#9E7A45]" />
          </Link>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mandatory Checkboxes */}
        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#D1C7B7] text-[#C59B5F] focus:ring-[#C59B5F] accent-[#C59B5F] cursor-pointer"
            />
            <span className="text-xs text-[#4A453E] leading-snug">
              I have read and consent to the{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-[#9E7A45] hover:underline">
                Protocol Privacy Policy
              </Link>
              , including non-custodial telemetry and developer logging standards.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#D1C7B7] text-[#C59B5F] focus:ring-[#C59B5F] accent-[#C59B5F] cursor-pointer"
            />
            <span className="text-xs text-[#4A453E] leading-snug">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-[#9E7A45] hover:underline">
                Terms of Service
              </Link>
              , non-custodial escrow simulation rules, and programmatic settlement limits.
            </span>
          </label>
        </div>

        {/* Gating Action Button */}
        <button
          type="button"
          onClick={handleConfirmConsent}
          disabled={isSubmitting || !privacyChecked || !termsChecked}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C59B5F] to-[#D4AF37] hover:from-[#B38A4F] hover:to-[#C59B5F] text-white font-montserrat text-xs sm:text-sm font-bold shadow-md shadow-[#C59B5F]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Activating Autonomous Agent Vault...</span>
            </>
          ) : (
            <>
              <span>Accept &amp; Unlock 10,000 VRS Vault</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Non-Custodial Footer Guarantee */}
        <p className="text-center text-[10px] font-mono text-[#8C8275]">
          SECURE CONSENT PROTOCOL · IMMUTABLE TIMESTAMPS
        </p>
      </div>
    </div>
  );
}
