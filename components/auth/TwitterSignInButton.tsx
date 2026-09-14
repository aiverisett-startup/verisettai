"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { XIcon } from "@/components/ui/XIcon";
import { Loader2 } from "lucide-react";

interface TwitterSignInButtonProps {
  onSuccess?: (user: { email: string; name: string; avatar?: string }) => void;
  className?: string;
  buttonText?: string;
  theme?: "light" | "dark";
}

export function TwitterSignInButton({
  onSuccess,
  className = "",
  buttonText = "Continue with X",
}: TwitterSignInButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleTwitterClick = async () => {
    setIsLoading(true);
    setNotice(null);
    try {
      // Connect to Supabase client auth with 'x' (and graceful 'twitter' fallback)
      let res = await supabase.auth.signInWithOAuth({
        provider: "x" as any,
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });

      if (res.error && res.error.message?.toLowerCase().includes("provider")) {
        res = await supabase.auth.signInWithOAuth({
          provider: "twitter",
          options: {
            redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
          },
        });
      }

      if (res.error) {
        setNotice(res.error.message || "Failed to initiate X / Twitter authentication.");
        return;
      }

      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
    } catch (err: any) {
      setNotice(err?.message || "Error connecting to X authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={handleTwitterClick}
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-xl border border-stone-800 bg-black text-white hover:bg-stone-900 transition flex items-center justify-between gap-3 text-sm font-medium cursor-pointer shadow-xs disabled:opacity-60 font-montserrat"
      >
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#C59B5F]" />
          ) : (
            <XIcon className="w-4 h-4 shrink-0 text-white fill-current" />
          )}
          <span>{isLoading ? "Connecting to X..." : buttonText}</span>
        </div>

        <span className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[10px] font-mono text-stone-300 font-semibold uppercase tracking-wider shrink-0">
          OAUTH 2.0
        </span>
      </button>

      {notice && (
        <p className="mt-2 text-center text-[11px] font-montserrat text-[#9E7A45] font-medium animate-in fade-in duration-200">
          {notice}
        </p>
      )}
    </div>
  );
}

export { TwitterSignInButton as XSignInButton };
