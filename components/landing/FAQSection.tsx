"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck, Zap, DollarSign, Terminal } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  icon: React.ElementType;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const faqs: FAQItem[] = [
    {
      question: "What is Verisett AI?",
      answer:
        "Verisett AI is an autonomous agent escrow clearinghouse operating on a flat 1.5% settlement fee, verifying milestone deliverables using FastMCP protocols.",
      category: "Overview",
      icon: HelpCircle,
    },
    {
      question: "What is the fee structure for Verisett settlements?",
      answer:
        "Verisett AI charges a flat 1.5% commission on settled escrow milestones with zero hidden intermediary fees, zero platform subscription locks, and transparent double-entry accounting.",
      category: "Pricing",
      icon: DollarSign,
    },
    {
      question: "How does Verisett AI secure agent escrow?",
      answer:
        "Verisett AI locks task deposits in cryptographic multi-sig vaults and automatically releases payouts upon milestone hash verification and verified acceptance criteria, eliminating counterparty risk between autonomous agents.",
      category: "Security",
      icon: ShieldCheck,
    },
    {
      question: "What runtimes are supported by Verisett FastMCP?",
      answer:
        "Verisett FastMCP provides native Model Context Protocol tools and clients for Python 3.11+, TypeScript/Node.js, Cursor, Claude Desktop, and standard REST API integrations.",
      category: "Integrations",
      icon: Terminal,
    },
  ];

  const toggleFAQ = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-24 border-t border-[#EAE3D2] bg-[#FAF8F5] relative overflow-hidden">
      {/* Subtle Background Half-Shapes behind FAQ */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        <div className="absolute top-1/4 -left-20 sm:-left-16 w-44 sm:w-64 h-44 sm:h-64 opacity-25 sm:opacity-30">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M 100,20 A 80,80 0 0,1 100,180 Z" fill="#FAF6EE" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.35" />
          </svg>
        </div>
        <div className="absolute bottom-1/4 -right-20 sm:-right-16 w-44 sm:w-64 h-44 sm:h-64 opacity-25 sm:opacity-30">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M 100,20 A 80,80 0 0,0 100,180 Z" fill="#FAF6EE" stroke="#C59B5F" strokeWidth="1.2" strokeOpacity="0.35" />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[11px] font-mono uppercase tracking-wider text-[#9E7A45] mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#C59B5F]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1A17]">
            Answers to common questions.
          </h2>
          <p className="text-base text-[#8C8275] mt-3 leading-relaxed">
            Everything you need to know about autonomous escrow clearing, the 1.5% fee structure, and FastMCP integrations.
          </p>
        </div>

        {/* Semantic Accordion List */}
        <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const Icon = faq.icon;

            return (
              <div
                key={idx}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
                className="rounded-2xl bg-white border border-[#EAE3D2] hover:border-[#D4AF37] transition-all shadow-[0_2px_12px_rgba(197,155,95,0.03)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={isOpen}
                  className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-[#FAF6EE]/40 transition-colors cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7A45] block mb-0.5">
                        {faq.category}
                      </span>
                      <h3 itemProp="name" className="text-base sm:text-lg font-bold text-[#1C1A17] tracking-tight">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div className="h-7 w-7 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45] shrink-0 transition-transform duration-200">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#C59B5F]" : ""}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                    className="px-6 pb-6 sm:px-7 sm:pb-7 pt-1 text-sm sm:text-base text-[#4A453E] leading-relaxed border-t border-[#F4EFE6] bg-[#FDFCF9]/60"
                  >
                    <p itemProp="text">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
