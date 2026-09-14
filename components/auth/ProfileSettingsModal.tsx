"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  LogOut,
  Copy,
  Check,
  ExternalLink,
  Lock,
  User,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Edit2,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { AuthUser } from "@/lib/useAuthUser";

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
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [imageError, setImageError] = useState(false);

  const accountId = user.accountId || "VAULT-2026-IN-982";

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

  return (
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
            className="relative w-full max-w-lg rounded-3xl bg-white border border-[#EAE3D2] shadow-[0_24px_64px_rgba(197,155,95,0.18)] overflow-hidden font-montserrat text-[#1C1A17] z-10"
          >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F0E9DC] px-6 py-4 bg-[#FDFCF9]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FAF6EE] border border-[#EAE3D2] text-[#9E7A45]">
                  <ShieldCheck className="w-4 h-4 text-[#C59B5F]" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#1C1A17] tracking-tight">
                  Profile & Account Settings
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[#8C8275] hover:text-[#1C1A17] hover:bg-[#FAF6EE] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
              {/* User Identity Hero Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                {/* Round Profile Avatar with Google Image */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-white overflow-hidden bg-gradient-to-tr from-[#FAF1E3] to-[#F5E8D0] flex items-center justify-center shadow-md">
                    {user.avatar && !imageError ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-lg font-bold text-[#9E7A45] font-mono">
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
                          className="px-2 py-1 text-sm font-bold border border-[#D4AF37] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          className="p-1.5 text-xs bg-[#C59B5F] text-white rounded-lg hover:bg-[#B38A4F] cursor-pointer"
                          title="Save Name"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#1C1A17] truncate">
                          {user.name}
                        </h3>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="text-[#8C8275] hover:text-[#C59B5F] transition-colors p-0.5"
                          title="Edit Display Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#6E675D] truncate">{user.email}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Account</span>
                    </span>

                    {user.provider === "google" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#6E675D] border border-[#EAE3D2]">
                        <GoogleIcon className="w-3 h-3" />
                        <span>Google SSO</span>
                      </span>
                    )}

                    {user.provider !== "google" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#6E675D] border border-[#EAE3D2] uppercase font-mono">
                        {user.provider}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Institutional Vault Custody Card */}
              <div className="rounded-2xl bg-white border border-[#EAE3D2] p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F0E9DC]">
                  <span className="text-[#8C8275]">Vault Account Ref</span>
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#9E7A45] hover:text-[#C59B5F] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#EAE3D2] cursor-pointer"
                    title="Click to copy account ID"
                  >
                    <span>{accountId}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <div className="text-[10px] text-[#8C8275]">Vault Available Balance</div>
                    <div className="text-sm font-bold font-mono text-[#1C1A17] mt-0.5">
                      10,000 VRS
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
                    <div className="text-[10px] text-[#8C8275]">Frozen in Escrow</div>
                    <div className="text-sm font-bold font-mono text-[#C59B5F] mt-0.5">
                      0.00 VRS
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Security & Permissions Overview */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-semibold text-[#8C8275] uppercase tracking-wider">
                  Security & Protocol Settings
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FDFCF9] border border-[#EAE3D2]">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-[#C59B5F]" />
                    <div>
                      <div className="font-semibold text-[#1C1A17]">Multi-Sig Vault Protection</div>
                      <div className="text-[11px] text-[#8C8275]">Bank-grade 2-of-2 release invariant</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FDFCF9] border border-[#EAE3D2]">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#C59B5F]" />
                    <div>
                      <div className="font-semibold text-[#1C1A17]">FastMCP Agent Clearinghouse</div>
                      <div className="text-[11px] text-[#8C8275]">Sub-50ms automated escrow execution</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#9E7A45] border border-[#EAE3D2] font-medium">
                    v2.4
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] text-white font-semibold text-xs tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <span>ENTER AGENT CONSOLE</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleSignOutClick}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 hover:border-red-300 text-red-700 bg-red-50/50 hover:bg-red-50 font-medium text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Verisett</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
