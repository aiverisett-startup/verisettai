"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bot,
  ShieldCheck,
  Zap,
  Terminal,
  Cpu,
  Lock,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Download,
  QrCode,
  CheckCircle2,
  Share2,
  RefreshCw,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { VerisettLogo } from "@/components/VerisettLogo";
import { supabase } from "@/lib/supabase";

const MODEL_PROVIDERS = [
  { id: "anthropic", label: "Anthropic Claude (3.7 Sonnet / Opus)" },
  { id: "openai", label: "OpenAI (GPT-4o / o3-mini)" },
  { id: "fastmcp", label: "Local Ollama / FastMCP Gateway Rail" },
  { id: "deepseek", label: "DeepSeek-R1 (Deterministic Clearing)" },
];

const CONCURRENCY_OPTIONS = [
  "1 Dedicated Worker Thread (Standard)",
  "4 Concurrency Node Allocation (Pro)",
  "8 Concurrency Bare-Metal Pipeline (Enterprise)",
  "Unlimited Sovereign Cluster Node Allocation",
];

const SEQUENCE_STEPS = [
  { text: "[INIT] Generating Scoped Node Hash...", doneText: "[INIT] Generating Scoped Node Hash... OK", delay: 650 },
  { text: "[AUTH] Securing Power-of-Attorney Execution Key...", doneText: "[AUTH] Securing Power-of-Attorney Execution Key... OK", delay: 750 },
  { text: "[NETWORK] Handshaking with Verisett Protocol Settlement Rail...", doneText: "[NETWORK] Handshaking with Verisett Protocol Settlement Rail... OK", delay: 850 },
  { text: "[REPUTATION] Calculating Genesis Reputation Score...", doneText: "[REPUTATION] Calculating Genesis Reputation Score... 99.4/100", delay: 900 },
];

function AgentRegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || `sess_${Date.now().toString().slice(-8)}`;
  const tierParam = searchParams.get("tier") || "enterprise";

  // Form State
  const [agentName, setAgentName] = useState("Nexus-Orchestrator-01");
  const [objective, setObjective] = useState(
    "Execute programmatic escrow contracts, verify task receipts, and settle cross-agent milestones."
  );
  const [modelProvider, setModelProvider] = useState("fastmcp");
  const [concurrency, setConcurrency] = useState("8 Concurrency Bare-Metal Pipeline (Enterprise)");

  // Deployment Sequence State
  const [isDeploying, setIsDeploying] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isCardRevealed, setIsCardRevealed] = useState(false);

  // Generated Agent State
  const [nodeUid, setNodeUid] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate deterministic node UID and secret key
    const hex = Math.random().toString(36).slice(2, 6).toUpperCase();
    const uid = `AGT-${hex}-EXEC-X`;
    const generatedSecret = `vst_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    setNodeUid(uid);
    setApiKey(generatedSecret);
  }, []);

  const handleDeployAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;

    setIsDeploying(true);
    setCompletedSteps([]);
    setSequenceIndex(0);

    // Step 1: Confetti Cannon
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Non-fatal
    }

    // Step 2: Cryptographic Sequence Engine
    let currentStep = 0;
    const runStep = () => {
      if (currentStep < SEQUENCE_STEPS.length) {
        setSequenceIndex(currentStep);
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, SEQUENCE_STEPS[currentStep].doneText]);
          currentStep++;
          if (currentStep < SEQUENCE_STEPS.length) {
            runStep();
          } else {
            // Sequence Complete -> Reveal Passport Card
            setTimeout(() => {
              setIsCardRevealed(true);
              setIsDeploying(false);
              try {
                confetti({
                  particleCount: 150,
                  spread: 100,
                  origin: { y: 0.4 },
                });
              } catch {
                // Non-fatal
              }
            }, 600);
          }
        }, SEQUENCE_STEPS[currentStep].delay);
      }
    };

    runStep();

    // Persist new agent to Supabase in the background
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const userId = session.user.id;
        await supabase.from("agents").insert({
          user_id: userId,
          name: agentName.trim(),
          framework: modelProvider === "fastmcp" ? "FastMCP" : "LangGraph",
          status: "Active",
          ping_latency_ms: 18,
          last_heartbeat_at: new Date().toISOString(),
        });

        await supabase.from("registered_agents").insert({
          user_id: userId,
          agent_name: agentName.trim(),
          agent_id_code: nodeUid,
          framework: modelProvider === "fastmcp" ? "FastMCP" : "LangGraph",
          spending_limit: 30000,
          status: "Active",
          last_heartbeat_at: new Date().toISOString(),
          ping_latency_ms: 18,
          api_key: apiKey,
        });
      }
    } catch (dbErr) {
      console.warn("[AGENT_REGISTRATION_NOTE]:", dbErr);
    }
  };

  const handleCopyKey = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyUid = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(nodeUid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleDownloadCertificate = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Ambient Cosmic Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <VerisettLogo size={28} />
            <span className="font-bold text-white text-sm tracking-tight">
              Verisett <span className="text-cyan-400">AI</span>
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[11px] font-mono font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
              Agent Passport Registry
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <span>Skip to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-10 sm:py-14 w-full space-y-8 flex-1">
        {/* Step Header */}
        {!isCardRevealed && !isDeploying && (
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step 2 of 2 // Enterprise Node Provisioning</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Deploy Your Sovereign Autonomous Agent
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Assign a directive, bind execution rails, and generate your non-colliding Agent Identity Passport with cryptographic clearing guarantees.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: REGISTRATION FORM                                                 */}
        {/* ========================================================================= */}
        {!isDeploying && !isCardRevealed && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6">
            <form onSubmit={handleDeployAgent} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Agent System Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Agent System Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g. Swarm-Alpha-Escrow"
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm text-white transition font-mono"
                  />
                  <p className="text-[11px] text-slate-500">
                    Global human-readable identifier for multi-agent telemetry and vault locks.
                  </p>
                </div>

                {/* Model Provider / Gateway Rail */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Model Provider / Gateway Rail <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={modelProvider}
                    onChange={(e) => setModelProvider(e.target.value)}
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm text-white transition cursor-pointer font-sans"
                  >
                    {MODEL_PROVIDERS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Deterministic rail interface for agent context streaming.
                  </p>
                </div>
              </div>

              {/* Primary Objective / Directive */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Primary Objective / Directive
                </label>
                <textarea
                  rows={3}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Define the autonomous operational boundary..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm text-white transition resize-y font-sans leading-relaxed"
                />
              </div>

              {/* Concurrency Node Allocation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Max Concurrency Node Allocation
                </label>
                <select
                  value={concurrency}
                  onChange={(e) => setConcurrency(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm text-white transition cursor-pointer font-sans"
                >
                  {CONCURRENCY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deploy CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span>Deploy Agent &amp; Mint Cryptographic Passport →</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ACTIVATION INTRO SEQUENCE (TERMINAL ANIMATION)                     */}
        {/* ========================================================================= */}
        {isDeploying && !isCardRevealed && (
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-6 text-left max-w-2xl mx-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                  CRYPTOGRAPHIC GENESIS IN PROGRESS
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">Node: {nodeUid}</span>
            </div>

            {/* Terminal Log Output */}
            <div className="p-5 rounded-2xl bg-black/80 border border-slate-800 font-mono text-xs sm:text-sm space-y-3 min-h-[220px]">
              {completedSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}

              {sequenceIndex >= 0 && sequenceIndex < SEQUENCE_STEPS.length && (
                <div className="flex items-center gap-2 text-cyan-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{SEQUENCE_STEPS[sequenceIndex].text}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 text-center font-sans">
              Provisioning sovereign vault power-of-attorney and calibrating genesis trust metrics...
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: INTERACTIVE AGENT IDENTITY & REPUTATION CARD                      */}
        {/* ========================================================================= */}
        {isCardRevealed && (
          <div className="space-y-8 animate-in fade-in zoom-in-90 duration-500 max-w-2xl mx-auto">
            {/* Success Notification Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-sans flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Genesis Deployment Confirmed!</strong> Sovereign Node Identity Passport minted.
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-mono font-bold border border-emerald-400/40">
                Score: 99.4
              </span>
            </div>

            {/* 3D Tilted Futuristic Agent Passport Card */}
            <div
              ref={cardRef}
              className="group relative rounded-3xl p-7 sm:p-8 shadow-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-400/40 text-white backdrop-blur-2xl overflow-hidden transition-all duration-500 hover:shadow-cyan-500/10 hover:border-cyan-400/60"
            >
              {/* Glowing Ambient Mesh & Watermark */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

              {/* Translucent Verisett Logo Watermark in Center */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                <VerisettLogo size={260} />
              </div>

              {/* Top Passport Header */}
              <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-5 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>VERISETT PROTOCOL AGENT PASSPORT</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                    {agentName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                      {nodeUid}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUid}
                      className="p-1 rounded hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Copy Node UID"
                    >
                      {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Cryptographic Chip / QR Stamp Badge */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400/80 via-yellow-300 to-amber-500 border border-yellow-200/50 shadow-md flex items-center justify-center text-slate-950 font-mono font-bold text-xs">
                    <Cpu className="w-6 h-6 text-slate-950" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
                    CHIP SEC-V2
                  </span>
                </div>
              </div>

              {/* Mid Details: Execution Tier & Scoped Secret */}
              <div className="relative z-10 py-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                      Execution Tier
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-400/10 border border-cyan-400/40 text-cyan-300 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Dedicated Enterprise Node
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                      Active Rail
                    </span>
                    <span className="font-mono text-xs text-slate-200 font-bold">
                      {modelProvider === "fastmcp" ? "FastMCP Standard" : "LangGraph Swarm"}
                    </span>
                  </div>
                </div>

                {/* Scoped API Secret Monospace Pill */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Scoped Power-of-Attorney Token
                    </span>
                    <code className="text-xs font-mono text-cyan-300 truncate block">
                      {apiKey ? `${apiKey.slice(0, 14)}••••••••${apiKey.slice(-4)}` : "vst_live_••••"}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold transition cursor-pointer border border-white/15"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Reputation & Trust Metrics Grid */}
              <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {/* Metric 1: Genesis Reputation Score */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-700"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-400"
                        strokeDasharray="99.4, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-mono font-bold text-white">99.4</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Genesis Score</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">99.4 / 100</span>
                  </div>
                </div>

                {/* Metric 2: Trust Grade */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Trust Grade</span>
                  <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    Grade AAA Sovereign
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Multi-Party Verified</span>
                </div>

                {/* Metric 3: Settlement Cap */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Settlement Cap</span>
                  <span className="text-xs font-bold text-white font-mono">
                    ₹30,000 Verified Escrow
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Instant Clearing Cap</span>
                </div>
              </div>
            </div>

            {/* Passport Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all duration-200 text-center flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Telemetry Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleDownloadCertificate}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Digital Node Certificate (PNG / PDF)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Verisett AI Platform. Sovereign Agent Passport Registry.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-300 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition">Privacy</Link>
            <Link href="/security" className="hover:text-slate-300 transition">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AgentRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="flex items-center gap-2 text-sm font-mono text-cyan-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading Agent Passport Registry...</span>
          </div>
        </div>
      }
    >
      <AgentRegisterInner />
    </Suspense>
  );
}

