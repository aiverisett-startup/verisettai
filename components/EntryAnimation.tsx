"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import VellixyLogo from "./VellixyLogo";

interface EntryAnimationProps {
  onComplete: () => void;
}

export default function EntryAnimation({ onComplete }: EntryAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const bootSteps = [
    "BIOS_INIT // VELLIXY HARDWARE HYPERVISOR v1.0",
    "ALLOCATING AMD SEV-SNP ISOLATED RAM MESH",
    "PCR REGISTERS LOCKED (PCR0, PCR1, PCR2)",
    "DETERMINISTIC OPA REGO POLICIES COMPILED",
    "SOVEREIGN STATE MACHINE READY // 0.00ms SLA",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 4;
        const next = Math.min(100, prev + increment);
        if (next > 20 && currentStep === 0) setCurrentStep(1);
        if (next > 45 && currentStep <= 1) setCurrentStep(2);
        if (next > 70 && currentStep <= 2) setCurrentStep(3);
        if (next > 90 && currentStep <= 3) setCurrentStep(4);
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [currentStep]);

  useEffect(() => {
    if (progress === 100) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        const completeTimer = setTimeout(() => {
          onComplete();
        }, 600);
        return () => clearTimeout(completeTimer);
      }, 400);
      return () => clearTimeout(exitTimer);
    }
  }, [progress, onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(onComplete, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#faf9f6] transition-opacity duration-500 ease-in-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Top Header Row */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between font-mono text-xs text-[#6b7280]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span className="font-medium text-[#111827]">BOOT_SEQUENCE // VELLIXY_v1.0</span>
        </div>
        <button
          onClick={handleSkip}
          className="px-3 py-1 rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f4f4f6] text-[#111827] transition-colors cursor-pointer"
        >
          Skip [ESC]
        </button>
      </div>

      {/* Center Hardware Monogram Enclosure */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
        <div className="relative p-6 rounded-3xl bg-white border border-[#e5e7eb] shadow-sm mb-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-[#faf9f6] border border-[#e5e7eb] flex items-center justify-center">
            <VellixyLogo className="w-12 h-12" size={48} />
          </div>

          <div className="mt-4 text-center">
            <div className="text-base font-semibold tracking-tight text-[#111827]">
              Vellixy
            </div>
            <div className="text-[10px] font-mono text-[#059669] mt-0.5 font-medium">
              HARDWARE ENCLAVE VERIFIED
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2 mb-6 max-w-sm">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-medium text-[#111827]">INITIALIZING RUNTIME</span>
            <span className="font-semibold text-[#2563eb]">{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden">
            <div
              className="h-full bg-[#111827] rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Telemetry Boot Logs */}
        <div className="w-full max-w-sm p-4 rounded-2xl bg-white border border-[#e5e7eb] font-mono text-[11px] space-y-2">
          {bootSteps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2.5 transition-opacity duration-300 ${
                idx <= currentStep ? "opacity-100" : "opacity-30"
              }`}
            >
              {idx < currentStep ? (
                <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
              ) : idx === currentStep ? (
                <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-zinc-300 shrink-0" />
              )}
              <span
                className={
                  idx === currentStep
                    ? "font-medium text-[#111827]"
                    : "text-[#6b7280]"
                }
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Legal Status */}
      <div className="absolute bottom-6 font-mono text-[11px] text-[#6b7280]">
        VELLIXY ENTERPRISE RUNTIME // CONFIDENTIAL COMPUTING CORE
      </div>
    </div>
  );
}
