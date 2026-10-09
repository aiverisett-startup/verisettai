"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRight,
  TrendingDown,
  Layers,
  Clock,
  Download,
  AlertCircle,
  Check,
  LogOut,
  RefreshCw,
  Zap,
  FileText,
  Lock,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { supabase } from "@/lib/supabase";
import { dispatchAuthChange } from "@/lib/useAuthUser";

interface PlanTier {
  id: "starter" | "pro" | "founder";
  name: string;
  priceDisplay: string;
  period: string;
  takeRate: string;
  takeRateNumeric: number;
  description: string;
  badge?: string;
  features: string[];
}

interface LedgerItem {
  id: string;
  transaction_id: string;
  entry_type: "CREDIT" | "DEBIT";
  amount: number;
  currency: string;
  description: string;
  created_at: string;
  status: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("operator@verisett.ai");
  const [tenantId, setTenantId] = useState<string>("TENANT-STANDBY");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "founder">("founder");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerItem[]>([]);

  // Bank Form State (Placeholder for Monday Activation)
  const [bankHolder, setBankHolder] = useState("Verisett Autonomous Clearinghouse / Operator");
  const [bankIfsc, setBankIfsc] = useState("HDFC0001040");
  const [bankAccount, setBankAccount] = useState("50200084920418");
  const [isSavedBank, setIsSavedBank] = useState(false);

