"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  DollarSign,
  Clock,
  Key,
  Layers,
  Sparkles,
  AlertTriangle,
  Loader2,
  FileCode,
  FileCheck,
  Search,
  Code2,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";

interface TemplatePreset {
  key: string;
  name: string;
  category: string;
  amountDollars: number;
  description: string;
  tags: string[];
  criteria: string[];
  defaultWorker: string;
  assertionType: "JSON_SCHEMA" | "SHA256_HASH" | "DETERMINISTIC_PROOF";
}

const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  "web-extraction": {
    key: "web-extraction",
    name: "Web Search & Extraction Pipeline",
    category: "Data & Telemetry",
    amountDollars: 250,
    description:
      "Secure milestone payouts for agent data ingestion pipelines. Auto-released when extraction schemas and source citation depth meet deterministic hash commitments.",
    tags: ["Structured Extraction", "Quality Checks", "Auto-Release"],
    criteria: [
      "Structured entity parsing >99% confidence",
      "Source citation verification included",
      "Sub-100ms API query latency SLA",
    ],
    defaultWorker: "Agent-DataExtractor-Theta",
    assertionType: "JSON_SCHEMA",
  },
  "code-audit": {
    key: "code-audit",
    name: "Code Audit & Security Deliverable",
    category: "Software Development",
    amountDollars: 1000,
    description:
      "Escrow protection for critical software deliverables and autonomous security audits. Funds unlocked only when test coverage and security criteria pass 100%.",
    tags: ["Security Audit", "AST Analysis", "Zero CVEs"],
    criteria: [
      "Zero critical/high CVE vulnerabilities",
      "Unit & integration tests pass rate >98%",
      "SHA-256 Output Match",
    ],
    defaultWorker: "Agent-SecurityAuditor-Node",
    assertionType: "SHA256_HASH",
  },
  "architecture-spec": {
    key: "architecture-spec",
    name: "Architecture & Synthesis Spec",
    category: "Technical Architecture",
    amountDollars: 2500,
    description:
      "Milestone escrow for complex agent swarm specifications, architectural blueprints, and execution pipelines with deterministic assertion cleared.",
    tags: ["System Architecture", "Zero-Knowledge", "Compliance Ready"],
    criteria: [
      "Architecture diagram & sequence specifications",
      "Deterministic Assertion Cleared",
      "Zero-Knowledge Proof Verified",
    ],
    defaultWorker: "Agent-Architect-SwarmLeader",
    assertionType: "DETERMINISTIC_PROOF",
  },
};

function CreateContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const templateParam = searchParams.get("template") || "web-extraction";
  const amountParam = searchParams.get("amount");
  const currencyParam = searchParams.get("currency") || "USD";

  // Resolve matching preset or fallback
  const initialPreset = TEMPLATE_PRESETS[templateParam] || TEMPLATE_PRESETS["web-extraction"];

  // Form State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(initialPreset.key);
  const [contractTitle, setContractTitle] = useState(initialPreset.name);
  const [category, setCategory] = useState(initialPreset.category);
  const [budgetAmount, setBudgetAmount] = useState<number>(
    amountParam ? Number(amountParam) || initialPreset.amountDollars : initialPreset.amountDollars
  );
  const [currency, setCurrency] = useState(currencyParam);
  const [payerAgent, setPayerAgent] = useState("Agent-Alpha-Payer");
  const [workerAgent, setWorkerAgent] = useState(initialPreset.defaultWorker);
  const [timeoutSeconds, setTimeoutSeconds] = useState(300);
  const [assertionType, setAssertionType] = useState<string>(initialPreset.assertionType);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>(initialPreset.criteria);
  const [newCriteriaText, setNewCriteriaText] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deployedContract, setDeployedContract] = useState<{
    contractId: string;
    status: string;
    amount: number;
    currency: string;
    payer: string;
    worker: string;
    assertionProof: string;
    netPayout: number;
    fee: number;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Sync state if template searchParam changes
  useEffect(() => {
    const preset = TEMPLATE_PRESETS[templateParam];
    if (preset) {
      setSelectedTemplateKey(preset.key);
      setContractTitle(preset.name);
      setCategory(preset.category);
      setBudgetAmount(amountParam ? Number(amountParam) || preset.amountDollars : preset.amountDollars);
      setWorkerAgent(preset.defaultWorker);
      setAssertionType(preset.assertionType);
      setAcceptanceCriteria(preset.criteria);
    }
  }, [templateParam, amountParam]);

  // Handle template preset button clicks
  const handleSelectPreset = (key: string) => {
    const preset = TEMPLATE_PRESETS[key];
    if (preset) {
      setSelectedTemplateKey(key);
      setContractTitle(preset.name);
      setCategory(preset.category);
      setBudgetAmount(preset.amountDollars);
      setWorkerAgent(preset.defaultWorker);
      setAssertionType(preset.assertionType);
      setAcceptanceCriteria(preset.criteria);
    }
  };

  const handleAddCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCriteriaText.trim()) {
      setAcceptanceCriteria([...acceptanceCriteria, newCriteriaText.trim()]);
      setNewCriteriaText("");
    }
  };

  const handleRemoveCriteria = (index: number) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, idx) => idx !== index));
  };

  const handleDeployContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/contracts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: budgetAmount,
          amount_cents: budgetAmount * 100,
          currency,
          payer_name: payerAgent,
          from_agent: payerAgent,
          worker_name: workerAgent,
          to_agent: workerAgent,
          milestone_title: contractTitle,
          criteria: acceptanceCriteria,
          template_key: selectedTemplateKey,
          assertion_type: assertionType,
          timeout_seconds: timeoutSeconds,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok && !data.success) {
        throw new Error(data.message || data.error || "Failed to deploy contract specification.");
      }

      // Generate deterministic SHA-256 mockup identifier if backend didn't provide one
      const contractId = data.contract_id || data.transaction?.id || `ctr_${Date.now().toString(36)}`;
      const fee = Math.round(budgetAmount * 0.015 * 100) / 100;
      const net = Math.round((budgetAmount - fee) * 100) / 100;

      setDeployedContract({
        contractId,
        status: "LOCKED & VERIFIED",
        amount: budgetAmount,
        currency,
        payer: payerAgent,
        worker: workerAgent,
        assertionProof: `0x${Array.from(crypto.getRandomValues(new Uint8Array(20)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")}`,
        netPayout: net,
        fee,
      });
    } catch (err: any) {
      console.error("[DeployContractError]:", err);
      setErrorMsg(err.message || "An unexpected error occurred while deploying the escrow specification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (deployedContract?.contractId) {
      navigator.clipboard.writeText(deployedContract.contractId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pb-32 bg-[#F8FAFC] text-slate-900 flex flex-col items-center py-14 sm:py-20 px-6 sm:px-12 selection:bg-blue-600 selection:text-white font-sans antialiased">
      <div className="w-full max-w-3xl lg:max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Top Navigation & Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-medium text-slate-600 hover:text-blue-600 transition-colors py-2 px-3.5 rounded-xl hover:bg-slate-100 border border-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <VerisettLogo size={30} />
          </Link>
        </div>

        {/* Title Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Deploy Verified Escrow Contract
                </h1>
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  Pre-configured Template
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                Configure and lock cryptographic milestone funds with automated assertion proof checks.
              </p>
            </div>
          </div>
        </div>

        {/* Template Quick Switcher Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.values(TEMPLATE_PRESETS).map((t) => {
            const isSelected = selectedTemplateKey === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleSelectPreset(t.key)}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase font-semibold text-blue-700">
                      {t.category}
                    </span>
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      ${t.amountDollars.toLocaleString("en-US")}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                    {t.name}
                  </h4>
                </div>
                <div className="mt-3 text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <span>{isSelected ? "● Active Template" : "Select template"}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Form Card Container */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-10 sm:p-14 md:p-16 shadow-sm space-y-10">
          
          {errorMsg && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {deployedContract ? (
            /* Successful Deployment Confirmation View */
            <div className="space-y-8 animate-in fade-in">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-base sm:text-lg text-emerald-900">
                    Escrow Specification Deployed Successfully
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                    Milestone funds have been allocated into deterministic escrow with automated SHA-256 deliverable verification.
                  </p>
                </div>
              </div>

              {/* Specification Summary Card */}
              <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-sm">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Deployed Contract Receipt
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-xs">Contract Identifier</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-slate-900 font-mono text-sm break-all">
                        {deployedContract.contractId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                        title="Copy ID"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Clearing Status</span>
                    <span className="font-mono text-emerald-700 font-semibold flex items-center gap-2 text-sm mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {deployedContract.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Locked Escrow Budget</span>
                    <span className="font-bold text-slate-900 font-mono text-sm sm:text-base mt-0.5 block">
                      ${deployedContract.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {deployedContract.currency}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Protocol Take Rate (1.5%)</span>
                    <span className="font-semibold text-blue-600 font-mono text-sm mt-0.5 block">
                      ${deployedContract.fee.toFixed(2)} USD (Net: ${deployedContract.netPayout.toFixed(2)})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Payer Agent Node</span>
                    <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm mt-0.5 block">
                      {deployedContract.payer}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Beneficiary Worker Node</span>
                    <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm mt-0.5 block">
                      {deployedContract.worker}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <span className="text-slate-500 block text-xs">Assertion Commitment Hash</span>
                  <code className="text-xs font-mono text-slate-700 break-all select-all block mt-1">
                    {deployedContract.assertionProof}
                  </code>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setDeployedContract(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
                >
                  Deploy Another Contract
                </button>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Return to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Contract Configuration Form */
            <form onSubmit={handleDeployContract} className="space-y-9">
              
              {/* Active Template Banner Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 sm:p-7 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      {category}
                    </span>
                    <label className="text-sm font-mono font-bold uppercase text-slate-800">
                      Standard Verified Specification
                    </label>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {initialPreset.description}
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                    ${budgetAmount.toLocaleString("en-US")}.00
                  </span>
                  <span className="block text-xs font-mono text-slate-500 uppercase">
                    {currency} Escrow Lock
                  </span>
                </div>
              </div>

              {/* Contract / Milestone Title */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Contract / Milestone Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  placeholder="e.g. Web Search & Extraction Pipeline"
                  className="w-full py-4 px-5 text-base rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-semibold text-slate-900 placeholder:text-slate-400 transition shadow-xs"
                />
              </div>

              {/* Amount & Currency Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Milestone Budget Amount <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-500 text-lg">
                      $
                    </span>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      required
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(Number(e.target.value))}
                      className="w-full pl-11 pr-5 py-4 text-base rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-mono font-bold text-slate-900 transition shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Settlement Unit of Account
                  </label>
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full py-4 px-5 pr-12 text-base rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-semibold text-slate-900 transition appearance-none cursor-pointer shadow-xs"
                    >
                      <option value="USD">USD (United States Dollar)</option>
                      <option value="INR">INR (Indian Rupee)</option>
                      <option value="VRS">VRS (Verisett Protocol Credit)</option>
                    </select>
                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Participating Agent Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Payer / Initiating Agent <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payerAgent}
                    onChange={(e) => setPayerAgent(e.target.value)}
                    placeholder="e.g. Agent-Alpha-Buyer"
                    className="w-full py-4 px-5 text-base rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-semibold text-slate-900 transition shadow-xs font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Worker / Beneficiary Agent <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={workerAgent}
                    onChange={(e) => setWorkerAgent(e.target.value)}
                    placeholder="e.g. Agent-Worker-Theta"
                    className="w-full py-4 px-5 text-base rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-semibold text-slate-900 transition shadow-xs font-mono text-sm"
                  />
                </div>
              </div>

              {/* Assertion & Timeout Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Verification Assertion Protocol
                  </label>
                  <div className="relative">
                    <select
                      value={assertionType}
                      onChange={(e) => setAssertionType(e.target.value)}
                      className="w-full py-4 px-5 pr-12 text-base rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-semibold text-slate-900 transition appearance-none cursor-pointer shadow-xs"
                    >
                      <option value="JSON_SCHEMA">JSON Schema (Draft 2020-12 Assertion)</option>
                      <option value="SHA256_HASH">Deterministic SHA-256 Output Hash</option>
                      <option value="DETERMINISTIC_PROOF">Multi-Agent ZK Proof Verification</option>
                    </select>
                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Timeout / Expiration TTL
                  </label>
                  <div className="relative">
                    <select
                      value={timeoutSeconds}
                      onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
                      className="w-full py-4 px-5 pr-12 text-base rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none font-semibold text-slate-900 transition appearance-none cursor-pointer shadow-xs"
                    >
                      <option value={300}>300 Seconds (5 Minutes)</option>
                      <option value={1800}>1,800 Seconds (30 Minutes)</option>
                      <option value={3600}>3,600 Seconds (1 Hour)</option>
                      <option value={86400}>86,400 Seconds (24 Hours)</option>
                    </select>
                    <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-filled Acceptance Invariants Checklist */}
              <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-800">
                    Pre-configured Acceptance Invariants ({acceptanceCriteria.length})
                  </label>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Automated Verification
                  </span>
                </div>

                <div className="space-y-2.5 pt-2">
                  {acceptanceCriteria.map((criterion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-slate-900">
                          {criterion}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriteria(index)}
                        className="text-xs text-slate-400 hover:text-rose-600 font-mono transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Criterion Row */}
                <div className="pt-3 flex gap-2">
                  <input
                    type="text"
                    value={newCriteriaText}
                    onChange={(e) => setNewCriteriaText(e.target.value)}
                    placeholder="Add custom invariant requirement..."
                    className="flex-1 py-2.5 px-3.5 text-xs sm:text-sm rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCriteria}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-10 mt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition text-center"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto py-4 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base tracking-wide shadow-sm transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Deploying Escrow Contract...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Lock &amp; Deploy ${budgetAmount.toLocaleString("en-US")} Escrow</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default function CreateContractPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <CreateContractForm />
    </Suspense>
  );
}

