"use client";

import React from "react";
import { User, Briefcase, Globe, ArrowRight } from "lucide-react";

export interface IdentityData {
  fullName: string;
  role: string;
  timezone: string;
}

interface StepIdentityProps {
  data: IdentityData;
  onChange: (updated: Partial<IdentityData>) => void;
  onNext: () => void;
}

export default function StepIdentity({ data, onChange, onNext }: StepIdentityProps) {
  const timezones = [
    "UTC (Coordinated Universal Time)",
    "America/New_York (EST / EDT - US East)",
    "America/Chicago (CST / CDT - US Central)",
    "America/Los_Angeles (PST / PDT - US West)",
    "Europe/London (GMT / BST - UK)",
    "Europe/Frankfurt (CET / CEST - Germany)",
    "Europe/Zurich (CET / CEST - Switzerland)",
    "Asia/Tokyo (JST - Japan)",
    "Asia/Singapore (SGT - Singapore)",
    "Asia/Kolkata (IST - India)",
    "Australia/Sydney (AEST / AEDT - Sydney)",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.fullName.trim() || !data.role.trim()) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Monospace Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <span className="font-mono text-xs font-bold text-[#71717A]">
          [ 01 / OPERATOR IDENTITY ]
        </span>
        <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-50 text-[#0284C7] border border-zinc-200">
          PROFILE PREREQUISITES
        </span>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[#09090B] mb-1.5 uppercase">
            Full Name <span className="text-[#0284C7]">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              required
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="Dr. Elena Vance"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-[#09090B] focus:bg-white focus:outline-none text-xs text-[#09090B] font-mono transition-all"
            />
          </div>
        </div>

        {/* Work Title / Role */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[#09090B] mb-1.5 uppercase">
            Enterprise Title / Role <span className="text-[#0284C7]">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              required
              value={data.role}
              onChange={(e) => onChange({ role: e.target.value })}
              placeholder="VP of Enterprise Infrastructure / Lead Financial Architect"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-[#09090B] focus:bg-white focus:outline-none text-xs text-[#09090B] font-mono transition-all"
            />
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-xs font-mono font-semibold text-[#09090B] mb-1.5 uppercase">
            Operational Timezone
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={data.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-[#09090B] focus:bg-white focus:outline-none text-xs text-[#09090B] font-mono transition-all appearance-none cursor-pointer"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Operator Live Attestation Preview Card */}
      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono space-y-1.5">
        <div className="text-[#71717A] text-[10px] uppercase">OPERATOR ATTESTATION BADGE</div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#09090B]">
            {data.fullName || "UNREGISTERED_OPERATOR"}
          </span>
          <span className="text-[#059669] font-bold text-[10px]">
            {data.role ? `[ ${data.role} ]` : "[ PENDING ROLE ]"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="btn-pill-black px-7 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all group"
        >
          <span>Continue to Tenant Setup</span>
          <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </form>
  );
}