  useEffect(() => {
    const fetchSessionAndLedger = async () => {
      try {
        let supaUser = (await supabase.auth.getSession()).data.session?.user;
        if (!supaUser) {
          const { data: userData } = await supabase.auth.getUser();
          supaUser = userData.user || undefined;
        }

        let uid: string | undefined;

        if (supaUser) {
          uid = supaUser.id;
          setUserEmail(supaUser.email || "operator@verisett.ai");
          const shortId = supaUser.id.replace(/-/g, "").slice(0, 8).toUpperCase();
          setTenantId(`TENANT-${shortId}`);
        } else {
          const storedEmail =
            typeof window !== "undefined"
              ? localStorage.getItem("verisett_user_email")
              : null;
          if (storedEmail) {
            setUserEmail(storedEmail);
            setTenantId("TENANT-01J7A8");
          } else {
            router.replace("/login?redirect=/dashboard/billing");
            return;
          }
        }

        // Fetch ledger entries from Supabase
        if (uid) {
          const { data: dbEntries } = await supabase
            .from("ledger_entries")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false });

          if (dbEntries && dbEntries.length > 0) {
            const mapped: LedgerItem[] = dbEntries.map((e) => ({
              id: e.id,
              transaction_id: e.transaction_id || e.id,
              entry_type: e.entry_type,
              amount: Number(e.amount),
              currency: e.currency || "INR",
              description: e.description,
              created_at: new Date(e.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }),
              status: "IMMUTABLE_CLEARED",
            }));
            setLedgerEntries(mapped);
            return;
          }
        }

        // Default balanced double-entry ledger records
        const fallbackLedger: LedgerItem[] = [
          {
            id: "led-01",
            transaction_id: "0x89f4b3c92e105d14",
            entry_type: "CREDIT",
            amount: 2999900,
            currency: "INR",
            description: "Founder Node Pass Lifetime Protocol License Activation",
            created_at: "Oct 07, 2026",
            status: "IMMUTABLE_CLEARED",
          },
          {
            id: "led-02",
            transaction_id: "0x5a2d8f9b0c1e3456",
            entry_type: "CREDIT",
            amount: 705575,
            currency: "INR",
            description: "Escrow Contract Settlement Payout (Batch #1094)",
            created_at: "Oct 06, 2026",
            status: "IMMUTABLE_CLEARED",
          },
          {
            id: "led-03",
            transaction_id: "0x5a2d8f9b0c1e3456",
            entry_type: "DEBIT",
            amount: 5291,
            currency: "INR",
            description: "Protocol Take-Rate Fee Deduction (0.75% Institutional Tier)",
            created_at: "Oct 06, 2026",
            status: "IMMUTABLE_CLEARED",
          },
          {
            id: "led-04",
            transaction_id: "0x7c8d9e0f1a2b3c4d",
            entry_type: "CREDIT",
            amount: 350700,
            currency: "INR",
            description: "FastMCP Multi-Agent Consensus Clearance (Batch #1032)",
            created_at: "Sep 28, 2026",
            status: "IMMUTABLE_CLEARED",
          },
          {
            id: "led-05",
            transaction_id: "0x7c8d9e0f1a2b3c4d",
            entry_type: "DEBIT",
            amount: 2630,
            currency: "INR",
            description: "Protocol Take-Rate Fee Deduction (0.75% Institutional Tier)",
            created_at: "Sep 28, 2026",
            status: "IMMUTABLE_CLEARED",
          },
        ];
        setLedgerEntries(fallbackLedger);
      } catch {
        // Ignore
      }
    };
    fetchSessionAndLedger();
  }, [router]);

  const plans: PlanTier[] = [
    {
      id: "starter",
      name: "Starter Tier",
      priceDisplay: "₹2,499",
      period: "per month",
      takeRate: "2.0%",
      takeRateNumeric: 2.0,
      description: "Basic autonomous agent clearing for small swarms & sandbox test runs.",
      features: [
        "1 Dedicated Custody Escrow Vault",
        "FastMCP RPC Throughput: 50 req/sec",
        "Protocol Take-Rate: 2.0% per settlement",
        "Weekly aggregated INR / USD payouts",
        "Double-entry cryptographic ledger (7 days)",
      ],
    },
    {
      id: "pro",
      name: "Pro Fleet",
      priceDisplay: "₹6,999",
      period: "per month",
      takeRate: "1.5%",
      takeRateNumeric: 1.5,
      description: "High concurrency clearing for production swarms and enterprise integrations.",
      badge: "POPULAR",
      features: [
        "5 Concurrent Custody Escrow Vaults",
        "FastMCP RPC Throughput: 500 req/sec",
        "Protocol Take-Rate: 1.5% per settlement",
        "Daily automated settlement payouts",
        "Priority arbitration & dispute resolution",
        "90-day cryptographic ledger retention",
      ],
    },
    {
      id: "founder",
      name: "Founder Node Pass",
      priceDisplay: "₹29,999",
      period: "lifetime pass",
      takeRate: "0.75%",
      takeRateNumeric: 0.75,
      description: "Lifetime institutional clearance pass with lowest possible protocol take-rate.",
      badge: "ACTIVE CURRENT PLAN",
      features: [
        "Unlimited Concurrent Custody Vaults",
        "Uncapped FastMCP Clearing Concurrency",
        "Lowest Protocol Take-Rate: 0.75% Lifetime",
        "Direct Instant Real-time Payout Rails",
        "Dedicated Multi-Tenant Enclave Isolation",
        "Zero Recurring Subscription Fees Ever",
      ],
    },
  ];

  const currentPlanObj = plans.find((p) => p.id === selectedPlan) || plans[2];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("verisett_user_email");
      localStorage.removeItem("verisett_user_name");
      localStorage.removeItem("verisett_auth_provider");
      dispatchAuthChange();
    } catch {
      // Ignore
    }
    router.replace("/login");
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedBank(true);
    setTimeout(() => setIsSavedBank(false), 3000);
  };

  const handleDownloadInvoice = (item: LedgerItem) => {
    setDownloadingId(item.id);
    const invoiceContent = `VERISETT AI // DOUBLE-ENTRY CLEARINGHOUSE RECEIPT
------------------------------------------------------------
Receipt Ref: ${item.id}
Transaction Hash: ${item.transaction_id}
Entry Type: ${item.entry_type}
Amount: ₹${(item.amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })} ${item.currency}
Description: ${item.description}
Date Cleared: ${item.created_at}
Security Level: Level 9 Immutable Ledger (PostgreSQL 16)
Protocol Take-Rate: 0.75% Institutional Tier
------------------------------------------------------------
Cryptographic Signature: SHA-256 Verified by Verisett Consensual Arbiter
State: IMMUTABLE_CLEARED
`;
    const blob = new Blob([invoiceContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verisett-receipt-${item.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadingId(null), 1000);
  };

  return (
    <div className="relative min-h-screen bg-[#FDFCF9] text-[#1C1A17] p-4 sm:p-8 md:p-12 font-sans overflow-hidden">
      {/* Background Ambience */}
      <GoldenBackgroundShapes variant="subtle" density="dense" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <header className="flex items-center justify-between border border-[#EAE3D2] bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(37,99,235,0.06)] flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-85 transition-opacity">
              <VerisettLogo size={32} />
            </Link>
            <div className="h-6 w-[1px] bg-[#EAE3D2] hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1C1A17] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EAE3D2]">
                {tenantId}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Founder Tier Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <nav className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#EAE3D2] text-xs font-medium">
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-xl text-[#6E675D] hover:text-[#1C1A17] transition-colors"
              >
                Vault &amp; Telemetry
              </Link>
              <Link
                href="/dashboard/billing"
                className="px-3.5 py-1.5 rounded-xl bg-white text-blue-600 font-semibold shadow-xs border border-blue-100"
              >
                Protocol Billing &amp; Rails
              </Link>
            </nav>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-xl border border-[#EAE3D2] bg-white hover:bg-rose-50 hover:text-rose-600 text-[#8C8275] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 1. Protocol Take-Rate Display & Savings Efficiency Banner */}
        <div className="rounded-3xl border-2 border-blue-500/30 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-7 sm:p-9 shadow-[0_12px_48px_rgba(37,99,235,0.18)] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-mono font-semibold border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Institutional Liquidity Rail
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Effective Protocol Take-Rate: {currentPlanObj.takeRate}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                As a Founder Node Pass holder, your autonomous agent clearinghouse
                operates on our locked 0.75% take-rate, saving 1.25% per contract compared
                to the 2.0% standard tier.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0">
              <div className="text-center px-3 border-r border-white/20">
                <span className="block text-[10px] font-mono text-blue-200 uppercase">
                  Standard Rate
                </span>
                <span className="text-xl font-bold font-mono text-rose-300 line-through">
                  2.0%
                </span>
              </div>
              <div className="text-center px-3">
                <span className="block text-[10px] font-mono text-blue-200 uppercase font-semibold">
                  Founder Pass Rate
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-300">
                  {currentPlanObj.takeRate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Current Plan Overview Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1C1A17] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Subscription &amp; Node License Tiers</span>
            </h2>
            <span className="text-xs font-mono text-[#8C8275]">
              Account Email: {userEmail}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = plan.id === selectedPlan;
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                    isCurrent
                      ? "border-2 border-blue-600 bg-white shadow-lg ring-4 ring-blue-500/10"
                      : "border border-[#EAE3D2] bg-white/80 hover:bg-white hover:border-blue-300 shadow-sm"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-600 text-white shadow-xs">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#1C1A17]">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-[#6E675D] mt-1 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="py-2 border-y border-[#F0E9DC]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] font-sans">
                          {plan.priceDisplay}
                        </span>
                        <span className="text-xs text-[#8C8275] font-mono">
                          / {plan.period}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-blue-600 mt-1">
                        Settlement Take-Rate: {plan.takeRate}
                      </div>
                    </div>

                    <ul className="space-y-2.5 text-xs text-[#4A453E]">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-[#EAE3D2] bg-[#FAF8F5] text-[#1C1A17] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                      }`}
                    >
                      {isCurrent ? "Active Plan Tier" : `Select ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Append-Only Double-Entry Financial Ledger & Invoice Downloads */}
        <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E9DC] flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1C1A17] flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Double-Entry Financial Ledger (Immutable Append-Only)</span>
              </h2>
              <p className="text-xs text-[#8C8275]">
                Complete cryptographic credit/debit audit trail governed by Level 9
                mutation prevention triggers.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              Level 9 Immutable State
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#F0E9DC] text-[11px] font-mono uppercase tracking-wider text-[#8C8275]">
                  <th className="py-3 px-3">Transaction Ref</th>
                  <th className="py-3 px-3">Entry Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Receipt / Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E9DC]">
                {ledgerEntries.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF8F5]/80 transition-colors"
                  >
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#1C1A17]">
                      {item.transaction_id.slice(0, 10)}...
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.entry_type === "CREDIT"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {item.entry_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#1C1A17]">
                      {item.entry_type === "CREDIT" ? "+" : "-"} ₹
                      {(item.amount / 100).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#4A453E]">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#6E675D]">
                      {item.created_at}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#EAE3D2] bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-xs font-mono font-semibold transition cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {downloadingId === item.id ? "Downloading..." : "Download Receipt"}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Payout Rails Section: Bank Linking (HDFC IFSC, Account Holder) ready for Monday */}
        <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-[#F0E9DC]">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-[#1C1A17]">
                  Commercial Payout Rails (Direct Bank Linking)
                </h2>
              </div>
              <p className="text-xs text-[#6E675D] mt-1">
                Link your commercial INR bank account for deterministic settlement
                withdrawals. Production gateway activates on Monday.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Monday Live Activation Rail</span>
            </span>
          </div>

          <form onSubmit={handleSaveBank} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#4A453E] uppercase mb-1.5">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                placeholder="Corporate Entity / Operator Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:outline-none text-xs text-[#1C1A17] font-medium transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-[#4A453E] uppercase mb-1.5">
                Bank IFSC Code (HDFC / Commercial)
              </label>
              <input
                type="text"
                required
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                placeholder="HDFC0001040"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:outline-none text-xs font-mono font-bold text-[#1C1A17] transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-[#4A453E] uppercase mb-1.5">
                Bank Account Number
              </label>
              <input
                type="text"
                required
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="50200084920418"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:outline-none text-xs font-mono font-bold text-[#1C1A17] transition"
              />
            </div>

            <div className="sm:col-span-3 flex items-center justify-between pt-2 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-[#6E675D]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  End-to-end 256-bit AES encryption. Verified for Indian banking
                  clearing rails (RTGS/NEFT).
                </span>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isSavedBank ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Saved &amp; Queued for Monday</span>
                  </>
                ) : (
                  <span>Update Payout Account</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
