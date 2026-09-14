"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1C1A17] flex items-center justify-center font-mono text-xs text-[#8C8275]">
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#EAE3D2] shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#C59B5F] animate-ping" />
        <span className="text-[#9E7A45] font-semibold tracking-wider">REDIRECTING_TO_OPERATOR_CONSOLE...</span>
      </div>
    </div>
  );
}
