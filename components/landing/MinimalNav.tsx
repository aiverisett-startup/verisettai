"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Lock } from "lucide-react";
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
  vaultBalance,
  onOpenDepositModal,
  onOpenConsole,
  onOpenVideoModal,
  isConsoleView: _isConsoleView = false,
}: MinimalNavProps) {
  const { user, isLoaded, signOut, updateProfile } = useAuthUser();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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

  const formatINR = (cents: number) => {
    const inrValue = (cents / 100) * 83;
    return "₹" + inrValue.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-[#EAE3D2] transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 flex-nowrap min-w-0">
        
        {/* Brand & Navigation Links */}
        <div className="flex items-center gap-4 lg:gap-6 flex-nowrap min-w-0 flex-1">
          {/* Brand Logo */}
          <Link href="/" className="shrink-0 flex items-center group whitespace-nowrap">
            <VerisettLogo size={28} />
          </Link>

          {/* Navigation Links - Single Row, No Wrapping, Minimalist Gray to Gold */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-5 text-sm font-medium text-[#6E675D] flex-nowrap whitespace-nowrap min-w-0">
            <a
              href="#milestones"
              className="hidden xl:inline-block shrink-0 whitespace-nowrap hover:text-[#9E7A45] transition-colors py-0.5"
            >
              Milestones
            </a>
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
              href="#trust"
              className="hidden xl:inline-block shrink-0 whitespace-nowrap hover:text-[#9E7A45] transition-colors py-0.5"
            >
              Security
            </a>
            <a
              href="#developers"
              className="hidden xl:inline-block shrink-0 whitespace-nowrap hover:text-[#9E7A45] transition-colors py-0.5 text-[#9E9689] hover:text-[#9E7A45]"
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
            {onOpenVideoModal && (
              <button
                onClick={onOpenVideoModal}
                className="hidden sm:flex shrink-0 whitespace-nowrap text-[#6E675D] hover:text-[#9E7A45] font-medium transition-colors py-0.5 items-center gap-1.5 cursor-pointer bg-[#FAF8F5] hover:bg-[#F5F1E9] px-2.5 py-0.5 rounded-full border border-[#EAE3D2] text-xs"
                title="Watch Step-by-Step Video Tour"
              >
                <Play className="w-3 h-3 fill-current text-[#9E7A45]" />
                <span>Tour</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-3 flex-nowrap ml-auto z-10">
          {/* Environment Switcher */}
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

          {/* Institutional Testnet Badge (Default/Guest vs Authenticated State) */}
          {!user ? (
            <div className="hidden xl:flex shrink-0 items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EAE3D2] text-xs font-mono shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[#8C8275] text-[11px] font-medium tracking-tight">
                Protocol Testnet Sandbox // Active
              </span>
            </div>
          ) : (
            <button
              onClick={onOpenDepositModal}
              className="hidden sm:flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EAE3D2] hover:border-[#D4AF37] transition-colors text-xs font-mono shadow-xs cursor-pointer"
              title="Click to view testnet balance & vault deposit"
            >
              <Lock className="w-3 h-3 text-[#9E7A45] shrink-0" />
              <span className="text-[#8C8275] text-[11px]">Vault:</span>
              <span className="font-bold text-[#1C1A17] text-xs">
                {balance !== null && balance !== undefined ? balance.toLocaleString() : "0.00"} VRS
              </span>
            </button>
          )}

          {/* Primary CTA: Round Profile Button (if logged in) or Login Button */}
          {isLoaded && user ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="shrink-0 flex items-center gap-2 p-1 pl-1 pr-2.5 sm:pr-3 rounded-full bg-white hover:bg-[#FAF6EE] border border-[#EAE3D2] hover:border-[#D4AF37] transition-all duration-200 shadow-xs hover:shadow-md group cursor-pointer z-10"
              title="Click to view profile & settings"
            >
              {/* Round Profile with Google Image / Avatar */}
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

              {/* User Name & Status Label */}
              <div className="hidden sm:flex flex-col text-left pr-0.5 min-w-0">
                <span className="text-[11px] font-bold text-[#1C1A17] group-hover:text-[#9E7A45] transition-colors leading-tight truncate max-w-[90px]">
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
              className="shrink-0 whitespace-nowrap flex items-center justify-center px-5 py-2 rounded-full bg-[#C59B5F] hover:bg-[#B38A4F] text-white text-xs sm:text-sm font-semibold tracking-wider transition-all shadow-[0_4px_14px_rgba(197,155,95,0.35)] hover:shadow-[0_6px_20px_rgba(197,155,95,0.45)] hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer"
            >
              LOGIN
            </Link>
          )}
        </div>

      </div>

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
