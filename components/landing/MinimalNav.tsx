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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 flex-nowrap min-w-0">
        
        {/* Brand & Desktop Navigation Links */}
        <div className="flex items-center gap-3 lg:gap-5 flex-nowrap min-w-0">
          {/* Brand Logo */}
          <Link href="/" className="shrink-0 flex items-center group whitespace-nowrap">
            <VerisettLogo size={28} />
          </Link>

          {/* Prominent Founder Identification */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-[11px] font-mono whitespace-nowrap">
            <span className="text-slate-500">
              Founded &amp; Architected by{" "}
              <Link
                href="/about"
                className="font-bold text-[#09090B] hover:text-blue-600 transition-colors underline decoration-blue-400/40 underline-offset-2"
              >
                Manoj S.M.
              </Link>
            </span>
            <div className="flex items-center gap-1.5 ml-1">
              <a
                href="https://github.com/aiverisett-startup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-[#09090B] transition-colors"
                title="GitHub: Manoj S.M."
              >
                <GithubIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://x.com/ai_verisett"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-[#09090B] transition-colors"
                title="Twitter / X: Manoj S.M."
              >
                <TwitterXIcon className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-sm font-medium text-slate-600 flex-nowrap whitespace-nowrap min-w-0">
            <Link
              href="/about"
              className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors py-0.5 text-[#09090B] font-semibold"
            >
              About
            </Link>
            <a
              href="#how-it-works"
              className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors py-0.5"
            >
              How It Works
            </a>
            <a
              href="#sandbox"
              className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors py-0.5"
            >
              Sandbox
            </a>
            <a
              href="#milestones"
              className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors py-0.5"
            >
              Milestones
            </a>
            <Link
              href="/security"
              className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors py-0.5 font-medium"
            >
              Security
            </Link>
            <Link
              href="/docs"
              className="shrink-0 whitespace-nowrap hover:text-blue-600 transition-colors py-0.5 text-slate-500 hover:text-blue-600"
            >
              Docs
            </Link>
            <Link
              href="/network"
              className="hidden 2xl:flex shrink-0 whitespace-nowrap text-blue-600 hover:text-blue-500 font-semibold transition-colors py-0.5 items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>3D Network</span>
            </Link>
          </nav>
        </div>

        {/* Right Actions - Properly spaced (gap-3) & flex-wrapped to prevent overlap */}
        <div className="shrink-0 flex items-center gap-3 flex-wrap ml-auto z-10">
          
          {/* Watch Video Tour Button (Shown cleanly on sm+ to prevent cramming mobile topbar) */}
          {onOpenVideoModal && (
            <button
              onClick={onOpenVideoModal}
              className="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-300 hover:border-blue-400 font-semibold text-xs tracking-tight transition-all duration-200 shadow-xs cursor-pointer group"
              title="Watch Step-by-Step Video Walkthrough"
              aria-label="Watch Step-by-Step Video Walkthrough"
            >
              <div className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </div>
              <Play className="w-3 h-3 fill-blue-600 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-[#09090B] font-medium text-xs whitespace-nowrap">
                Video Tour
              </span>
            </button>
          )}

          {/* Environment Switcher (Visible on md+ so it never crowds mobile) */}
          <div className="shrink-0 hidden md:flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono">
            <button
              onClick={() => onToggleEnv("sandbox")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                envMode === "sandbox"
                  ? "bg-white text-blue-600 shadow-xs font-medium border border-slate-200"
                  : "text-slate-500 hover:text-[#09090B]"
              }`}
            >
              Sandbox
            </button>
            <button
              onClick={() => onToggleEnv("mainnet")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                envMode === "mainnet"
                  ? "bg-white text-blue-600 shadow-xs font-medium border border-slate-200"
                  : "text-slate-500 hover:text-[#09090B]"
              }`}
            >
              Live
            </button>
          </div>

          {/* Vault Balance (Protected to wide screens so it never squeezes the profile button) */}
          {user && (
            <button
              onClick={onOpenDepositModal}
              className="hidden 2xl:flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-400 transition-colors text-xs font-mono shadow-xs cursor-pointer"
              title="Click to view testnet balance & vault deposit"
            >
              <Lock className="w-3 h-3 text-blue-600 shrink-0" />
              <span className="text-slate-500 text-[11px]">Vault:</span>
              <span className="font-bold text-[#09090B] text-xs">
                ${(balance !== null && balance !== undefined ? balance : 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
              </span>
            </button>
          )}

          {/* Primary CTA: Clean Round Profile Button or Login Button */}
          {isLoaded && user ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="shrink-0 flex items-center gap-2 p-1 pl-1 pr-1.5 sm:pr-2.5 rounded-full bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-400 transition-all duration-200 shadow-xs hover:shadow-md group cursor-pointer"
              title="Click to view profile & settings"
              aria-label="Profile and Settings"
            >
              {/* Round Profile Avatar with Electric Blue Border */}
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500 bg-gradient-to-tr from-blue-50 to-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                {user.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="text-[11px] font-bold text-blue-600 font-mono">
                    {(user.name || user.email || "U").slice(0, 2).toUpperCase()}
                  </span>
                )}
                {/* Active Session Status Dot */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              {/* User Name & Status Label (Shown on lg+ to prevent any cramped wrapping) */}
              <div className="hidden lg:flex flex-col text-left pr-0.5 min-w-0">
                <span className="text-[11px] font-bold text-[#09090B] group-hover:text-blue-600 transition-colors leading-tight truncate max-w-[75px]">
                  {user.name.split(" ")[0]}
                </span>
                <span className="text-[9px] text-slate-500 font-mono leading-none">
                  Settings
                </span>
              </div>
            </button>
          ) : (
            <Link
              href="/login"
              className="shrink-0 whitespace-nowrap flex items-center justify-center px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold tracking-wider transition-all shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] cursor-pointer"
            >
              LOGIN
            </Link>
          )}

          {/* Mobile & Tablet Navigation Menu Toggle Button (Visible below xl) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="xl:hidden p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#09090B] hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer shrink-0 ml-1"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Dropdown Drawer (Zero overlap with top navbar) */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
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
    </header>
  );
}
