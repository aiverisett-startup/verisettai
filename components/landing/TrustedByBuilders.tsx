"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ShieldCheck, ArrowRight, MessageSquarePlus, Sparkles } from "lucide-react";
import type { FeedbackItem } from "@/app/api/feedback/route";
import { SEED_FEEDBACK } from "@/app/api/feedback/route";

export function TrustedByBuilders() {
  const [previewReviews, setPreviewReviews] = useState<FeedbackItem[]>(SEED_FEEDBACK.slice(0, 3));

  useEffect(() => {
    let isMounted = true;
    fetch("/api/feedback?limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (data?.feedback && data.feedback.length > 0 && isMounted) {
          setPreviewReviews(data.feedback.slice(0, 3));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative py-16 sm:py-20 bg-white border-t border-zinc-200/80 overflow-hidden">
      {/* Background Subtle Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[90px] rounded-full -z-10"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-mono font-semibold text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>COMMUNITY TRUST WALL</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 font-sans">
              Trusted by Builders &amp; Agent Protocols
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-sans">
              See how teams building autonomous multi-agent pipelines rely on Verisett AI for deterministic M2M escrow and cryptographic assertion settlement.
            </p>
          </div>

          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950 hover:bg-blue-600 text-xs font-semibold text-white transition-all shadow-sm shrink-0 group"
          >
            <span>View All Feedback &amp; Leave a Review</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3-Card Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewReviews.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-[#FAF8F5]/80 p-6 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Rating & Category */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-0.5" aria-label={`${item.rating} stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < item.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-zinc-300"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-[10px] font-mono font-medium text-zinc-700">
                    {item.category}
                  </span>
                </div>

                {/* Review Message */}
                <blockquote className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
                  “{item.message}”
                </blockquote>
              </div>

              {/* Author Row */}
              <div className="pt-5 mt-5 border-t border-zinc-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs">
                  {item.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-zinc-950 truncate">
                      {item.name}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate font-mono">
                    {item.role_title}
                    {item.role_title && item.company && " • "}
                    {item.company && (
                      <span className="font-semibold text-zinc-700">{item.company}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default TrustedByBuilders;
