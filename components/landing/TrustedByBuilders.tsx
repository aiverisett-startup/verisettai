"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ShieldCheck, ArrowRight, MessageSquarePlus, Sparkles } from "lucide-react";
import type { FeedbackItem } from "@/app/api/feedback/route";

export function TrustedByBuilders() {
  const [previewReviews, setPreviewReviews] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/feedback?limit=3")
      .then((res) => {
        if (!res.ok) {
          console.warn(`[TrustedByBuilders Fetch Note] HTTP status: ${res.status}`);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.feedback && isMounted) {
          setPreviewReviews(data.feedback.slice(0, 3));
        }
      })
      .catch((err) => {
        console.warn("[TrustedByBuilders Exception]", err?.message || err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative bg-slate-50/50 py-20 border-t border-slate-200/60 overflow-hidden">
      {/* Background Subtle Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full -z-10"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-50 text-blue-600 border border-blue-200/60 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>COMMUNITY TRUST WALL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-sans">
              Trusted by Builders &amp; Agent Protocols
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mt-3 leading-relaxed font-sans">
              See how teams building autonomous multi-agent pipelines rely on Verisett AI for deterministic M2M escrow and cryptographic assertion settlement.
            </p>
          </div>

          <Link
            href="/feedback"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm shadow-blue-600/25 transition-all shrink-0 group"
          >
            <span>View All Feedback &amp; Leave a Review</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Reviews Content: Loading Skeletons vs Empty Invite vs Live Reviews */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between animate-pulse space-y-4"
              >
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-slate-100 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-4/5 bg-slate-100 rounded" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-28 bg-slate-200 rounded" />
                    <div className="h-2.5 w-36 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : previewReviews.length === 0 ? (
          <div className="bg-white border border-blue-100 rounded-2xl p-10 shadow-sm shadow-blue-500/5 max-w-2xl mx-auto text-center mt-12">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 font-sans">
              Be the First Builder to Leave a Review
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mt-2 leading-relaxed font-sans">
              Share your team&apos;s experience integrating Verisett AI&apos;s autonomous M2M clearinghouse, deterministic vaults, and cryptographic assertion protocol.
            </p>
            <div className="pt-6">
              <Link
                href="/feedback"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm shadow-blue-600/25 transition-all"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Submit Feedback &amp; Testimonial</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {previewReviews.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Rating & Category */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1" aria-label={`${item.rating} stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[10px] font-mono font-medium text-blue-600">
                      {item.category}
                    </span>
                  </div>

                  {/* Review Message */}
                  <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    “{item.message}”
                  </blockquote>
                </div>

                {/* Author Row */}
                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                    {item.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {item.name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-mono font-medium shrink-0">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                      {item.role_title}
                      {item.role_title && item.company && " • "}
                      {item.company && (
                        <span className="font-semibold text-slate-700">{item.company}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

}

export default TrustedByBuilders;

