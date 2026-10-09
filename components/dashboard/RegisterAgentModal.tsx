"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Upload,
  Mail,
  Lock,
  FileCheck2,
  Loader2,
  RefreshCw,
  Sparkles,
  Camera,
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [framework, setFramework] = useState("FastMCP");
  const [spendingLimit, setSpendingLimit] = useState("50000");
  const [webhookUrl, setWebhookUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    setAvatarUrl(null);
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

  // Avatar Image Upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Avatar file size must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#EAE3D2] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#F0E9DC] bg-[#FAF8F5]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#1C1A17] tracking-tight">
                  AI Agent Registration Flow
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                  Step {currentStep} of 4
                </span>
              </div>
              <p className="text-xs text-[#8C8275]">
                {currentStep === 1 && "Step 1: Identity & Protocol Parameters"}
                {currentStep === 2 && "Step 2: ID Allocation & Email Authorization"}
                {currentStep === 3 && "Step 3: Protocol Escrow Legal Consents"}
                {currentStep === 4 && "Step 4: Cryptographic Key Provisioned"}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-[#8C8275] hover:text-[#1C1A17] hover:bg-neutral-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-4 px-6 pt-3 pb-2 border-b border-[#F0E9DC] gap-2 bg-[#FCFAF7]">
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
                    ? "bg-blue-600"
                    : "bg-neutral-200"
                }`}
              />
              <span
                className={`text-[10px] font-mono font-medium truncate ${
                  currentStep >= s.num ? "text-blue-700 font-semibold" : "text-[#8C8275]"
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
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: IDENTITY & PROFILE DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
                <div className="relative w-16 h-16 rounded-2xl border-2 border-dashed border-[#D6CDBC] bg-white flex items-center justify-center overflow-hidden shrink-0 group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Bot className="w-8 h-8 text-[#8C8275]" />
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase text-[#4A453E]">
                      Agent Avatar / Badge
                    </label>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(null)}
                        className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8C8275]">
                    Upload a custom node badge (PNG/JPG, max 2MB) or keep default.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D6CDBC] bg-white hover:bg-neutral-50 text-xs font-semibold text-[#1C1A17] transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{avatarUrl ? "Replace Avatar" : "Choose Image"}</span>
                  </button>
                </div>
              </div>

              {/* Agent Identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4A453E]">
                  Agent Name / Handle <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swarm-Alpha-Trader"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-semibold text-[#1C1A17] transition"
                />
              </div>

              {/* Protocol selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4A453E]">
                  Protocol / Framework Architecture <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-semibold text-[#1C1A17] transition appearance-none cursor-pointer"
                  >
                    {FRAMEWORK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8C8275]">
                    ▾
                  </div>
                </div>
              </div>

              {/* Spending Cap */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4A453E]">
                  Spending Limit / Escrow Lock Cap (INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-[#8C8275]">
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
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-mono font-bold text-[#1C1A17] transition"
                  />
                </div>
              </div>

              {/* Webhook Callback URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4A453E]">
                    Webhook Callback Endpoint
                  </label>
                  <span className="text-[10px] font-mono text-[#8C8275]">Optional</span>
                </div>
                <input
                  type="url"
                  placeholder="https://api.yourdomain.com/v1/agent-webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-mono text-[#1C1A17] placeholder:text-[#A8A196] transition"
                />
              </div>

              <div className="pt-3 border-t border-[#F0E9DC] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-[#8C8275] hover:text-[#1C1A17] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
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
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#6E675D] font-bold">
                    Allocated Unique Agent ID
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      generateAgentIdCodeAction().then((r) => {
                        if (r.success) setAgentIdCode(r.agentIdCode);
                      });
                    }}
                    className="text-[11px] font-mono text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-[#1C1A17] bg-white px-3 py-1.5 rounded-xl border border-[#D6CDBC]">
                    {agentIdCode || "Generating..."}
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-mono">
                    ✓ Non-Colliding Tenant Unique
                  </span>
                </div>
                <p className="text-[11px] text-[#8C8275]">
                  Globally reserved identifier for cross-agent consensus and telemetry routing.
                </p>
              </div>

              {/* Agent Security Passphrase */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4A453E]">
                  Agent Security Passphrase / Secret Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter agent security passphrase (min 6 characters)"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:bg-white focus:outline-none text-sm font-semibold text-[#1C1A17] transition"
                  />
                </div>
                <p className="text-[11px] text-[#8C8275]">
                  Required for programmatic key rotations and autonomous contract sign-off.
                </p>
              </div>

              {/* Email Security Verification Code */}
              <div className="space-y-2 p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Email Security Authorization Code</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="text-xs font-mono text-blue-700 hover:underline font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {isSendingOtp ? "Dispatching..." : "Resend Code"}
                  </button>
                </div>

                <p className="text-xs text-blue-900 leading-relaxed">
                  Verification code dispatched to: <strong className="font-mono">{userEmail}</strong>
                </p>

                {devOtpHint && (
                  <div className="px-3 py-1.5 rounded-xl bg-blue-100/80 border border-blue-300 text-blue-900 text-xs font-mono flex items-center justify-between">
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
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-blue-300 focus:border-blue-600 focus:outline-none text-center font-mono font-bold text-lg tracking-widest text-[#1C1A17]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0E9DC] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-[#8C8275] hover:text-[#1C1A17] transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
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
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Statutory Node Settlement Compliance</span>
                </div>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  Autonomous agents execute programmatic transactions under cryptographic power of attorney. Verify compliance before signing.
                </p>
              </div>

              {/* Checkbox 1 */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] hover:border-blue-400 transition cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-[#D6CDBC] focus:ring-blue-500 cursor-pointer"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-[#1C1A17] block">
                    Protocol Settlement Terms &amp; Spending Cap Verification
                  </span>
                  <p className="text-[#6E675D] text-[11px] leading-relaxed">
                    I agree to the Verisett Protocol Settlement Terms and verify that this agent has authorized spending limits for automated escrow clearing.
                  </p>
                </div>
              </label>

              {/* Checkbox 2 */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] hover:border-blue-400 transition cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentPrivacy}
                  onChange={(e) => setConsentPrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-[#D6CDBC] focus:ring-blue-500 cursor-pointer"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-[#1C1A17] block">
                    Telemetry Privacy &amp; Autonomous Processing Agreement
                  </span>
                  <p className="text-[#6E675D] text-[11px] leading-relaxed">
                    I accept the Data Processing &amp; Autonomous Agent Telemetry Privacy Policy for multi-tenant node operations.
                  </p>
                </div>
              </label>

              <div className="pt-3 border-t border-[#F0E9DC] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-[#8C8275] hover:text-[#1C1A17] transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !consentTerms || !consentPrivacy}
                  className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
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
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#6E675D] font-bold block">
                  Agent Authentication Key
                </label>
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 shadow-inner">
                  <span className="font-mono text-xs sm:text-sm text-emerald-400 select-all truncate">
                    {generatedApiKey}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Provisioned Node Summary */}
              {registeredAgent && (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] space-y-2 text-xs">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#8C8275] font-bold">
                    Registered Node Specification
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#8C8275] block text-[11px]">Identifier</span>
                      <span className="font-bold text-[#1C1A17] font-mono">
                        {registeredAgent.agentIdCode} ({registeredAgent.agentName})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C8275] block text-[11px]">Protocol</span>
                      <span className="font-semibold text-blue-700 font-mono">
                        {registeredAgent.framework}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C8275] block text-[11px]">Spending Cap</span>
                      <span className="font-bold text-[#1C1A17] font-mono">
                        ₹{registeredAgent.spendingLimit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C8275] block text-[11px]">Initial Status</span>
                      <span className="font-mono text-neutral-500 font-semibold">
                        Unlinked (Awaiting First Ping)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quickstart CLI Snippet */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#6E675D] font-bold block">
                  Quickstart CLI Integration
                </label>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs font-mono text-zinc-300">
                  <code className="text-zinc-300 truncate">{launchSnippet}</code>
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="shrink-0 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer"
                    title="Copy command"
                  >
                    {copiedSnippet ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Route to Dashboard Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
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
