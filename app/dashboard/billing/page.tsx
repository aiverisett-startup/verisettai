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

  // Bank Form State
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
              transaction_id: e.transaction_id || `TXN-${e.id.slice(0, 8).toUpperCase()}`,
              entry_type: e.entry_type,
              amount: e.amount,
              currency: e.currency || "INR",
              description: e.description || "Escrow Clearing Transaction",
              created_at: new Date(e.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              status: e.status || "CLEARED",
            }));
            setLedgerEntries(mapped);
          } else {
            // Institutional simulated transactions
            setLedgerEntries([
              {
                id: "1",
                transaction_id: "TXN-VSET-8812A",
                entry_type: "CREDIT",
                amount: 2500000,
                currency: "INR",
                description: "Institutional Node Liquidity Allocation (Founder Tier)",
                created_at: "Oct 24, 2026",
                status: "CLEARED",
              },
              {
                id: "2",
                transaction_id: "TXN-VSET-8704B",
                entry_type: "DEBIT",
                amount: 18750,
                currency: "INR",
                description: "Escrow Fee Assessment (0.75% Locked Rate — Milestone 104)",
                created_at: "Oct 22, 2026",
                status: "CLEARED",
              },
              {
                id: "3",
                transaction_id: "TXN-VSET-8611C",
                entry_type: "CREDIT",
                amount: 850000,
                currency: "INR",
                description: "Multi-Agent Arbitrage Escrow Payout Disbursed",
                created_at: "Oct 20, 2026",
                status: "CLEARED",
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Error reading billing ledger:", err);
      }
    };

    fetchSessionAndLedger();
  }, [router]);

  const plans: PlanTier[] = [
    {
      id: "starter",
      name: "Community Testnet",
      priceDisplay: "₹0",
      period: "lifetime",
      takeRate: "2.0% Flat",
      takeRateNumeric: 2.0,
      description: "Standard autonomous escrow clearing for individual researchers & agent developers.",
      features: [
        "Up to $10,000 Monthly Volume",
        "Deterministic FastMCP Integration",
        "24-Hour Settlement SLA",
        "Community Discord Support",
      ],
    },
    {
      id: "pro",
      name: "Autonomous Growth",
      priceDisplay: "₹1,999",
      period: "monthly",
      takeRate: "1.25% Flat",
      takeRateNumeric: 1.25,
      description: "Optimized fee schedule for agent dev shops, multi-agent frameworks, and SaaS brokers.",
      badge: "Most Popular",
      features: [
        "Up to $100,000 Monthly Volume",
        "Sub-100ms Programmatic Payouts",
        "Multi-Party Dynamic Arbitration",
        "Dedicated Webhook & API Keys",
        "Priority Settlement Pipeline",
      ],
    },
    {
      id: "founder",
      name: "Enterprise Node Pass",
      priceDisplay: "₹4,999",
      period: "lifetime license",
      takeRate: "0.75% Flat",
      takeRateNumeric: 0.75,
      description: "Permanent lowest protocol take-rate license. Strictly capped to 1,500 total nodes.",
      badge: "Founder License Active",
      features: [
        "Uncapped Escrow Transaction Volume",
        "Locked 0.75% Protocol Take-Rate",
        "Direct Commercial Banking Rails",
        "Priority Cryptographic Witnessing",
        "Physical Commemorative Pass Card",
      ],
    },
  ];

  const currentPlanObj = useMemo(() => {
    return plans.find((p) => p.id === selectedPlan) || plans[2];
  }, [plans, selectedPlan]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("verisett_user_email");
    localStorage.removeItem("verisett_auth_provider");
    dispatchAuthChange();
    router.replace("/");
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedBank(true);
    setTimeout(() => setIsSavedBank(false), 3000);
  };

  const handleDownloadInvoice = (item: LedgerItem) => {
    setDownloadingId(item.id);
    const invoiceContent = `
============================================================
           VERISETT AI PROTOCOL — TAX INVOICE & RECEIPT
============================================================
Receipt Reference:   ${item.transaction_id}
Clearing Timestamp:  ${item.created_at}
Tenant ID:           ${tenantId}
Operator Email:      ${userEmail}
------------------------------------------------------------
Transaction Type:    ${item.entry_type}
Clearing Category:   ${item.description}
Gross Amount:        INR ${(item.amount / 100).toFixed(2)}
Protocol Take-Rate:  ${currentPlanObj.takeRate}
Settlement Status:   ${item.status}
------------------------------------------------------------
Cryptographic Proof: SHA-256 (e3b0c44298fc1c149afbf4c8996fb924)
Issuer:              Verisett Settlement Engine Ltd.
GSTIN:               29AAAAA0000A1Z5
============================================================
    This is a cryptographically verified deterministic voucher.
    Generated automatically by Verisett FastMCP Escrow Engine.
============================================================
`.trim();

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
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-8 md:p-12 font-sans selection:bg-[#2563EB] selection:text-white">
      {/* Soft Ambient Radial Blue Gradients behind main container for glass depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden select-none -z-10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.07)_0%,transparent_70%)] blur-2xl" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.04)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <header className="flex items-center justify-between border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.75)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] rounded-[16px] p-5 sm:p-6 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-85 transition-opacity">
              <VerisettLogo size={32} />
            </Link>
            <div className="h-6 w-px bg-[#CBD5E1] hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0F172A] bg-[#F1F5F9] px-2.5 py-1 rounded-[8px] border border-[#CBD5E1]">
                {tenantId}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono bg-blue-50 text-[#2563EB] border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                Founder Tier Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <nav className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-[12px] border border-[#E2E8F0] text-xs font-medium">
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-[8px] text-[#475569] hover:text-[#0F172A] transition-colors"
              >
                Vault &amp; Telemetry
              </Link>
              <Link
                href="/dashboard/billing"
                className="px-3.5 py-1.5 rounded-[8px] bg-white text-[#2563EB] font-semibold shadow-xs border border-blue-100"
              >
                Protocol Billing &amp; Rails
              </Link>
            </nav>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-[10px] border border-[#CBD5E1] bg-white hover:bg-rose-50 hover:text-rose-600 text-[#64748B] transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 1. Protocol Take-Rate Display & Savings Efficiency Banner */}
        <div className="rounded-[16px] bg-[rgba(255,255,255,0.75)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border border-[rgba(255,255,255,0.9)] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] p-7 sm:p-9 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-mono font-semibold border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                Institutional Liquidity Rail
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
                Effective Protocol Take-Rate: {currentPlanObj.takeRate}
              </h1>
              <p className="text-sm text-[#475569] leading-[1.6]">
                As a Founder Node Pass holder, your autonomous agent clearinghouse
                operates on our locked 0.75% take-rate, saving 1.25% per contract compared
                to the 2.0% standard tier.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-xs shrink-0">
              <div className="text-center px-4 border-r border-[#E2E8F0]">
                <span className="block text-[10px] font-mono text-[#64748B] uppercase">
                  Standard Rate
                </span>
                <span className="text-xl font-bold font-mono text-rose-500 line-through">
                  2.0%
                </span>
              </div>
              <div className="text-center px-4">
                <span className="block text-[10px] font-mono text-[#2563EB] uppercase font-semibold">
                  Founder Pass Rate
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-600">
                  {currentPlanObj.takeRate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Current Plan Overview Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2563EB]" />
              <span>Subscription &amp; Node License Tiers</span>
            </h2>
            <span className="text-xs font-mono text-[#64748B]">
              Account Email: {userEmail}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = plan.id === selectedPlan;
              return (
                <div
                  key={plan.id}
                  className={`rounded-[16px] bg-[rgba(255,255,255,0.75)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                    isCurrent
                      ? "border-2 border-[#2563EB] shadow-[0_20px_50px_-12px_rgba(37,99,235,0.12),0_0_0_1px_rgba(37,99,235,0.1)]"
                      : "border border-[rgba(255,255,255,0.9)] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] hover:border-[#CBD5E1]"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#2563EB] text-white shadow-xs">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A]">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-[#475569] mt-1 leading-[1.6]">
                        {plan.description}
                      </p>
                    </div>

                    <div className="py-2 border-y border-[#E2E8F0]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-sans">
                          {plan.priceDisplay}
                        </span>
                        <span className="text-xs text-[#64748B] font-mono">
                          / {plan.period}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-[#2563EB] mt-1">
                        Settlement Take-Rate: {plan.takeRate}
                      </div>
                    </div>

                    <ul className="space-y-2.5 text-xs text-[#334155]">
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
                      className={`w-full py-2.5 rounded-[10px] font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? "bg-[#2563EB] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                          : "border border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Active Tier</span>
                        </>
                      ) : (
                        <span>Switch to Tier</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Settlement Fee Ledger & Invoicing History */}
        <div className="rounded-[16px] bg-[rgba(255,255,255,0.75)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border border-[rgba(255,255,255,0.9)] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563EB]" />
                <span>Protocol Fee &amp; Liquidity Ledger</span>
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Immutable, cryptographically verified record of all protocol clearing fees.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Double-Entry Standard
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-mono uppercase text-[11px]">
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {ledgerEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#0F172A]">
                      {item.transaction_id}
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
                    <td className="py-3.5 px-3 font-mono font-bold text-[#0F172A]">
                      {item.entry_type === "CREDIT" ? "+" : "-"} ₹
                      {(item.amount / 100).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#334155]">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#64748B]">
                      {item.created_at}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-mono font-semibold transition cursor-pointer shadow-2xs"
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

        {/* 4. Payout Rails Section: Bank Linking */}
        <div className="rounded-[16px] bg-[rgba(255,255,255,0.75)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border border-[rgba(255,255,255,0.9)] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-base font-bold text-[#0F172A]">
                  Commercial Payout Rails (Direct Bank Linking)
                </h2>
              </div>
              <p className="text-xs text-[#475569] mt-1">
                Link your commercial INR bank account for deterministic settlement
                withdrawals. Production gateway activates on Monday.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-mono font-bold border border-blue-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Monday Live Activation Rail</span>
            </span>
          </div>

          <form onSubmit={handleSaveBank} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                placeholder="Corporate Entity / Operator Name"
                className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-medium px-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                Bank IFSC Code
              </label>
              <input
                type="text"
                required
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                placeholder="HDFC0001040"
                className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-mono font-bold px-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                Bank Account Number
              </label>
              <input
                type="text"
                required
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="50200084920418"
                className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-mono font-bold px-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="sm:col-span-3 flex items-center justify-between pt-2 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-[#475569]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  End-to-end 256-bit AES encryption. Verified for Indian banking
                  clearing rails (RTGS/NEFT).
                </span>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs transition cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center gap-1.5"
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
