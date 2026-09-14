"use client";

import React, { useState, useId } from "react";
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export interface AccessAccountFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AccessAccountFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface AccessAccountLoginProps {
  onSubmit?: (values: AccessAccountFormValues) => Promise<void> | void;
  onRegisterClick?: () => void;
  onSocialAuth?: (provider: "google" | "github" | "apple" | "microsoft") => void;
  onForgotPasswordClick?: () => void;
  className?: string;
  defaultEmail?: string;
}

/**
 * Custom validation hook for email & password authentication
 */
export function useAccessAccountValidation() {
  const [errors, setErrors] = useState<AccessAccountFormErrors>({});

  const validate = (values: AccessAccountFormValues): boolean => {
    const nextErrors: AccessAccountFormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!values.password) {
      nextErrors.password = "Password is required";
    } else if (values.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearFieldError = (field: keyof AccessAccountFormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  return {
    errors,
    setErrors,
    validate,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0,
  };
}

export function AccessAccountLogin({
  onSubmit,
  onRegisterClick,
  onSocialAuth,
  onForgotPasswordClick,
  className = "",
  defaultEmail = "",
}: AccessAccountLoginProps) {
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { errors, setErrors, validate, clearFieldError } = useAccessAccountValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);

    const values: AccessAccountFormValues = {
      email: email.trim(),
      password,
      rememberMe,
    };

    if (!validate(values)) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        // Default local persistence simulation
        try {
          localStorage.setItem("verisett_user_email", values.email);
          localStorage.setItem("verisett_user_name", values.email.split("@")[0]);
        } catch {
          // ignore
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setSubmitSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please verify credentials.";
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) clearFieldError("email");
    if (errors.general) clearFieldError("general");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) clearFieldError("password");
    if (errors.general) clearFieldError("general");
  };

  return (
    <div
      className={`login-page-montserrat font-montserrat w-full max-w-sm sm:w-[380px] rounded-3xl bg-white p-7 sm:p-9 border border-[#EFECE6] shadow-[0_16px_48px_-12px_rgba(197,155,95,0.14),0_6px_24px_-6px_rgba(0,0,0,0.03)] transition-all duration-300 ${className}`}
    >
      {/* Refined Header */}
      <header className="text-center mb-7 font-montserrat">
        {/* Subtle Decorative Golden Emblem */}
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F9F8F6] border border-[#D4AF37]/30 text-[#C59B5F] shadow-xs">
          <Lock className="h-4 w-4 text-[#9E7A45]" strokeWidth={2.2} />
        </div>

        <h1 className="font-montserrat text-2xl sm:text-3xl font-extrabold tracking-tight text-[#9E7A45]">
          LOGIN
        </h1>
        <p className="font-montserrat mt-1.5 text-xs sm:text-sm font-medium text-[#8C8275] tracking-normal">
          Enter your credentials to continue to your workspace
        </p>
      </header>

      {/* General Error Banner if present */}
      {errors.general && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 animate-in fade-in duration-200 font-montserrat font-medium"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-relaxed">{errors.general}</span>
        </div>
      )}

      {/* Success Notification if authenticated */}
      {submitSuccess && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#FAF8F5] p-3 text-xs text-[#9E7A45] font-montserrat font-semibold animate-in fade-in duration-200"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C59B5F]" />
          <span>Access verified. Redirecting to workspace...</span>
        </div>
      )}

      {/* Reactive Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={emailId}
              className="text-[10px] sm:text-[11px] font-montserrat font-bold text-[#4A453E] tracking-[0.12em] uppercase"
            >
              Email Address
            </label>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#B5B0A6]">
              <Mail className="h-4 w-4" />
            </div>

            <input
              id={emailId}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="name@company.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${emailId}-error` : undefined}
              className={`w-full rounded-xl bg-[#FAF9F7] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#2C2925] placeholder:text-[#B5B0A6] font-montserrat border transition-all duration-200 focus:outline-none focus:bg-white ${
                errors.email
                  ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 bg-rose-50/20"
                  : "border-[#E5E0D8] hover:border-[#D4AF37]/50 focus:border-[#C59B5F] focus:ring-2 focus:ring-[#C59B5F]/25"
              }`}
            />
          </div>

          {errors.email && (
            <p id={`${emailId}-error`} className="mt-1 text-xs font-montserrat text-rose-600 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={passwordId}
              className="text-[10px] sm:text-[11px] font-montserrat font-bold text-[#4A453E] tracking-[0.12em] uppercase"
            >
              Password
            </label>

            {onForgotPasswordClick && (
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-xs font-montserrat font-semibold text-[#9E7A45] hover:text-[#C59B5F] transition-colors cursor-pointer"
              >
                Forgot?
              </button>
            )}
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#B5B0A6]">
              <Lock className="h-4 w-4" />
            </div>

            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? `${passwordId}-error` : undefined}
              className={`w-full rounded-xl bg-[#FAF9F7] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#2C2925] placeholder:text-[#B5B0A6] font-montserrat border transition-all duration-200 focus:outline-none focus:bg-white ${
                errors.password
                  ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 bg-rose-50/20"
                  : "border-[#E5E0D8] hover:border-[#D4AF37]/50 focus:border-[#C59B5F] focus:ring-2 focus:ring-[#C59B5F]/25"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#B5B0A6] hover:text-[#6E675D] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {errors.password && (
            <p id={`${passwordId}-error`} className="mt-1 text-xs font-montserrat text-rose-600 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember Me Option */}
        <div className="flex items-center pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[#D4AF37]/60 text-[#C59B5F] focus:ring-[#C59B5F]/30 focus:ring-offset-0 cursor-pointer accent-[#C59B5F]"
            />
            <span className="text-xs font-montserrat font-medium text-[#6E675D]">Remember this device</span>
          </label>
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-1.5 py-3 px-4 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] active:bg-[#9E7A45] text-white font-montserrat font-bold text-xs sm:text-sm tracking-[0.1em] uppercase transition-all duration-200 shadow-[0_4px_14px_rgba(197,155,95,0.3)] hover:shadow-[0_6px_20px_rgba(197,155,95,0.4)] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        {/* Register Now Link */}
        <div className="text-center pt-1.5">
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-xs sm:text-sm font-montserrat font-semibold text-[#9E7A45] hover:text-[#C59B5F] transition-colors cursor-pointer inline-flex items-center gap-1 group"
          >
            <span>Don&apos;t have an account?</span>
            <span className="underline decoration-[#C59B5F]/40 underline-offset-4 group-hover:decoration-[#C59B5F]">
              Register Now
            </span>
          </button>
        </div>
      </form>

      {/* Third-Party Authentication Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[#EAE6DF]" />
        </div>
        <span className="relative bg-white px-3 text-[10px] sm:text-[11px] font-montserrat font-semibold text-[#A8A196] uppercase tracking-[0.14em]">
          Sign in with
        </span>
      </div>

      {/* Horizontal Social Auth Buttons (Google, GitHub, Apple, Microsoft) */}
      <div className="grid grid-cols-4 gap-2">
        {/* Google */}
        <button
          type="button"
          onClick={() => onSocialAuth?.("google")}
          aria-label="Sign in with Google"
          title="Sign in with Google"
          className="h-10 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#D4AF37] hover:bg-[#FAF8F5] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.97]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              fill="#4285F4"
            />
            <path
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              fill="#34A853"
            />
            <path
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              fill="#FBBC05"
            />
            <path
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              fill="#EA4335"
            />
          </svg>
        </button>

        {/* GitHub */}
        <button
          type="button"
          onClick={() => onSocialAuth?.("github")}
          aria-label="Sign in with GitHub"
          title="Sign in with GitHub"
          className="h-10 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#D4AF37] hover:bg-[#FAF8F5] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.97]"
        >
          <svg className="h-4 w-4 fill-[#18181B]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={() => onSocialAuth?.("apple")}
          aria-label="Sign in with Apple"
          title="Sign in with Apple"
          className="h-10 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#D4AF37] hover:bg-[#FAF8F5] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.97]"
        >
          <svg className="h-4 w-4 fill-[#111317]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.34-.56.64-1.04 1.71-.91 2.73 1 .08 2.02-.51 2.6-1.22z" />
          </svg>
        </button>

        {/* Microsoft */}
        <button
          type="button"
          onClick={() => onSocialAuth?.("microsoft")}
          aria-label="Sign in with Microsoft"
          title="Sign in with Microsoft"
          className="h-10 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#D4AF37] hover:bg-[#FAF8F5] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.97]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="10" height="10" fill="#F25022" />
            <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
            <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
            <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
          </svg>
        </button>
      </div>

      {/* Subtle Bottom Accent Tag */}
      <div className="mt-6 pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-[10px] text-[#A8A196] font-mono">
        <span className="flex items-center gap-1 text-[#9E7A45]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C59B5F]" />
          TLS 1.3 ENCRYPTED
        </span>
        <span>SECURE VAULT ACCESS</span>
      </div>
    </div>
  );
}
