"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bot,
  Key,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Terminal,
  Mail,
  Lock,
  FileCheck2,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  registerAgentMultiStepAction,
  generateAgentIdCodeAction,
  sendRegistrationOtpAction,
  RegisteredAgentRecord,
} from "@/app/actions/registerAgentAction";

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentRegistered?: (agent: RegisteredAgentRecord) => void;
  userEmail?: string;
}

const FRAMEWORK_OPTIONS = [
  { value: "FastMCP", label: "FastMCP (Model Context Protocol)", recommended: true },
  { value: "LangGraph", label: "LangGraph (LangChain Workflows)" },
  { value: "CrewAI", label: "CrewAI (Autonomous Swarms)" },
  { value: "AutoGen", label: "AutoGen (Microsoft Multi-Agent)" },
  { value: "Custom REST", label: "Custom REST / Webhook Worker" },
];

export function RegisterAgentModal({
  isOpen,
  onClose,
  onAgentRegistered,
  userEmail = "operator@verisett.ai",
}: RegisterAgentModalProps) {
  // Step State: 1 = Identity & Profile, 2 = Credentials & OTP, 3 = Legal Consents, 4 = One-time Key
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Identity & Profile Details
  const [agentName, setAgentName] = useState("");
  const avatarUrl = "/agent-avatar.png";
  const [framework, setFramework] = useState("FastMCP");
  const [spendingLimit, setSpendingLimit] = useState("50000");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Step 2: Credential Provisioning & Email Verification
  const [agentIdCode, setAgentIdCode] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpDispatched, setOtpDispatched] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Step 3: Legal & Privacy Consents
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);

  // Step 4: Submission & One-Time Token Result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [registeredAgent, setRegisteredAgent] = useState<RegisteredAgentRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Auto-generate unique Agent ID on mount or open
  useEffect(() => {
    if (isOpen && !agentIdCode) {
      generateAgentIdCodeAction().then((res) => {
        if (res.success) setAgentIdCode(res.agentIdCode);
      });
    }
  }, [isOpen, agentIdCode]);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setCurrentStep(1);
    setAgentName("");
    setFramework("FastMCP");
    setSpendingLimit("50000");
    setWebhookUrl("");
    setAgentIdCode("");
    setPassphrase("");
    setOtpCode("");
    setOtpDispatched(false);
    setOtpNotice(null);
    setDevOtpHint(null);
    setConsentTerms(false);
    setConsentPrivacy(false);
    setErrorMessage(null);
    setGeneratedApiKey(null);
    setRegisteredAgent(null);
    setCopiedKey(false);
    setCopiedSnippet(false);
    onClose();
  };

  // Send Email OTP Code
  const handleSendOtp = async () => {
    try {
      setIsSendingOtp(true);
      setErrorMessage(null);
      const res = await sendRegistrationOtpAction(userEmail);
      if (res.success) {
        setOtpDispatched(true);
        setOtpNotice(res.message);
        if (res.devCode) {
          setDevOtpHint(res.devCode);
          setOtpCode(res.devCode); // Auto-fill for seamless user verification
        }
      } else {
        setErrorMessage(res.message || "Failed to dispatch email verification code.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Error requesting verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 1 Next
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = agentName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Please specify a valid Agent Name (at least 2 characters).");
      return;
    }

    const limitNum = parseFloat(spendingLimit);
    if (isNaN(limitNum) || limitNum < 0) {
      setErrorMessage("Spending cap must be a valid positive number.");
      return;
    }

    setCurrentStep(2);
    // Auto-send OTP code when entering Step 2 if not already dispatched
    if (!otpDispatched) {
      handleSendOtp();
    }
  };

  // Step 2 Next
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passphrase || passphrase.trim().length < 6) {
      setErrorMessage("Security Passphrase must be at least 6 characters.");
      return;
    }

    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMessage("Please enter the 6-digit email authorization code.");
      return;
    }

    setCurrentStep(3);
  };

  // Step 3 Submit (Final Registration)
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!consentTerms || !consentPrivacy) {
      setErrorMessage("You must agree to both mandatory consent checkboxes to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await registerAgentMultiStepAction({
        agentName: agentName.trim(),
        framework,
        spendingLimit: Math.max(0, parseFloat(spendingLimit) || 0),
        webhookUrl: webhookUrl.trim() || undefined,
        agentIdCode: agentIdCode.trim(),
        avatarUrl: avatarUrl || undefined,
        passphrase: passphrase.trim(),
        otpCode: otpCode.trim(),
        consentTerms,
        consentPrivacy,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Registration failed. Please check inputs.");
      } else {
        setGeneratedApiKey(result.apiKey || null);
        setRegisteredAgent(result.agent || null);
        setCurrentStep(4);
        if (result.agent && onAgentRegistered) {
          onAgentRegistered(result.agent);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during provisioning.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = () => {
    if (!generatedApiKey) return;
    navigator.clipboard.writeText(generatedApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const launchSnippet = generatedApiKey
    ? `npx -y @verisett/mcp-server@latest --key=${generatedApiKey}`
    : "";

  const handleCopySnippet = () => {
    if (!launchSnippet) return;
    navigator.clipboard.writeText(launchSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-[24px] border border-[rgba(255,255,255,0.9)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E2E8F0] bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                  AI Agent Registration Flow
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-semibold border border-blue-200">
                  Step {currentStep} of 4
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {currentStep === 1 && "Step 1: Identity & Protocol Parameters"}
                {currentStep === 2 && "Step 2: ID Allocation & Email Authorization"}
                {currentStep === 3 && "Step 3: Protocol Escrow Legal Consents"}
                {currentStep === 4 && "Step 4: Cryptographic Key Provisioned"}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-[10px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-4 px-6 pt-3 pb-2 border-b border-[#E2E8F0] gap-2 bg-slate-50/40">
          {[
            { num: 1, label: "Identity" },
            { num: 2, label: "Security & OTP" },
            { num: 3, label: "Consents" },
            { num: 4, label: "Token" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col gap-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  currentStep >= s.num
                    ? "bg-[#2563EB]"
                    : "bg-slate-200"
                }`}
              />
              <span
                className={`text-[10px] font-mono font-medium truncate ${
                  currentStep >= s.num ? "text-[#2563EB] font-bold" : "text-[#64748B]"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: IDENTITY & PROFILE DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              {/* Official Assigned Agent Avatar (Fixed standardized badge) */}
              <div className="flex items-center gap-4 p-4 rounded-[14px] bg-slate-50 border border-[#E2E8F0]">
                <div className="relative w-16 h-16 rounded-full border-2 border-blue-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <img
                    src="/agent-avatar.png"
                    alt="Official Agent Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-mono font-bold uppercase text-[#334155]">
                      Assigned Agent Avatar
                    </label>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      Standard Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Standardized official Verisett node badge automatically assigned to your agent. Custom photo uploads are restricted.
                  </p>
                </div>
              </div>

              {/* Agent Identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#334155]">
                  Agent Name / Handle <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swarm-Alpha-Trader"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-[12px] bg-slate-50 border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:outline-none text-sm font-semibold text-[#0F172A] transition shadow-2xs"
                />
              </div>

              {/* Protocol selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#334155]">
                  Protocol / Framework Architecture <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-[12px] bg-slate-50 border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:outline-none text-sm font-semibold text-[#0F172A] transition appearance-none cursor-pointer shadow-2xs"
                  >
                    {FRAMEWORK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                    ▾
                  </div>
                </div>
              </div>

              {/* Spending Cap */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#334155]">
                  Spending Limit / Escrow Lock Cap (INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-[#64748B]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    placeholder="50000"
                    value={spendingLimit}
                    onChange={(e) => setSpendingLimit(e.target.value)}
                    className="w-full min-h-[46px] pl-8 pr-4 py-2.5 rounded-[12px] bg-slate-50 border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:outline-none text-sm font-mono font-bold text-[#0F172A] transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Webhook Callback URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#334155]">
                    Webhook Callback Endpoint
                  </label>
                  <span className="text-[10px] font-mono text-[#64748B]">Optional</span>
                </div>
                <input
                  type="url"
                  placeholder="https://api.yourdomain.com/v1/agent-webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-[12px] bg-slate-50 border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:outline-none text-sm font-mono text-[#0F172A] placeholder:text-slate-400 transition shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  <span>Continue to Security</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: CREDENTIAL PROVISIONING & EMAIL OTP */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Next} className="space-y-4">
              {/* Generated Globally Unique Agent ID */}
              <div className="p-4 rounded-[14px] bg-slate-50 border border-[#E2E8F0] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#334155] font-bold">
                    Allocated Unique Agent ID
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      generateAgentIdCodeAction().then((r) => {
                        if (r.success) setAgentIdCode(r.agentIdCode);
                      });
                    }}
                    className="text-[11px] font-mono text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-bold text-[#0F172A] bg-white px-3.5 py-2 rounded-[10px] border border-[#CBD5E1] shadow-2xs">
                    {agentIdCode || "Generating..."}
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-[8px] border border-emerald-200 font-mono font-medium">
                    ✓ Non-Colliding Tenant Unique
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Globally reserved identifier for cross-agent consensus and telemetry routing.
                </p>
              </div>

              {/* Agent Security Passphrase */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#334155]">
                  Agent Security Passphrase / Secret Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter agent security passphrase (min 6 characters)"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-[12px] bg-slate-50 border border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:outline-none text-sm font-semibold text-[#0F172A] transition shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Required for programmatic key rotations and autonomous contract sign-off.
                </p>
              </div>

              {/* Email Security Verification Code */}
              <div className="space-y-2 p-4 rounded-[14px] bg-blue-50/60 border border-blue-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#2563EB]" />
                    <span>Email Security Authorization Code</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="text-xs font-mono text-[#2563EB] hover:underline font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {isSendingOtp ? "Dispatching..." : "Resend Code"}
                  </button>
                </div>

                <p className="text-xs text-blue-900 leading-relaxed">
                  Verification code dispatched to: <strong className="font-mono">{userEmail}</strong>
                </p>

                {devOtpHint && (
                  <div className="px-3 py-1.5 rounded-[8px] bg-blue-100/90 border border-blue-300 text-blue-900 text-xs font-mono flex items-center justify-between">
                    <span>Developer Verification Code:</span>
                    <strong className="tracking-widest font-bold">{devOtpHint}</strong>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="6-digit code (e.g. 888888)"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-[12px] bg-white border border-blue-300 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-center font-mono font-bold text-lg tracking-widest text-[#0F172A] shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  <span>Continue to Consents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: LEGAL & PRIVACY CONSENTS */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div className="p-4 rounded-[14px] bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Statutory Node Settlement Compliance</span>
                </div>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  Autonomous agents execute programmatic transactions under cryptographic power of attorney. Verify compliance before signing.
                </p>
              </div>

              {/* Checkbox 1 */}
              <label className="flex items-start gap-3 p-4 rounded-[14px] bg-slate-50 border border-[#E2E8F0] hover:border-blue-400 transition cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#2563EB] rounded border-[#CBD5E1] focus:ring-blue-500 cursor-pointer"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-[#0F172A] block">
                    Protocol Settlement Terms &amp; Spending Cap Verification
                  </span>
                  <p className="text-[#64748B] text-[11px] leading-relaxed">
                    I agree to the Verisett Protocol Settlement Terms and verify that this agent has authorized spending limits for automated escrow clearing.
                  </p>
                </div>
              </label>

              {/* Checkbox 2 */}
              <label className="flex items-start gap-3 p-4 rounded-[14px] bg-slate-50 border border-[#E2E8F0] hover:border-blue-400 transition cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentPrivacy}
                  onChange={(e) => setConsentPrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#2563EB] rounded border-[#CBD5E1] focus:ring-blue-500 cursor-pointer"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-[#0F172A] block">
                    Telemetry Privacy &amp; Autonomous Processing Agreement
                  </span>
                  <p className="text-[#64748B] text-[11px] leading-relaxed">
                    I accept the Data Processing &amp; Autonomous Agent Telemetry Privacy Policy for multi-tenant node operations.
                  </p>
                </div>
              </label>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !consentTerms || !consentPrivacy}
                  className="px-7 py-3 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-blue-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning Node...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Authorize &amp; Provision Agent</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: IMMEDIATE ROUTING & ONE-TIME SECRET TOKEN REVEAL */}
          {/* ========================================================================= */}
          {currentStep === 4 && generatedApiKey && (
            <div className="space-y-5 animate-in fade-in">
              {/* Security Warning Alert */}
              <div className="p-4 rounded-[14px] bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-950">
                    Important: Copy Your API Secret Key Now
                  </p>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    This raw secret token is displayed only once. It will not be stored in plaintext and cannot be recovered if lost. Store it in a secure environment variable.
                  </p>
                </div>
              </div>

              {/* Generated API Key Card */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#334155] font-bold block">
                  Agent Authentication Key
                </label>
                <div className="p-3.5 rounded-[12px] bg-slate-900 border border-slate-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shadow-inner">
                  <span className="font-mono text-xs sm:text-sm text-emerald-400 select-all break-all">
                    {generatedApiKey}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="shrink-0 px-3.5 py-2 rounded-[8px] bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Provisioned Node Summary */}
              {registeredAgent && (
                <div className="p-4 rounded-[14px] bg-slate-50 border border-[#E2E8F0] space-y-2 text-xs">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                    Registered Node Specification
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Identifier</span>
                      <span className="font-bold text-[#0F172A] font-mono">
                        {registeredAgent.agentIdCode} ({registeredAgent.agentName})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Protocol</span>
                      <span className="font-semibold text-[#2563EB] font-mono">
                        {registeredAgent.framework}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Spending Cap</span>
                      <span className="font-bold text-[#0F172A] font-mono">
                        ₹{registeredAgent.spendingLimit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Initial Status</span>
                      <span className="font-mono text-slate-500 font-semibold">
                        Unlinked (Awaiting First Ping)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quickstart CLI Snippet */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#334155] font-bold block">
                  Quickstart CLI Integration
                </label>
                <div className="p-3 rounded-[12px] bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono text-slate-300">
                  <code className="text-slate-300 break-all">{launchSnippet}</code>
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="shrink-0 p-2 rounded-[8px] bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
                    title="Copy command"
                  >
                    {copiedSnippet ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Route to Dashboard Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-7 py-3 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enter Terminal Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
