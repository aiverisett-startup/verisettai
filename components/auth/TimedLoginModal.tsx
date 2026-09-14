"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  X,
  Mail,
  ArrowRight,
  Shield,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { dispatchAuthChange } from "@/lib/useAuthUser";
import { GoogleSignInButton, GOOGLE_CLIENT_ID } from "./GoogleSignInButton";
import { TwitterSignInButton } from "./TwitterSignInButton";
import { GithubSignInButton } from "./GithubSignInButton";
import { VerisettLogo } from "@/components/VerisettLogo";
import { supabase } from "@/lib/supabase";

interface TimedLoginModalProps {
  delaySeconds?: number;
}

export function TimedLoginModal({ delaySeconds = 15 }: TimedLoginModalProps) {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(delaySeconds);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasDismissed, setHasDismissed] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState<boolean>(false);

  // Check login state on mount
  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem("verisett_user_email");
      if (storedEmail) {
        setIsLoggedIn(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // 15s Countdown timer
  useEffect(() => {
    if (isLoggedIn || hasDismissed || isOpen) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, hasDismissed, isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    setHasDismissed(true);
  };

  const handleExtend = () => {
    setIsOpen(false);
    setSecondsRemaining(60);
    setHasDismissed(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setModalError("Please enter your corporate email.");
      return;
    }
    if (!password) {
      setModalError("Please enter your password.");
      return;
    }

    setIsEmailSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (error && !error.message.toLowerCase().includes("email not confirmed")) {
        // If invalid credentials, attempt registration or inform
        if (error.message.toLowerCase().includes("invalid")) {
          setModalError("Invalid credentials. For new accounts, use the Full Login Page link below.");
          setIsEmailSubmitting(false);
          return;
        }
      }

      localStorage.setItem("verisett_user_email", trimmedEmail);
      localStorage.setItem("verisett_user_name", trimmedEmail.split("@")[0]);
      localStorage.setItem("verisett_auth_provider", "email");
      localStorage.setItem("verisett_session_timestamp", Date.now().toString());
      dispatchAuthChange();
      setIsLoggedIn(true);
      setIsOpen(false);
    } catch {
      setIsOpen(false);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // If already logged in, do not render timer or modal
  if (isLoggedIn) return null;

  return (
    <>
      {/* 1. Subtle Floating Countdown Pill (shows before modal triggers) */}
      {!isOpen && !hasDismissed && secondsRemaining > 0 && (
        <aside
          role="region"
          aria-label="Guest session timer"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 px-3.5 py-2 rounded-full bg-white/95 border border-[#EAE3D2] shadow-2xl backdrop-blur-md text-[#1C1A17] text-xs font-mono transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="relative flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-ping absolute" />
            <Clock className="w-3.5 h-3.5 text-[#9E7A45] relative z-10" />
          </div>
          <span className="text-[#8C8275]">
            Guest session: <strong className="text-[#9E7A45]">{secondsRemaining}s</strong>
          </span>
          <button
            onClick={() => setIsOpen(true)}
            className="px-2.5 py-0.5 rounded-full bg-[#FAF6EE] hover:bg-[#F5EEDB] text-[#9E7A45] border border-[#EAE3D2] text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Sign In Now
          </button>
        </aside>
      )}

      {/* 2. Institutional Login Modal Popup (triggers at 15s) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
            className="login-page-montserrat font-montserrat relative w-full max-w-lg rounded-3xl border border-[#EAE3D2] bg-white text-[#1C1A17] shadow-[0_24px_64px_rgba(197,155,95,0.18)] p-7 sm:p-9 space-y-6 overflow-hidden"
          >
            {/* Ambient Golden Background Glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#FAF1E3]/80 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#F6E8D0]/50 rounded-full blur-3xl pointer-events-none" />

            {/* Close / Dismiss Button */}
            <button
              onClick={handleDismiss}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8C8275] hover:text-[#1C1A17] hover:bg-[#FAF6EE] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header & Logo */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="flex items-center justify-between">
                <VerisettLogo size={28} />
                <span className="rounded-full bg-[#FAF6EE] px-2.5 py-0.5 text-[10px] font-montserrat font-bold text-[#9E7A45] border border-[#EAE3D2] tracking-wider uppercase">
                  Session Access
                </span>
              </div>

              <div>
                <h2
                  id="login-modal-title"
                  className="font-montserrat text-2xl sm:text-3xl font-extrabold text-[#9E7A45] tracking-tight"
                >
                  Sign In
                </h2>
                <p className="font-montserrat text-xs sm:text-sm font-medium text-[#6E675D] mt-1.5 leading-relaxed">
                  Your guest preview window has completed. Please authenticate with Google, X, GitHub,
                  or your work email to continue.
                </p>
              </div>
            </div>

            {/* SSO Authentication: Google, GitHub, X (formerly Twitter) */}
            <div className="space-y-2 pt-1 font-montserrat">
              <GoogleSignInButton
                theme="light"
                buttonText="Continue with Google"
                className="font-montserrat"
                onSuccess={() => {
                  setIsLoggedIn(true);
                  setIsOpen(false);
                }}
              />
              <GithubSignInButton
                theme="light"
                buttonText="Continue with GitHub"
                className="font-montserrat"
                onSuccess={() => {
                  setIsLoggedIn(true);
                  setIsOpen(false);
                }}
              />
              <TwitterSignInButton
                className="font-montserrat"
                buttonText="Continue with X"
                onSuccess={() => {
                  setIsLoggedIn(true);
                  setIsOpen(false);
                }}
              />
            </div>

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F0E9DC]" />
              </div>
              <span className="relative bg-white px-3 text-[10px] sm:text-[11px] font-montserrat font-semibold text-[#8C8275] uppercase tracking-[0.14em]">
                Or Work Email
              </span>
            </div>

            {/* Modal Error Alert if present */}
            {modalError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-montserrat font-medium text-rose-800 flex items-start gap-2 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Work Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-montserrat font-bold text-[#4A453E] tracking-[0.12em] uppercase mb-1.5">
                  Enterprise Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8275]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    placeholder="operator@enterprise-vault.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FDFCF9] border border-[#EAE3D2] focus:border-[#C59B5F] focus:ring-2 focus:ring-[#C59B5F]/20 focus:outline-none text-xs sm:text-sm text-[#1C1A17] placeholder-[#9E9689] font-montserrat transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-montserrat font-bold text-[#4A453E] tracking-[0.12em] uppercase mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8275]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FDFCF9] border border-[#EAE3D2] focus:border-[#C59B5F] focus:ring-2 focus:ring-[#C59B5F]/20 focus:outline-none text-xs sm:text-sm text-[#1C1A17] placeholder-[#9E9689] font-montserrat transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8275] hover:text-[#1C1A17] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isEmailSubmitting}
                className="w-full py-3 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] active:bg-[#9E7A45] text-white font-montserrat font-bold text-xs sm:text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_4px_14px_rgba(197,155,95,0.3)] hover:shadow-[0_6px_20px_rgba(197,155,95,0.4)] active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isEmailSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Enterprise Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Full Login Link */}
            <div className="pt-2 border-t border-[#F0E9DC] flex items-center justify-center text-xs font-montserrat">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-[#9E7A45] hover:text-[#C59B5F] inline-flex items-center gap-1 font-montserrat font-bold text-xs sm:text-sm transition-colors"
              >
                <span>Full Enterprise Login Page</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Dismissal / Guest extension option */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleExtend}
                className="text-[10px] sm:text-[11px] font-montserrat text-[#8C8275] hover:text-[#1C1A17] transition-colors cursor-pointer font-medium"
              >
                Need more time? Continue browsing as Guest (+60s)
              </button>
            </div>

            {/* Bank-Grade Footer Guarantee */}
            <div className="pt-3 border-t border-[#F0E9DC] flex items-center justify-between text-[10px] font-mono text-[#8C8275]">
              <span className="flex items-center gap-1 text-emerald-700">
                <Shield className="w-3 h-3" />
                NEUTRAL CUSTODY
              </span>
              <span>SECURE OAUTH ENCRYPTED</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
