"use client";

import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  Building2,
  Receipt,
  Users,
  CreditCard,
  CheckCircle2,
  Terminal,
} from "lucide-react";

export default function PipelineVisualizer() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(3);
  const [selectedNode, setSelectedNode] = useState<string>("salesforce");
  const [activeTab, setActiveTab] = useState<"topology" | "payload">("topology");

  const cards = [
    {
      id: "salesforce",
      tag: "01 / INGESTION",
      title: "Salesforce CRM",
      category: "Contract Attestation",
      icon: Building2,
      description: "Captures Closed-Won opportunities and seals contract parameters into JSON-LD.",
    },
    {
      id: "sap",
      tag: "02 / LEDGER",
      title: "SAP S/4HANA",
      category: "Revenue Allocation",
      icon: Receipt,
      description: "Executes ASC 606 revenue amortization and general ledger journal postings.",
    },
    {
      id: "workday",
      tag: "03 / HCM",
      title: "Workday Payroll",
      category: "Compensation Logic",
      icon: Users,
      description: "Evaluates sales commission tiers and commits receipts to employee records.",
    },
    {
      id: "banking",
      tag: "04 / SETTLEMENT",
      title: "SWIFT & FedWire",
      category: "Treasury Settlement",
      icon: CreditCard,
      description: "Generates cryptographic wire instructions verified by enclave attestation.",
    },
  ];

  const payloadSnippets: Record<string, Record<string, unknown>> = {
    salesforce: {
      event: "contract.closed_won",
      opportunity_id: "0064W00000abc9Z",
      contract_value: 1250000.0,
      currency: "USD",
      status: "SEALED_ENCLAVE",
    },
    sap: {
      transaction: "POST_GL_JOURNAL",
      document_type: "SA",
      debit: "120000_A/R",
      credit: "400000_DEF_REV",
      variance: 0.0,
    },
    workday: {
      action: "PROCESS_INCENTIVE",
      employee_id: "EMP-940182",
      effective_rate: 0.085,
      calculated_incentive: 106250.0,
    },
    banking: {
      message_format: "ISO20022_PACS_008",
      clearing_amount: 106250.0,
      hsm_signature: "ECDSA_P384:8f4c...91a2",
      status: "COMMITTED",
    },
  };

  const handleTriggerCycle = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStepIndex(0);

    const stepDuration = 700;
    setTimeout(() => setCurrentStepIndex(1), stepDuration);
    setTimeout(() => setCurrentStepIndex(2), stepDuration * 2);
    setTimeout(() => {
      setCurrentStepIndex(3);
      setIsRunning(false);
    }, stepDuration * 3);
  };

  return (
    <section id="pipeline" className="py-24 border-t border-[#e5e7eb] bg-[#faf9f6]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-mono text-[#2563eb] uppercase tracking-wider mb-2 font-medium">
              Autonomous Cross-SaaS Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111827]">
              Deterministic Execution Engine
            </h2>
            <p className="mt-2 text-base text-[#6b7280] max-w-xl">
              Cross-SaaS operations evaluate inside confidential enclaves and commit directly to settlement rails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerCycle}
              disabled={isRunning}
              className="btn-primary px-5 py-2.5 text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-white" />
                  <span>Trigger Cycle</span>
                </>
              )}
            </button>

            <button
              onClick={() => setCurrentStepIndex(3)}
              className="btn-secondary px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-[#6b7280]" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("topology")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                activeTab === "topology"
                  ? "bg-[#111827] text-white"
                  : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Topology View
            </button>
            <button
              onClick={() => setActiveTab("payload")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                activeTab === "payload"
                  ? "bg-[#111827] text-white"
                  : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Payload Inspector
            </button>
          </div>

          <span className="text-xs font-mono text-[#6b7280]">
            STATUS: <strong className="text-[#059669]">ONLINE</strong>
          </span>
        </div>

        {/* View 1: 4 Cards */}
        {activeTab === "topology" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              const isStepActive = idx <= currentStepIndex;

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedNode(card.id)}
                  className={`minimal-card p-6 flex flex-col justify-between cursor-pointer ${
                    selectedNode === card.id
                      ? "ring-2 ring-[#111827] border-transparent"
                      : "border-[#e5e7eb]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e5e7eb]">
                      <span className="text-[11px] font-mono text-[#6b7280]">
                        {card.tag}
                      </span>
                      <Icon className="w-4 h-4 text-[#2563eb]" />
                    </div>

                    <h3 className="text-base font-semibold text-[#111827] tracking-tight mb-2">
                      {card.title}
                    </h3>

                    <p className="text-xs text-[#6b7280] leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#e5e7eb] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#6b7280]">{card.category}</span>
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        isStepActive ? "text-[#059669]" : "text-zinc-400"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isStepActive ? "VERIFIED" : "STANDBY"}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View 2: Payload Inspector */
          <div className="minimal-card p-6 bg-white border border-[#e5e7eb]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e5e7eb] text-xs font-mono text-[#6b7280]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#2563eb]" />
                <span>
                  PAYLOAD BUFFER: <strong className="text-[#111827] uppercase">{selectedNode}</strong>
                </span>
              </div>
              <span className="text-[#059669]">HARDWARE VERIFIED</span>
            </div>
            <pre className="p-4 rounded-xl bg-[#faf9f6] border border-[#e5e7eb] font-mono text-xs text-[#111827] overflow-x-auto leading-relaxed">
              {JSON.stringify(payloadSnippets[selectedNode] || {}, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
