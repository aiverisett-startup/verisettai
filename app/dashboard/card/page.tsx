import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, KeyRound, Cpu, Layers } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { EnterpriseMemberCard } from "@/components/dashboard/EnterpriseMemberCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VIP Operator Digital Member Card // Verisett AI",
  description: "Tier 3 Enterprise programmatic 3D member asset with titanium & obsidian cryptographic credentials.",
};

export default async function MemberCardPage() {
  let userProfile = {
    id: "guest-operator",
    name: "Manoj S. M.",
    email: "operator@veri-sett.com",
    planTier: "FREE",
    planAmount: 0,
    operatorId: "#0042",
  };

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email, plan_tier")
        .eq("id", user.id)
        .maybeSingle();

      userProfile = {
        id: user.id,
        name: profile?.name || user.user_metadata?.full_name || (user.email ? user.email.split("@")[0].toUpperCase() : "Manoj S. M."),
        email: user.email || "operator@veri-sett.com",
        planTier: profile?.plan_tier || "FREE",
        planAmount: profile?.plan_tier?.toUpperCase() === "ENTERPRISE" ? 30000 : 0,
        operatorId: `#${user.id.replace(/-/g, "").slice(0, 4)}`,
      };
    }
  } catch (err) {
    console.warn("[MEMBER_CARD_AUTH_NOTE]: Using default operator context", err);
  }

  return (
    <div className="relative min-h-screen bg-[#070b16] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Background Ambient Radial Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.18),rgba(37,99,235,0.12),transparent_75%)] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none -z-10" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#070b16]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="mx-auto flex max-w-6xl items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1.5 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>HOST LEVEL PROTOCOL PASS</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Title & Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-400 bg-cyan-950/50 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE ASSET (TIER 3)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            3D Digital Member Asset
          </h1>

          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Programmatic brushed titanium, obsidian, and cybernetic circuit card for sovereign agent clearinghouses and host-level operators.
          </p>
        </div>

        {/* The 3D Member Card Component */}
        <div className="py-4">
          <EnterpriseMemberCard user={userProfile} />
        </div>

        {/* Security & Specification Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-blue-500/20 backdrop-blur-xl space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>Physical Material Spec</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Titanium Grade-5 edge chamfer with deep obsidian silicon alloy core and holographic EMV gold contact micro-routing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-blue-500/20 backdrop-blur-xl space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <KeyRound className="w-4 h-4" />
              <span>Host-Level Enclave</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Authorizes direct machine-to-machine clearinghouse task creation and automatic AWS Nitro enclave multi-sig vault disbursement.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-blue-500/20 backdrop-blur-xl space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>Sovereignty Proof</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Cryptographically signed with ed25519 node keys and verifiable on-chain with SHA-256 state matching.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
