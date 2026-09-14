"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { Loader2 } from "lucide-react";
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
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isLoading}
        className="w-full h-11 px-4 rounded-xl border border-[#EAE3D2] bg-white hover:bg-[#FAF8F5] active:bg-[#F5EEDB]/40 text-[#1C1A17] font-montserrat text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:border-[#C59B5F]/40 disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#C59B5F]" />
        ) : (
          <GoogleIcon className="w-4 h-4 shrink-0" />
        )}
        <span>{isLoading ? "Signing in..." : buttonText}</span>
      </button>

      {statusNotice && (
        <p className="mt-2 text-center text-[11px] font-montserrat text-[#9E7A45] font-medium animate-in fade-in duration-200">
          {statusNotice}
        </p>
      )}
    </div>
  );
}
