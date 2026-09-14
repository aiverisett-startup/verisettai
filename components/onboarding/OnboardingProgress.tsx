"use client";

import React from "react";
import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
}

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const steps = [
    { num: 1, label: "Operator Identity", code: "01" },
    { num: 2, label: "Tenant Configuration", code: "02" },
    { num: 3, label: "Runtime Attestation", code: "03" },
  ];

  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between relative">
        {/* Connecting Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-200 -translate-y-1/2 z-0" />

        {/* Active Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-[#09090B] -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = step.num < currentStep;
          const isActive = step.num === currentStep;

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-[#059669] text-white border-2 border-[#059669] shadow-xs"
                    : isActive
                    ? "bg-[#09090B] text-white border-2 border-[#09090B] ring-4 ring-zinc-100 shadow-sm"
                    : "bg-white text-[#71717A] border-2 border-zinc-200"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 text-white" /> : step.code}
              </div>
              <span
                className={`mt-2 text-[11px] font-mono tracking-wide hidden sm:block ${
                  isActive ? "text-[#09090B] font-bold" : "text-[#71717A]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
