"use client";

import React from "react";
import { Building2, Globe, ArrowLeft, ArrowRight, CheckSquare, Square } from "lucide-react";

export interface OrganizationData {
  companyName: string;
  workspaceSlug: string;
  selectedStack: string[];
}

interface StepOrganizationProps {
  data: OrganizationData;
  onChange: (updated: Partial<OrganizationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepOrganization({
  data,
  onChange,
  onNext,
  onBack,
}: StepOrganizationProps) {
  const stackOptions = [
    { id: "sap", name: "SAP S/4HANA ERP", tag: "General Ledger & ASC 606" },
    { id: "salesforce", name: "Salesforce CRM", tag: "Closed-Won Contract Attestation" },
    { id: "workday", name: "Workday HCM", tag: "Compensation & Payroll Logic" },
    { id: "banking", name: "Banking & SWIFT Rails", tag: "FedWire & ISO 20022 Direct" },
    { id: "netsuite", name: "Oracle NetSuite", tag: "Automated Journal Entries" },
    { id: "custom", name: "Custom REST / GraphQL", tag: "Hardware Enclave Ingress" },
  ];

  const handleCompanyNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    onChange({ companyName: val, workspaceSlug: slug });
  };

  const toggleStackOption = (id: string) => {
    const exists = data.selectedStack.includes(id);
    const updated = exists
      ? data.selectedStack.filter((s) => s !== id)
      : [...data.selectedStack, id];
    onChange({ selectedStack: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.companyName.trim() || !data.workspaceSlug.trim()) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Monospace Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
        <span className="font-mono text-xs font-medium text-[#6b7280]">
          02 / TENANT CONFIGURATION
        </span>
        <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#faf9f6] text-[#059669] border border-[#e5e7eb]">
          ENTERPRISE CLUSTER
        </span>
      </div>

      <div className="space-y-4">
        {/* Legal Company Name */}
        <div>
          <label className="block text-xs font-mono font-medium text-[#111827] mb-1.5 uppercase">
            Legal Entity / Organization Name <span className="text-[#2563eb]">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              required
              value={data.companyName}
              onChange={(e) => handleCompanyNameChange(e.target.value)}
              placeholder="Acme Global Technologies Inc."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-[#faf9f6] border border-[#e5e7eb] focus:border-[#111827] focus:outline-none text-xs text-[#111827] font-mono transition-all"
            />
          </div>
        </div>

        {/* Workspace URL Slug */}
        <div>
          <label className="block text-xs font-mono font-medium text-[#111827] mb-1.5 uppercase">
            Dedicated Workspace Identifier
          </label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              required
              value={data.workspaceSlug}
              onChange={(e) => onChange({ workspaceSlug: e.target.value })}
              placeholder="acme-global"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-[#faf9f6] border border-[#e5e7eb] focus:border-[#111827] focus:outline-none text-xs text-[#111827] font-mono transition-all"
            />
          </div>
          <div className="mt-1.5 text-[11px] font-mono text-[#6b7280]">
            Enclave routing endpoint:{" "}
            <span className="text-[#2563eb] font-medium">
              https://app.vellixy.com/{data.workspaceSlug || "workspace-slug"}
            </span>
          </div>
        </div>

        {/* Core Stack Checkboxes */}
        <div className="pt-2">
          <label className="block text-xs font-mono font-medium text-[#111827] mb-2 uppercase">
            Connected Enterprise Systems (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stackOptions.map((opt) => {
              const isSelected = data.selectedStack.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleStackOption(opt.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-[#faf9f6] border-[#111827] ring-1 ring-[#111827]"
                      : "bg-[#faf9f6]/60 border-[#e5e7eb] hover:border-zinc-300"
                  }`}
                >
                  <div className="mt-0.5 text-[#2563eb]">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#2563eb]" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#111827]">
                      {opt.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#6b7280] mt-0.5">
                      {opt.tag}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="btn-primary px-7 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer group"
        >
          <span>Configure Runtime Enclave</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </form>
  );
}
