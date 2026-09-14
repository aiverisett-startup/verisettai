"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { Loader2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { dispatchAuthChange } from "@/lib/useAuthUser";
import { supabase } from "@/lib/supabase";

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "11208389629-2r35q7a9luheces1hsdlv40bpmg2to7l.apps.googleusercontent.com";

interface GoogleSignInButtonProps {
  onSuccess?: (user: { email: string; name: string; avatar?: string }) => void;
  className?: string;
  buttonText?: string;
  theme?: "light" | "dark";
}

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture?: string;
  sub?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  onSuccess,
  className = "",
  buttonText = "Continue with Google",
  theme = "light",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const decodeJwt = (token: string): GoogleJwtPayload | null => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const completeUserSession = (userData: { email: string; name: string; avatar?: string }) => {
    try {
      localStorage.setItem("verisett_user_email", userData.email);
      localStorage.setItem("verisett_user_name", userData.name);
      if (userData.avatar) localStorage.setItem("verisett_user_avatar", userData.avatar);
      localStorage.setItem("verisett_auth_provider", "google");
      localStorage.setItem("verisett_session_timestamp", Date.now().toString());
      dispatchAuthChange();
    } catch {
      // Ignore storage errors
    }

    if (onSuccess) {
      onSuccess(userData);
    } else {
      router.push("/");
    }
  };

  const handleCredentialResponse = (response: { credential: string }) => {
    setIsLoading(true);
    const payload = decodeJwt(response.credential);
    if (!payload?.email) {
      setStatusNotice("Unable to verify Google identity payload. Please try again.");
      setIsLoading(false);
      return;
    }
    const email = payload.email;
    const name = payload.name || email.split("@")[0];
    const avatar = payload.picture || undefined;

    const userData = { email, name, avatar };
    completeUserSession(userData);
    setIsLoading(false);
  };

  // Background initialization of Google One-Tap if client script is present
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch {
        // Non-blocking
      }
    }
  }, []);

  const handleGoogleClick = async () => {
    setIsLoading(true);
    setStatusNotice(null);

    // 1. Try Google OAuth via Supabase
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/`,
        },
      });

      if (error) {
        setStatusNotice(error.message || "Failed to initiate Google authentication.");
        setIsLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err: any) {
      setStatusNotice(err?.message || "Error connecting to Google authentication service.");
      setIsLoading(false);
      return;
    }

    // 2. Try Google One-Tap prompt if loaded
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
            setIsLoading(false);
          }
        });
        return;
      } catch {
        setIsLoading(false);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* High-Tech Luxury Google Sign-In Component with Dynamic Aurora Aura */}
      <div className="relative group w-full">
        {/* Multi-Spectrum Google & Gold Ambient Aurora Glow */}
        <div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#4285F4]/30 via-[#EA4335]/25 via-[#FBBC05]/25 via-[#34A853]/25 to-[#D4AF37]/40 blur-md opacity-50 group-hover:opacity-100 group-hover:blur-xl transition-all duration-500 animate-aurora-glow pointer-events-none"
        />

        {/* Dynamic Continuous Flowing Gradient Prism Border */}
        <div className="relative p-[2px] rounded-2xl bg-[linear-gradient(90deg,#D4AF37,#4285F4,#EA4335,#FBBC05,#34A853,#D4AF37)] bg-[length:300%_300%] animate-gradient-flow shadow-[0_4px_24px_rgba(197,155,95,0.18)] group-hover:shadow-[0_8px_36px_rgba(66,133,244,0.32)] transition-shadow duration-300">
          {/* Main Interactive Button Card */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className={`relative w-full py-3 px-4 rounded-[14px] flex items-center justify-between gap-3 overflow-hidden cursor-pointer transition-all duration-300 select-none ${
              theme === "dark"
                ? "bg-[#0C1017]/95 hover:bg-[#121824] text-white"
                : "bg-white/95 hover:bg-[#FCFAF7] text-[#1C1A17]"
            } shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(197,155,95,0.15)] active:scale-[0.985]`}
          >
            {/* Holographic Angle Shimmer Sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

            {/* Corner Warm Satin Glow */}
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[#C59B5F]/15 rounded-full blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-150" />

            {/* Left Section: 3D Raised Icon Emblem + Dual Typography */}
            <div className="flex items-center gap-3.5 relative z-10">
              {/* Jeweled 3D Emblem Container */}
              <div
                className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-5deg] ${
                  theme === "dark"
                    ? "bg-gradient-to-b from-[#1C2433] to-[#0E1524] border border-slate-700/80 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)]"
                    : "bg-gradient-to-b from-white to-[#F9F7F2] border border-[#EAE3D2] shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_2px_#FFFFFF] group-hover:shadow-[0_6px_18px_rgba(66,133,244,0.3)]"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#C59B5F]" />
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-105" />
                    {/* Micro 4-Color Status Dot Halo */}
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4285F4] ring-2 ring-white" />
                  </>
                )}
              </div>

              {/* Typography Hierarchy */}
              <div className="flex flex-col items-start text-left">
                <span
                  className={`font-montserrat font-extrabold text-xs sm:text-sm tracking-tight transition-colors ${
                    theme === "dark"
                      ? "text-white group-hover:text-[#D4AF37]"
                      : "text-[#1C1A17] group-hover:text-[#9E7A45]"
                  }`}
                >
                  {isLoading ? "Authenticating..." : buttonText}
                </span>

                {/* Subtitle with Pulse Signal */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-montserrat font-semibold text-[#8C8275] tracking-wide">
                    Institutional SSO · Instant Clearance
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section: Gold Foil Action Pill with Sparkle Animation */}
            <div className="relative z-10 flex items-center gap-1.5 py-1 px-3 rounded-full bg-gradient-to-r from-[#FAF6EE] to-[#F5EEDB] group-hover:from-[#C59B5F] group-hover:to-[#D4AF37] border border-[#D4AF37]/40 shadow-xs transition-all duration-300 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#C59B5F] group-hover:text-white animate-pulse shrink-0" />
              <span className="text-[10px] font-montserrat font-extrabold text-[#9E7A45] group-hover:text-white uppercase tracking-wider hidden xs:inline">
                1-CLICK
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#9E7A45] group-hover:text-white group-hover:translate-x-0.5 transition-transform duration-300 shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {/* Optional Status Notice */}
      {statusNotice && (
        <p className="mt-2 text-center text-[11px] font-montserrat text-[#9E7A45] font-bold animate-in fade-in duration-200">
          {statusNotice}
        </p>
      )}
    </div>
  );
}
