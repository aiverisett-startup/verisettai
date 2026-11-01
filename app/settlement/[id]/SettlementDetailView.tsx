"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Copy,
  Check,
  Code2,
  Lock,
  FileCheck2,
  Share2,
  Terminal as TerminalIcon,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { SettlementAgreement, SettlementState } from "@/lib/settlement/types";

interface Props {
  id: string;
}

export default function SettlementDetailView({ id }: Props) {
  const [agreement, setAgreement] = useState<SettlementAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"payload" | "attestation" | "output">("payload");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Time remaining countdown in challenge window
  const [timeRemaining, setTimeRemaining] = useState<string>("--:--:--");

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/settlement/${id}`);
      const data = await res.json();
      if (data.success && data.agreement) {
        setAgreement(data.agreement);
        setError(null);
      } else {
        setError(data.error || "Failed to load settlement agreement");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading agreement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreement();
  }, [id]);

  // Challenge window timer tick
  useEffect(() => {
    if (!agreement?.challengeWindowEnds) {
      setTimeRemaining("WINDOW_NOT_ACTIVE");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(agreement.challengeWindowEnds!).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeRemaining("00h 00m 00s (FINALIZED)");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [agreement?.challengeWindowEnds]);

  // Handle deterministic state transition
  const handleTransition = async (targetState: SettlementState) => {
    if (!agreement) return;
    setIsTransitioning(true);
    setActionMessage(null);

    let payload: any = agreement.deliverablePayload;
    let attestation: any = agreement.proofAttestation;

    // Provide default deliverable if advancing to DELIVERABLE_SUBMITTED
    if (targetState === "DELIVERABLE_SUBMITTED" && !payload) {
      payload = {
        taskResult: "SUCCESS",
        outputUrl: "https://vault.verisett.ai/artifacts/task-9982.json",
        latencyMs: 384,
        metrics: {
          accuracy: 0.995,
          computeCores: 8,
          tokensProcessed: 18400,
        },
        executionProof: "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      };
      attestation = {
        signatures: [
          {
            nodeId: agreement.workerAgentId,
            sig: "ed25519:" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    try {
      const res = await fetch(`/api/settlement/${agreement.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetState,
          deliverablePayload: payload,
          proofAttestation: attestation,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAgreement(data.agreement);
        setActionMessage(`State successfully advanced to ${targetState}`);
      } else {
        setActionMessage(`Transition failed: ${data.error}`);
      }
    } catch (err: any) {
      setActionMessage(`Transition error: ${err.message}`);
    } finally {
      setIsTransitioning(false);
    }
  };

  const copyHash = () => {
    if (!agreement) return;
    navigator.clipboard.writeText(agreement.agreementHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // State timeline nodes
  const timelineSteps = useMemo(() => {
    const states: { key: SettlementState; label: string }[] = [
      { key: "ESCROW_LOCKED", label: "Locked" },
      { key: "DELIVERABLE_SUBMITTED", label: "Submitted" },
      { key: "VERIFYING", label: "Verifying" },
      { key: "SETTLED", label: "Settled" },
    ];

    const stateOrder: Record<SettlementState, number> = {
      INITIALIZED: 0,
      ESCROW_LOCKED: 1,
      DELIVERABLE_SUBMITTED: 2,
      VERIFYING: 3,
      SETTLED: 4,
      CHALLENGED: 3, // parallel branch
      REFUNDED: 4, // parallel terminal
    };

    const currentIdx = agreement ? stateOrder[agreement.state] : 0;

    return states.map((step, idx) => {
      const stepIdx = idx + 1;
      const isCompleted = currentIdx > stepIdx || (agreement?.state === "SETTLED" && stepIdx === 4);
      const isActive = currentIdx === stepIdx && agreement?.state !== "SETTLED";
      const isFuture = currentIdx < stepIdx;

      return {
        ...step,
        isCompleted,
        isActive,
        isFuture,
      };
    });
  }, [agreement?.state]);

  // Financial breakdown
  const escrowTotalInr = agreement ? agreement.escrowAmountPaise / 100 : 0;
  const takeRatePercent = agreement ? (agreement.platformTakeRate * 100).toFixed(1) : "2.0";
  const takeRateAmountInr = agreement ? escrowTotalInr * agreement.platformTakeRate : 0;
  const netWorkerInr = escrowTotalInr - takeRateAmountInr;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center font-mono text-xs text-cyan-400">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>QUERYING_SETTLEMENT_STATE_MACHINE...</span>
        </div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-mono">SETTLEMENT_AGREEMENT_NOT_FOUND</h2>
        <p className="text-xs font-mono text-slate-400 max-w-md mb-6">{error || "No record matching hash or identifier"}</p>
        <Link
          href="/dashboard"
          className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-4 py-2 rounded-lg hover:border-cyan-500/50 transition-colors"
        >
          ← RETURN_TO_DASHBOARD
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 relative overflow-hidden font-sans selection:bg-blue-600/30">
      {/* Ambient Lighting & Dynamic Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[360px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-32 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      {/* Top Telemetry Header Bar */}
      <header className="border-b border-white/[0.08] bg-[#09090B]/70 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>← PLATFORM</span>
            </Link>
            <span className="text-slate-600">/</span>
            {/* Monospace Cyan Pill Breadcrumb */}
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-md">
              <span className="text-slate-400">PROTOCOL // SETTLEMENT_VM //</span>
              <span className="font-bold">{agreement.agreementHash}</span>
              <button
                onClick={copyHash}
                title="Copy Agreement Hash"
                className="text-slate-400 hover:text-cyan-300 ml-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Dynamic Glowing Status Badge */}
          <div className="flex items-center gap-3">
            {agreement.state === "SETTLED" && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold tracking-wider">STATE: SETTLED // FUNDS DISBURSED</span>
              </div>
            )}
            {agreement.state === "VERIFYING" && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span className="font-bold tracking-wider">STATE: VERIFYING CRYPTOGRAPHIC PROOF</span>
              </div>
            )}
            {agreement.state === "CHALLENGED" && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold tracking-wider">STATE: DISPUTE / CHALLENGED</span>
              </div>
            )}
            {agreement.state === "ESCROW_LOCKED" && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold tracking-wider">STATE: ESCROW LOCKED</span>
              </div>
            )}
            {agreement.state === "DELIVERABLE_SUBMITTED" && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-500/40 text-indigo-400">
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold tracking-wider">STATE: DELIVERABLE SUBMITTED</span>
              </div>
            )}
            {agreement.state === "INITIALIZED" && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/40 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="font-bold tracking-wider">STATE: INITIALIZED</span>
              </div>
            )}
            {agreement.state === "REFUNDED" && (
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-400">
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold tracking-wider">STATE: REFUNDED TO BUYER</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Inspector Canvas */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Action feedback message banner */}
        {actionMessage && (
          <div className="p-3.5 rounded-xl font-mono text-xs border border-blue-500/30 bg-blue-950/30 text-blue-300 flex items-center justify-between">
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Counterparty Identity Bar */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">BUYER AGENT:</span>
            <span className="text-slate-200 bg-white/[0.04] px-2.5 py-1 rounded border border-white/[0.08]">
              {agreement.buyerAgentId}
            </span>
            <span className="text-cyan-400">───[Escrow Channel]───▶</span>
            <span className="text-slate-500">WORKER AGENT:</span>
            <span className="text-slate-200 bg-white/[0.04] px-2.5 py-1 rounded border border-white/[0.08]">
              {agreement.workerAgentId}
            </span>
          </div>
          {agreement.parentAgreementId && (
            <div className="flex items-center gap-2 text-cyan-400">
              <Share2 className="w-3.5 h-3.5" />
              <span>DAG CHILD OF: {agreement.parentAgreementId.slice(0, 16)}...</span>
            </div>
          )}
        </div>

        {/* Escrow Summary Cards Grid (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Escrow Locked & Take Rate Breakdown */}
          <div className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-5 backdrop-blur-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-slate-400 tracking-wider">ESCROW LOCKED</span>
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight mb-4 font-mono">
              ₹{escrowTotalInr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="border-t border-white/[0.06] pt-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Principal Locked:</span>
                <span className="text-slate-200">₹{escrowTotalInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>Verisett Take Rate ({takeRatePercent}%):</span>
                <span>-₹{takeRateAmountInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-white/[0.04]">
                <span>Net Worker Payout:</span>
                <span>₹{netWorkerInr.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Verification Mode */}
          <div className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-5 backdrop-blur-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-slate-400 tracking-wider">VERIFICATION MODE</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-cyan-300 font-mono tracking-tight mb-2">
              {agreement.verificationMethod}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {agreement.verificationMethod === "INDEPENDENT_TEST_RUNNER" &&
                "Runs isolated algorithmic test assertions and latency bounds against deliverable payload."}
              {agreement.verificationMethod === "CONTENT_HASH_COMMITMENT" &&
                "Deterministic SHA-256 byte-canonical hash commitment matched prior to release."}
              {agreement.verificationMethod === "ATTESTATION_QUORUM" &&
                "Multi-node cryptographic quorum attestation with required threshold signatures."}
            </p>
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded">
              <span>PREDICATE: STRICT_ENFORCEMENT</span>
            </div>
          </div>

          {/* Card 3: Challenge Window */}
          <div className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-5 backdrop-blur-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-slate-400 tracking-wider">CHALLENGE WINDOW</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-200 tracking-tight mb-2">
              {timeRemaining}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Counterparties may lodge a cryptographic dispute before the window closes. Expired window enables final autonomous clearing.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>DISPUTE_CLEARANCE: AUTOMATED</span>
            </div>
          </div>
        </div>

        {/* Interactive Lifecycle State Timeline */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs text-slate-400 tracking-wider">
              SETTLEMENT LIFECYCLE TIMELINE // DETERMINISTIC STATE MACHINE
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              CURRENT_STATE: {agreement.state}
            </span>
          </div>

          {/* Progress Rail */}
          <div className="relative">
            {/* Background connecting rail */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-white/[0.08] z-0" />

            <div className="grid grid-cols-4 relative z-10">
              {timelineSteps.map((step, index) => {
                let badgeStyle = "border-white/[0.08] text-slate-600 bg-[#09090B]";
                let dotStyle = "bg-slate-700";

                if (step.isCompleted) {
                  badgeStyle =
                    "border-emerald-500/40 text-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                  dotStyle = "bg-emerald-400";
                } else if (step.isActive) {
                  badgeStyle =
                    "border-blue-500/60 text-blue-300 bg-blue-950/60 shadow-[0_0_20px_rgba(37,99,235,0.4)]";
                  dotStyle = "bg-blue-400 animate-ping";
                }

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 rounded-full border flex items-center justify-center mb-3 transition-all ${badgeStyle}`}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : step.isActive ? (
                        <div className="relative flex items-center justify-center">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotStyle}`} />
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-slate-600">{index + 1}</span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-200 mb-0.5">
                      {step.label}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase">
                      {step.key}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* State Transition Actions Toolbar */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <TerminalIcon className="w-4 h-4 text-blue-400" />
            <span>OPERATOR ACTIONS // ADVANCE PROTOCOL STATE:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {agreement.state === "INITIALIZED" && (
              <button
                disabled={isTransitioning}
                onClick={() => handleTransition("ESCROW_LOCKED")}
                className="font-mono text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isTransitioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                LOCK ESCROW (PRE-CHECK)
              </button>
            )}

            {agreement.state === "ESCROW_LOCKED" && (
              <button
                disabled={isTransitioning}
                onClick={() => handleTransition("DELIVERABLE_SUBMITTED")}
                className="font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isTransitioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck2 className="w-3.5 h-3.5" />}
                SUBMIT DELIVERABLE
              </button>
            )}

            {agreement.state === "DELIVERABLE_SUBMITTED" && (
              <button
                disabled={isTransitioning}
                onClick={() => handleTransition("VERIFYING")}
                className="font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isTransitioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                RUN PROOF ENGINE
              </button>
            )}

            {agreement.state === "VERIFYING" && (
              <>
                <button
                  disabled={isTransitioning}
                  onClick={() => handleTransition("SETTLED")}
                  className="font-mono text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isTransitioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  FINALIZE SETTLEMENT (DISBURSE)
                </button>
                <button
                  disabled={isTransitioning}
                  onClick={() => handleTransition("CHALLENGED")}
                  className="font-mono text-xs font-bold bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  RAISE CHALLENGE
                </button>
              </>
            )}

            {agreement.state === "CHALLENGED" && (
              <>
                <button
                  disabled={isTransitioning}
                  onClick={() => handleTransition("REFUNDED")}
                  className="font-mono text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  EXECUTE REFUND TO BUYER
                </button>
                <button
                  disabled={isTransitioning}
                  onClick={() => handleTransition("SETTLED")}
                  className="font-mono text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  RESOLVE IN FAVOR OF WORKER
                </button>
              </>
            )}

            {agreement.state === "SETTLED" && (
              <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                DISBURSEMENT_COMPLETE // NO_FURTHER_ACTIONS_REQUIRED
              </span>
            )}

            {agreement.state === "REFUNDED" && (
              <span className="font-mono text-xs text-rose-400 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                ESCROW_REFUNDED_TO_BUYER
              </span>
            )}
          </div>
        </div>

        {/* Cryptographic Deliverable & Proof Terminal */}
        <div className="bg-[#09090B] border border-white/[0.08] rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
          {/* Terminal Title Bar & Tabs */}
          <div className="bg-white/[0.02] border-b border-white/[0.08] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-slate-400 text-xs">CRYPTOGRAPHIC_PROOF_TERMINAL</span>
            </div>

            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06]">
              <button
                onClick={() => setActiveTab("payload")}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeTab === "payload"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Deliverable Payload (JSON)
              </button>
              <button
                onClick={() => setActiveTab("attestation")}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeTab === "attestation"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Proof Attestation (Signed)
              </button>
              <button
                onClick={() => setActiveTab("output")}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeTab === "output"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Verification Rules & Output
              </button>
            </div>
          </div>

          {/* Code Viewer Canvas */}
          <div className="p-4 bg-black/50 overflow-x-auto max-h-[420px] text-slate-300">
            {activeTab === "payload" && (
              <pre className="font-mono leading-relaxed">
                {agreement.deliverablePayload
                  ? JSON.stringify(agreement.deliverablePayload, null, 2)
                  : "// No deliverable payload deposited yet.\n// Advance state to DELIVERABLE_SUBMITTED to attach signed payload."}
              </pre>
            )}

            {activeTab === "attestation" && (
              <pre className="font-mono leading-relaxed text-cyan-300">
                {agreement.proofAttestation
                  ? JSON.stringify(agreement.proofAttestation, null, 2)
                  : "// No signed attestation signatures recorded.\n// Awaiting worker cryptographic attestation."}
              </pre>
            )}

            {activeTab === "output" && (
              <div className="space-y-4 font-mono">
                <div>
                  <span className="text-slate-500">// Acceptance Rules Configured:</span>
                  <pre className="text-emerald-400 mt-1">
                    {JSON.stringify(agreement.acceptanceRules, null, 2)}
                  </pre>
                </div>
                <div className="border-t border-white/[0.08] pt-3 text-slate-400">
                  <p>
                    <span className="text-cyan-400">STATUS:</span> {agreement.state}
                  </p>
                  <p>
                    <span className="text-cyan-400">CANONICAL_HASH_ALGO:</span> SHA-256 (RFC-8785 JSON canonicalization)
                  </p>
                  <p>
                    <span className="text-cyan-400">SETTLEMENT_RAIL:</span> Verisett Autonomous Vaults (Paise: {agreement.escrowAmountPaise})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
