"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface GithubSignInButtonProps {
  onSuccess?: (user: { email: string; name: string; avatar?: string }) => void;
  className?: string;
  buttonText?: string;
  theme?: "light" | "dark";
  redirect?: string;
}

export function GithubSignInButton({
  onSuccess,
  className = "",
  buttonText = "Continue with GitHub",
  redirect = "/dashboard",
}: GithubSignInButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleGithubClick = async () => {
    setIsLoading(true);
    setNotice(null);
    try {
      const target = redirect || "/dashboard";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(target)}`,
        },
      });

      if (error) {
        setNotice(error.message || "Failed to initiate GitHub authentication.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err: any) {
      setNotice(err?.message || "Error connecting to GitHub authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={handleGithubClick}
        disabled={isLoading}
        className="w-full h-11 px-4 rounded-xl border border-[#EAE3D2] bg-white hover:bg-[#FAF8F5] active:bg-[#F5EEDB]/40 text-[#1C1A17] font-montserrat text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:border-[#C59B5F]/40 disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#C59B5F]" />
        ) : (
          <svg
            className="w-4 h-4 shrink-0 fill-current text-[#1C1A17]"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        )}
        <span>{isLoading ? "Signing in..." : buttonText}</span>
      </button>

      {notice && (
        <p className="mt-2 text-center text-[11px] font-montserrat text-[#9E7A45] font-medium animate-in fade-in duration-200">
          {notice}
        </p>
      )}
    </div>
  );
}
