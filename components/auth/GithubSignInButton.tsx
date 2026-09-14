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
}

export function GithubSignInButton({
  onSuccess,
  className = "",
  buttonText = "Continue with GitHub",
  theme = "light",
}: GithubSignInButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleGithubClick = async () => {
    setIsLoading(true);
    setNotice(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
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
      <div className="relative group w-full">
        {/* Subtle Dark Ambient Glow */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-slate-600/20 via-zinc-500/15 to-slate-700/20 blur-md opacity-30 group-hover:opacity-70 group-hover:blur-lg transition-all duration-500 pointer-events-none" />

        <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-[#27272A] via-[#3F3F46] to-[#27272A] hover:from-[#3F3F46] hover:via-[#52525B] hover:to-[#3F3F46] shadow-[0_4px_16px_rgba(0,0,0,0.15)] group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.25)] transition-all duration-300">
          <button
            type="button"
            onClick={handleGithubClick}
            disabled={isLoading}
            className="relative w-full py-3 px-4 rounded-[14px] bg-[#141416] hover:bg-[#1A1A1E] flex items-center justify-between gap-3 overflow-hidden cursor-pointer transition-all duration-300 select-none active:scale-[0.985]"
          >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-[#3F3F46] shadow-[0_3px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center shrink-0 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#C59B5F]" />
                ) : (
                  <svg
                    className="w-5 h-5 shrink-0 fill-current"
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
              </div>

              <div className="flex flex-col items-start text-left">
                <span className="font-montserrat font-extrabold text-xs sm:text-sm text-white tracking-tight">
                  {isLoading ? "Authenticating..." : buttonText}
                </span>
                <span className="text-[10px] font-montserrat font-medium text-[#A1A1AA] tracking-wide hidden xs:block">
                  Developer Clearance · Org Repos
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-1.5 py-1 px-3 rounded-full bg-[#27272A] border border-[#3F3F46] text-[10px] font-montserrat font-bold text-[#D4D4D8] tracking-wider uppercase shrink-0">
              <span>OAUTH 2.0</span>
            </div>
          </button>
        </div>
      </div>

      {notice && (
        <p className="mt-2 text-center text-[11px] font-montserrat text-[#9E7A45] font-bold animate-in fade-in duration-200">
          {notice}
        </p>
      )}
    </div>
  );
}
