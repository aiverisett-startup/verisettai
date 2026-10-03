"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Lock, Menu, X, ShieldCheck, HelpCircle, Terminal, Cpu, ArrowRight } from "lucide-react";
import { GoogleIcon } from "../ui/GoogleIcon";
import { VerisettLogo } from "../VerisettLogo";
import { EnvironmentMode, VaultBalance } from "../dashboard/types";
import { useAuthUser } from "@/lib/useAuthUser";
import { ProfileSettingsModal } from "@/components/auth/ProfileSettingsModal";
import { supabase } from "@/lib/supabase";

interface MinimalNavProps {
  envMode: EnvironmentMode;
  onToggleEnv: (mode: EnvironmentMode) => void;
  vaultBalance: VaultBalance;
  onOpenDepositModal: () => void;
  onOpenConsole: () => void;
  onOpenVideoModal?: () => void;
  isConsoleView?: boolean;
}

function TwitterXIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function MinimalNav({
  envMode,
  onToggleEnv,
  vaultBalance: _vaultBalance,
  onOpenDepositModal,
  onOpenConsole,
  onOpenVideoModal,
  isConsoleView: _isConsoleView = false,
}: MinimalNavProps) {
  const { user, isLoaded, signOut, updateProfile } = useAuthUser();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("testnet_balance, accepted_terms")
            .eq("id", session.user.id)
            .maybeSingle();

          if (data && typeof data.testnet_balance === "number") {
            setBalance(data.testnet_balance);
            return;
          }
        }
        const termsAccepted = localStorage.getItem("verisett_accepted_terms") === "true";
        setBalance(termsAccepted ? 10000 : 0);
      } catch {
        setBalance(10000);
      }
    };

    fetchBalance();

    const handleAuthEvent = () => {
      fetchBalance();
    };

    window.addEventListener("verisett_auth_change", handleAuthEvent);
    return () => {
      window.removeEventListener("verisett_auth_change", handleAuthEvent);
    };
  }, [user]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="w-full flex items-center justify-between gap-4 px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md">
        {/* Group 1 (Left): Logo + Architect Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="shrink-0 flex items-center" aria-label="Verisett AI home">
            <VerisettLogo size={28} />
          </Link>
          <span className="hidden md:inline shrink-0 whitespace-nowrap pl-3 border-l border-border text-xs text-muted-foreground font-normal tracking-tight">
            Founded &amp; Architected by{" "}
            <Link
              href="/about"
              className="font-semibold text-[#09090B] hover:text-blue-600 transition-colors"
            >
              Manoj S.M.
            </Link>
          </span>
        </div>

        {/* Group 2 (Center): Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground font-medium">
          <Link href="/about" className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors">
            About
          </Link>
          <a href="#how-it-works" className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors">
            Pricing
          </a>
          <Link href="/docs" className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors">
            Docs
          </Link>
          <a href="#sandbox" className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors">
            Sandbox
          </a>
        </nav>

        {/* Group 3 (Right): Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {onOpenVideoModal && (
            <button
              onClick={onOpenVideoModal}
              className="shrink-0 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-400 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
              title="Watch Step-by-Step Video Walkthrough"
              aria-label="Watch Step-by-Step Video Walkthrough"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Video Tour</span>
            </button>
          )}

          {user && (
            <button
              onClick={onOpenDepositModal}
              className="shrink-0 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border hover:border-blue-400 transition-colors text-xs whitespace-nowrap shadow-xs cursor-pointer"
              title="Click to view testnet balance & vault deposit"
            >
              <Lock className="w-3 h-3 text-blue-600 shrink-0" />
              <span className="text-muted-foreground">Vault:</span>
              <span className="font-semibold text-[#09090B] tabular-nums">
                ${(balance ?? 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
              </span>
            </button>
          )}

          {isLoaded && user ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="shrink-0 relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500 bg-gradient-to-tr from-blue-50 to-blue-100 flex items-center justify-center cursor-pointer hover:ring-blue-600 transition-shadow"
              title="Profile & settings"
              aria-label="Profile and Settings"
            >
              {user.avatar && !avatarError ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-[11px] font-bold text-blue-600">
                  {(user.name || user.email || "U").slice(0, 2).toUpperCase()}
                </span>
              )}
            </button>
          ) : (
            <Link
              href="/login"
              className="shrink-0 whitespace-nowrap flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold tracking-wider transition-colors cursor-pointer"
            >
              LOGIN
            </Link>
          )}

          {/* Mobile menu toggle (center nav is hidden below lg) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="lg:hidden shrink-0 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#09090B] hover:text-blue-600 border border-border transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Dropdown Drawer (Zero overlap with top navbar) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-white/95 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            
            {/* Mobile Video Tour Card */}
            {onOpenVideoModal && (
              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenVideoModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-300/50 text-[#09090B] text-xs transition-all shadow-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <span className="font-semibold text-[#09090B]">Watch Video Tour (30s)</span>
                </div>
                <span className="text-[10px] font-mono text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200 shrink-0 font-medium">
                  Interactive
                </span>
              </button>
            )}

            {/* Navigation links grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <Link
                href="/about"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-[#09090B] font-semibold transition-all col-span-2"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>About Founder &amp; Architecture (Manoj S.M.)</span>
              </Link>

              <a
                href="#how-it-works"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-[#09090B] transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>How It Works</span>
              </a>

              <a
                href="#pricing"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-[#09090B] transition-all"
              >
                <span className="w-3.5 h-3.5 flex items-center justify-center text-xs font-bold text-blue-600 font-mono">$</span>
                <span>Pricing</span>
              </a>

              <a
                href="#sandbox"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-[#09090B] transition-all"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Sandbox</span>
              </a>

              <a
                href="#milestones"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-[#09090B] transition-all"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Milestones</span>
              </a>

              <Link
                href="/security"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-[#09090B] transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Security</span>
              </Link>
            </div>

            {/* Mobile Founder Identification */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono">
              <span className="text-slate-500">
                Founded by{" "}
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="font-bold text-[#09090B] hover:text-blue-600 underline decoration-blue-400/40"
                >
                  Manoj S.M.
                </Link>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/aiverisett-startup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-[#09090B]"
                  title="GitHub"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://x.com/ai_verisett"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-[#09090B]"
                  title="Twitter / X"
                >
                  <TwitterXIcon className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Mobile Environment & Additional Links */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono">Env:</span>
                <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono">
                  <button
                    onClick={() => {
                      onToggleEnv("sandbox");
                      closeMobileMenu();
                    }}
                    className={`px-2 py-0.5 rounded-full ${
                      envMode === "sandbox" ? "bg-white text-blue-600 font-medium shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Sandbox
                  </button>
                  <button
                    onClick={() => {
                      onToggleEnv("mainnet");
                      closeMobileMenu();
                    }}
                    className={`px-2 py-0.5 rounded-full ${
                      envMode === "mainnet" ? "bg-white text-blue-600 font-medium shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Live
                  </button>
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                <span>Agent Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Profile & Account Settings Modal */}
      {user && (
        <ProfileSettingsModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onSignOut={signOut}
          onUpdateProfile={updateProfile}
        />
      )}
    </div>
  );
}
