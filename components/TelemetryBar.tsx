"use client";

import React, { useState, useEffect } from "react";
import { Database, TrendingDown, Shield, Cpu } from "lucide-react";

export default function TelemetryBar() {
  const [liveVolume, setLiveVolume] = useState(48291040000);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveVolume((v) => v + Math.floor(Math.random() * 85000));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Database,
      tag: "01 / EXPOSURE",
      title: "Zero Database Exposure",
      description: "Hardware RAM-only enclave execution with zero open SQL ports.",
      stat: "0 Open Ports",
    },
    {
      icon: TrendingDown,
      tag: "02 / UNIT COST",
      title: "Reconciliation Cost Delta",
      description: "Replaces recurring human spreadsheet overhead with deterministic microVM compute.",
      stat: "-94% OpEx",
    },
    {
      icon: Shield,
      tag: "03 / MERKLE DAG",
      title: "Cryptographic Audit Chain",
      description: "State transitions commit an append-only hash to an immutable Merkle tree.",
      stat: "SHA-256 Validated",
    },
    {
      icon: Cpu,
      tag: "04 / ISOLATION",
      title: "Hardware Memory Encryption",
      description: "Memory pages encrypted at runtime via AMD SEV-SNP with zero interactive SSH shells.",
      stat: "AES-256-XTS",
    },
  ];

  return (
    <section id="platform" className="py-24 border-t border-[#e5e7eb] bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Minimal Partner Strip */}
        <div className="mb-20">
          <p className="text-center text-xs font-mono font-medium tracking-widest text-[#6b7280] uppercase mb-8">
            ENTERPRISE INTEGRATIONS &amp; HARDWARE ATTESTATIONS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
            {[
              "SAP S/4HANA",
              "Salesforce",
              "Workday",
              "SWIFT",
              "FedWire",
              "AWS Nitro",
              "AMD SEV-SNP",
              "FIPS 140-3",
            ].map((name, i) => (
              <div
                key={i}
                className="py-3 px-2 rounded-xl bg-[#faf9f6] border border-[#e5e7eb] text-xs font-medium text-[#111827]"
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Spacious Settlement Volume Metric */}
        <div className="mb-16 p-8 sm:p-12 minimal-card bg-white flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#6b7280] mb-1">
              Cumulative Attested Volume
            </div>
            <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111827]">
              ${(liveVolume / 1000000000).toFixed(3)}B
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#6b7280]">
            <div className="px-4 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e5e7eb]">
              <span className="block text-[#6b7280]">Human Latency</span>
              <strong className="text-[#059669] text-sm">0.00ms</strong>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e5e7eb]">
              <span className="block text-[#6b7280]">Deterministic SLA</span>
              <strong className="text-[#2563eb] text-sm">100.00%</strong>
            </div>
          </div>
        </div>

        {/* 4 Minimal Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="minimal-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e5e7eb]">
                    <span className="text-[11px] font-mono text-[#6b7280]">
                      {feat.tag}
                    </span>
                    <Icon className="w-4 h-4 text-[#2563eb]" />
                  </div>

                  <h3 className="text-base font-semibold text-[#111827] mb-2 tracking-tight">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-[#6b7280] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#e5e7eb] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#6b7280]">STATUS</span>
                  <span className="text-[#059669] font-medium">{feat.stat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
