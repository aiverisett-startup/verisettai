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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[#EAE3D2] transition-all">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap min-w-0">
        
        {/* Brand & Desktop Navigation Links */}
        <div className="flex items-center gap-4 lg:gap-6 flex-nowrap min-w-0">
          {/* Brand Logo */}
          <Link href="/" className="shrink-0 flex items-center group whitespace-nowrap">
            <VerisettLogo size={28} />
          </Link>

          {/* Desktop Navigation Links - Shown on large screens (xl+) to prevent any overlap */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-5 text-sm font-medium text-[#6E675D] flex-nowrap whitespace-nowrap min-w-0">
            <a
              href="#how-it-works"
              className="shrink-0 whitespace-nowrap hover:text-[#9E7A45] transition-colors py-0.5"
            >
              How It Works
            </a>
            <a
              href="#sandbox"
              className="shrink-0 whitespace-nowrap hover:text-[#9E7A45] transition-colors py-0.5"
            >
              Sandbox
            </a>
            <a
              href="#milestones"
              className="shrink-0 whitespace-nowrap hover:text-[#9E7A45] transition-colors py-0.5"
            >
              Milestones
            </a>
            <a
              href="#trust"
              className="shrink-0 whitespace-nowrap hover:text-[#9E7A45] transition-colors py-0.5"
            >
              Security
            </a>
            <a
              href="#developers"
              className="shrink-0 whitespace-nowrap hover:text-[#9E7A45] transition-colors py-0.5 text-[#9E9689] hover:text-[#9E7A45]"
            >
              Docs
            </a>
            <Link
              href="/network"
              className="hidden 2xl:flex shrink-0 whitespace-nowrap text-[#9E7A45] hover:text-[#C59B5F] font-semibold transition-colors py-0.5 items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#C59B5F] animate-pulse" />
              <span>3D Network</span>
            </Link>
            <Link
              href="/dashboard"
              className="shrink-0 whitespace-nowrap text-[#1C1A17] hover:text-[#C59B5F] font-semibold transition-colors py-0.5"
            >
              Agent Console →
            </Link>
          </nav>
        </div>

        {/* Right Actions - Carefully bounded & sized to eliminate any collisions */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2.5 flex-nowrap ml-auto z-10">
          
          {/* Watch Video Tour Button (Always visible without pushing other items) */}
          {onOpenVideoModal && (
            <button
              onClick={onOpenVideoModal}
              className="shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#FAF6EE] hover:bg-[#F5EBD7] text-[#9E7A45] hover:text-[#7A5B2E] border border-[#D4AF37]/50 hover:border-[#D4AF37] font-semibold text-xs tracking-tight transition-all duration-200 shadow-xs cursor-pointer group"
              title="Watch Step-by-Step Video Walkthrough"
              aria-label="Watch Step-by-Step Video Walkthrough"
            >
              <div className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9E7A45]" />
              </div>
              <Play className="w-3 h-3 fill-[#9E7A45] text-[#9E7A45] group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-[#1C1A17] font-medium text-xs whitespace-nowrap hidden sm:inline">
                Video Tour
              </span>
              <span className="text-[#1C1A17] font-medium text-xs whitespace-nowrap sm:hidden">
                Tour
              </span>
            </button>
          )}

          {/* Environment Switcher (Visible on md+ so it never crowds mobile) */}
          <div className="shrink-0 hidden md:flex items-center p-0.5 rounded-full bg-[#F9F8F6] border border-[#EAE3D2] text-xs font-mono">
            <button
              onClick={() => onToggleEnv("sandbox")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                envMode === "sandbox"
                  ? "bg-white text-[#9E7A45] shadow-xs font-medium border border-[#EAE3D2]"
                  : "text-[#8C8275] hover:text-[#1C1A17]"
              }`}
            >
              Sandbox
            </button>
            <button
              onClick={() => onToggleEnv("mainnet")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                envMode === "mainnet"
                  ? "bg-white text-[#9E7A45] shadow-xs font-medium border border-[#EAE3D2]"
                  : "text-[#8C8275] hover:text-[#1C1A17]"
              }`}
            >
              Live
            </button>
          </div>

          {/* Vault Balance (Protected to wide screens so it never squeezes the profile button) */}
          {user && (
            <button
              onClick={onOpenDepositModal}
              className="hidden 2xl:flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EAE3D2] hover:border-[#D4AF37] transition-colors text-xs font-mono shadow-xs cursor-pointer"
              title="Click to view testnet balance & vault deposit"
            >
              <Lock className="w-3 h-3 text-[#9E7A45] shrink-0" />
              <span className="text-[#8C8275] text-[11px]">Vault:</span>
              <span className="font-bold text-[#1C1A17] text-xs">
                {balance !== null && balance !== undefined ? balance.toLocaleString() : "0.00"} VRS
              </span>
            </button>
          )}

          {/* Primary CTA: Clean Round Profile Button or Login Button */}
          {isLoaded && user ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="shrink-0 flex items-center gap-2 p-1 pl-1 pr-1.5 sm:pr-2.5 rounded-full bg-white hover:bg-[#FAF6EE] border border-[#EAE3D2] hover:border-[#D4AF37] transition-all duration-200 shadow-xs hover:shadow-md group cursor-pointer"
              title="Click to view profile & settings"
              aria-label="Profile and Settings"
            >
              {/* Round Profile Avatar with Gold Border */}
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#D4AF37] bg-gradient-to-tr from-[#FAF1E3] to-[#F5E8D0] flex items-center justify-center shrink-0 shadow-2xs">
                {user.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="text-[11px] font-bold text-[#9E7A45] font-mono">
                    {(user.name || user.email || "U").slice(0, 2).toUpperCase()}
                  </span>
                )}
                {/* Active Session Status Dot */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              {/* User Name & Status Label (Shown on lg+ to prevent any cramped wrapping) */}
              <div className="hidden lg:flex flex-col text-left pr-0.5 min-w-0">
                <span className="text-[11px] font-bold text-[#1C1A17] group-hover:text-[#9E7A45] transition-colors leading-tight truncate max-w-[75px]">
                  {user.name.split(" ")[0]}
                </span>
                <span className="text-[9px] text-[#8C8275] font-mono leading-none">
                  Settings
                </span>
              </div>
            </button>
          ) : (
            <Link
              href="/login"
              className="shrink-0 whitespace-nowrap flex items-center justify-center px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#C59B5F] hover:bg-[#B38A4F] text-white text-xs sm:text-sm font-semibold tracking-wider transition-all shadow-[0_4px_14px_rgba(197,155,95,0.35)] hover:shadow-[0_6px_20px_rgba(197,155,95,0.45)] cursor-pointer"
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
            className="xl:hidden p-2 rounded-full bg-[#FAF6EE] hover:bg-[#F5EBD7] text-[#1C1A17] hover:text-[#9E7A45] border border-[#EAE3D2] transition-colors cursor-pointer shrink-0 ml-1"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Dropdown Drawer (Zero overlap with top navbar) */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-[#EAE3D2] bg-white/95 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            
            {/* Navigation links grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <a
                href="#how-it-works"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] hover:border-[#D4AF37] text-[#1C1A17] transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#C59B5F]" />
                <span>How It Works</span>
              </a>

              <a
                href="#sandbox"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] hover:border-[#D4AF37] text-[#1C1A17] transition-all"
              >
                <Terminal className="w-3.5 h-3.5 text-[#C59B5F]" />
                <span>Sandbox</span>
              </a>

              <a
                href="#milestones"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] hover:border-[#D4AF37] text-[#1C1A17] transition-all"
              >
                <Cpu className="w-3.5 h-3.5 text-[#C59B5F]" />
                <span>Milestones</span>
              </a>

              <a
                href="#trust"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] hover:border-[#D4AF37] text-[#1C1A17] transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C59B5F]" />
                <span>Security</span>
              </a>
            </div>

            {/* Mobile Environment & Additional Links */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F0E9DC] text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8C8275] font-mono">Env:</span>
                <div className="flex items-center p-0.5 rounded-full bg-[#F9F8F6] border border-[#EAE3D2] text-[11px] font-mono">
                  <button
                    onClick={() => {
                      onToggleEnv("sandbox");
                      closeMobileMenu();
                    }}
                    className={`px-2 py-0.5 rounded-full ${
                      envMode === "sandbox" ? "bg-white text-[#9E7A45] font-medium shadow-2xs" : "text-[#8C8275]"
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
                      envMode === "mainnet" ? "bg-white text-[#9E7A45] font-medium shadow-2xs" : "text-[#8C8275]"
                    }`}
                  >
                    Live
                  </button>
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className="inline-flex items-center gap-1 font-semibold text-[#C59B5F] hover:text-[#9E7A45] transition-colors"
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
