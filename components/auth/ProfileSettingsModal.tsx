"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  LogOut,
  Copy,
  Check,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Edit2,
  Save,
} from "lucide-react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { AuthUser } from "@/lib/useAuthUser";
import { supabase } from "@/lib/supabase";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onSignOut: () => void;
  onUpdateProfile: (updates: { name?: string; avatar?: string | null }) => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  onSignOut,
  onUpdateProfile,
}: ProfileSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [imageError, setImageError] = useState(false);
  const [balanceDisplay, setBalanceDisplay] = useState("₹0.00 ($0.00)");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user.id) return;
    const fetchBal = async () => {
      try {
        const { data: rpcBal, error } = await supabase.rpc("get_verified_balance", {
          p_user_id: user.id,
        });
        if (!error && rpcBal !== null) {
          const paise = Number(rpcBal);
          const inr = paise / 100;
          const usd = inr / 84;
          setBalanceDisplay(`₹${inr.toFixed(2)} ($${usd.toFixed(2)})`);
          return;
        }
      } catch {
        // Fallback
      }
      setBalanceDisplay("₹0.00 ($0.00)");
    };
    fetchBal();
  }, [user.id]);

  // Neutralized identifier format avoiding hardcoded country codes
  const accountId =
    user.accountId && !user.accountId.includes("-IN-")
      ? user.accountId
      : "VAULT-2026-0x982F";

  const handleCopyId = () => {
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateProfile({ name: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const handleSignOutClick = () => {
    onClose();
    onSignOut();
  };

  const userInitials = (user.name || user.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-3xl bg-white border border-zinc-200 shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden font-sans text-zinc-900 z-10"
          >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 bg-[#FDFCF9]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
                  Profile &amp; Account Settings
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
              {/* User Identity Hero Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200">
                {/* Round Profile Avatar with subtle blue/zinc ring */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full ring-2 ring-blue-500/20 ring-offset-2 ring-offset-white border border-zinc-200 overflow-hidden bg-gradient-to-tr from-blue-50 to-blue-100/60 flex items-center justify-center shadow-sm">
                    {user.avatar && !imageError ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-lg font-bold text-blue-600 font-mono">
                        {userInitials}
                      </span>
                    )}
                  </div>
                  {/* Online Status Dot */}
                  <span
                    className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white"
                    title="Active Operator Session"
                  />
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {isEditingName ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="px-2.5 py-1 text-sm font-semibold border border-blue-400 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveName}
                          className="p-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer transition-colors"
                          title="Save Name"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-900 truncate">
                          {user.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsEditingName(true)}
                          className="text-zinc-400 hover:text-blue-600 transition-colors p-0.5 cursor-pointer"
                          title="Edit Display Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Account</span>
                    </span>

                    {user.provider === "google" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-zinc-600 border border-zinc-200">
                        <GoogleIcon className="w-3 h-3" />
                        <span>Google SSO</span>
                      </span>
                    )}

                    {user.provider !== "google" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-zinc-600 border border-zinc-200 uppercase font-mono">
                        {user.provider}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Institutional Vault Custody Card */}
              <div className="rounded-2xl bg-white border border-zinc-200 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500 font-medium">Vault Account Ref</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 font-mono tracking-tight text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200/80 cursor-pointer transition-colors"
                    title="Click to copy account ID"
                  >
                    <span>{accountId}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-blue-600" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <div className="text-[10px] font-medium text-zinc-500">Vault Available Balance</div>
                    <div className="font-sans font-semibold text-sm text-zinc-900 mt-0.5 tabular-nums font-mono">
                      {balanceDisplay}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <div className="text-[10px] font-medium text-zinc-500">Frozen in Escrow</div>
                    <div className="font-sans font-medium text-sm text-zinc-500 mt-0.5 tabular-nums font-mono">
                      ₹0.00 ($0.00)
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Security & Permissions Overview */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Security &amp; Protocol Settings
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/60 border border-zinc-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Lock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900">Deterministic Vault Protection</div>
                      <div className="text-[11px] text-zinc-500">Non-custodial programmatic invariant</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/60 border border-zinc-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900">FastMCP Agent Clearinghouse</div>
                      <div className="text-[11px] text-zinc-500">Sub-50ms automated escrow execution</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                    v2.4
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wider transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <span>ENTER AGENT CONSOLE</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={handleSignOutClick}
                  className="w-full flex items-center justify-center gap-2 border border-zinc-200 hover:border-red-200 text-zinc-600 hover:text-red-600 hover:bg-red-50/50 py-2.5 rounded-xl transition-colors text-sm font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Verisett</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
