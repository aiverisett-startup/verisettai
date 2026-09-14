"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccessAccountLogin, AccessAccountFormValues } from "@/components/auth/AccessAccountLogin";
import { VerisettLogo } from "@/components/VerisettLogo";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";

export default function AccessAccountPage() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmit = async (values: AccessAccountFormValues) => {
    try {
      localStorage.setItem("verisett_user_email", values.email);
      localStorage.setItem("verisett_user_name", values.email.split("@")[0]);
      localStorage.setItem("verisett_auth_provider", "access_account_gold");
      localStorage.setItem("verisett_session_timestamp", Date.now().toString());
    } catch {
      // ignore
    }

    // Artificial delay for smooth UX transition
    await new Promise((resolve) => setTimeout(resolve, 600));
    router.push("/");
  };

  const handleSocialAuth = (provider: "google" | "github" | "apple" | "microsoft") => {
    showToast(`Redirecting to ${provider.toUpperCase()} Single Sign-On...`);
    setTimeout(() => {
      try {
        localStorage.setItem("verisett_user_email", `user.${provider}@enterprise-vault.com`);
        localStorage.setItem("verisett_user_name", `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`);
        localStorage.setItem("verisett_auth_provider", provider);
      } catch {
        // ignore
      }
      router.push("/");
    }, 900);
  };

  const handleRegisterClick = () => {
    showToast("Registration workflow initiated. Redirecting...");
  };

  const handleForgotPassword = () => {
    showToast("Password reset link will be dispatched to your registered address.");
  };

  return (
    <main className="login-page-montserrat font-montserrat min-h-screen w-full bg-[#FDFCF9] text-[#2C2925] flex flex-col justify-between p-6 sm:p-10 relative selection:bg-[#C59B5F] selection:text-white overflow-hidden">
      {/* Background Half-Shapes */}
      <GoldenBackgroundShapes />
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-xs font-montserrat font-semibold text-[#9E7A45] border border-[#D4AF37]/40 shadow-[0_10px_25px_-5px_rgba(197,155,95,0.25)] animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <CheckCircle2 className="h-4 w-4 text-[#C59B5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between font-montserrat">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-montserrat font-semibold text-[#8C8275] hover:text-[#9E7A45] transition-colors py-1.5 px-3 rounded-full hover:bg-white border border-transparent hover:border-[#EFECE6]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Verisett</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-montserrat text-[#A8A196] tracking-wider uppercase font-medium">
            DESIGN_SYSTEM // GOLD_LIGHT
          </span>
        </div>
      </header>

      {/* Centered Floating Card on Soft Off-White Canvas (#F9F8F6) */}
      <section className="flex-1 flex items-center justify-center my-8 font-montserrat">
        <AccessAccountLogin
          onSubmit={handleSubmit}
          onSocialAuth={handleSocialAuth}
          onRegisterClick={handleRegisterClick}
          onForgotPasswordClick={handleForgotPassword}
        />
      </section>

      {/* Subtle Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center text-[10px] sm:text-[11px] font-montserrat font-semibold tracking-[0.16em] uppercase text-[#B5B0A6]">
        <span>VERISETT AI · MINIMALIST LOGIN INTERFACE</span>
      </footer>
    </main>
  );
}
