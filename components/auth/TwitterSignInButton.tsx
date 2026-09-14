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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/`,
        },
      });

      if (error) {
        setNotice(error.message || "Failed to initiate X / Twitter authentication.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err: any) {
      setNotice(err?.message || "Error connecting to X / Twitter authentication service.");
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
        className="w-full h-11 px-4 rounded-xl border border-[#EAE3D2] bg-white hover:bg-[#FAF8F5] active:bg-[#F5EEDB]/40 text-[#1C1A17] font-montserrat text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:border-[#C59B5F]/40 disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#C59B5F]" />
        ) : (
          <XIcon className="w-4 h-4 shrink-0 text-[#1C1A17]" />
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
