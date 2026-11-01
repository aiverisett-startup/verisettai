"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  MessageSquarePlus,
  Search,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  X,
  CheckCircle2,
  Building2,
  Send,
  Loader2,
  Filter,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { MinimalFooter } from "@/components/landing/MinimalFooter";
import { supabase } from "@/lib/supabaseClient";
import type { FeedbackItem } from "@/app/api/feedback/route";

const CATEGORIES = [
  "All",
  "M2M Escrow",
  "Security & Auth",
  "Settlement Speed",
  "Protocol Feedback",
] as const;

type CategoryType = typeof CATEGORIES[number];

export default function FeedbackPage() {
  const [reviews, setReviews] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role_title: "",
    company: "",
    rating: 5,
    category: "M2M Escrow",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch initial reviews
  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      setIsLoading(true);
      try {
        // 1. Try direct Supabase select with anon client
        const { data, error } = await supabase
          .from("feedback")
          .select("*")
          .eq("is_approved", true)
          .order("created_at", { ascending: false });

        if (error) {
          // Log exact error code and message once to avoid spamming console
          console.warn(
            `[Supabase Feedback Query Note] Error code: ${error.code}, Message: ${error.message}`
          );
        }

        if (!error && data && data.length > 0) {
          if (isMounted) setReviews(data as FeedbackItem[]);
          return;
        }

        // 2. Controlled fallback to server API endpoint (bypasses RLS blocks via service role)
        const res = await fetch("/api/feedback");
        if (!res.ok) {
          console.warn(`[Feedback API Route Note] HTTP status: ${res.status} (${res.statusText})`);
          return;
        }
        const json = await res.json();
        if (json?.feedback && isMounted) {
          setReviews(json.feedback);
        }
      } catch (err: any) {
        console.warn("[Feedback Loading Exception]", err?.message || err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.role_title && item.role_title.toLowerCase().includes(q)) ||
        (item.company && item.company.toLowerCase().includes(q)) ||
        item.message.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [reviews, selectedCategory, searchQuery]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!formData.message.trim()) {
      setFormError("Please enter your review message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        role_title: formData.role_title.trim() || null,
        company: formData.company.trim() || null,
        rating: formData.rating,
        category: formData.category,
        message: formData.message.trim(),
      };

      // Call server route to guarantee resilience
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Failed to submit review");
      }

      const createdItem: FeedbackItem = resData.data || {
        id: "fb-" + Date.now(),
        ...payload,
        is_approved: true,
        created_at: new Date().toISOString(),
        is_just_posted: true,
      };

      // Optimistic update: prepend to top of list
      setReviews((prev) => [createdItem, ...prev]);

      // Reset form & close modal
      setFormData({
        name: "",
        role_title: "",
        company: "",
        rating: 5,
        category: "M2M Escrow",
        message: "",
      });
      setIsModalOpen(false);

      // Trigger success toast
      setToastMessage("Thank you! Your feedback has been verified and posted.");
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "5.0";
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 min-h-screen relative overflow-hidden font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glow Mesh & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-32 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#09090B]/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="mx-auto flex max-w-7xl items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <VerisettLogo size={28} />
            </Link>
            <span className="hidden sm:inline-block text-slate-700">/</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>COMMUNITY TRUST WALL</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] px-3.5 py-2 rounded-lg transition-all inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
              <span>Back to Platform</span>
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30 px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>Leave a Review</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 w-full">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/60 p-4 text-sm text-emerald-200 flex items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-blue-400 bg-blue-950/40 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VERIFIED TESTIMONIALS &amp; REVIEWS</span>
          </div>

          <h1 className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-extrabold tracking-tight text-3xl sm:text-5xl">
            Community Feedback &amp; Protocol Trust Wall
          </h1>

          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            See what developers, research labs, and teams building autonomous agent workflows are saying about Verisett AI’s deterministic settlement engine.
          </p>

          {/* Key Metrics Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-xs">
              <span className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </span>
              <span className="text-amber-400 font-bold">{averageRating}</span>
              <span className="text-slate-400">/ 5.0 Average</span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 font-bold">{reviews.length}+</span>
              <span className="text-slate-400">Verified Reviews</span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">100%</span>
              <span className="text-slate-400">Deterministic Settlement</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 pb-2 border-b border-white/[0.08]">
          {/* Category Filter Pills (Segmented Controls) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:inline" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 font-mono text-xs px-3.5 py-1.5 rounded-lg shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                    : "bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:border-white/[0.12] font-mono text-xs px-3.5 py-1.5 rounded-lg"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by builder, company, text..."
              className="bg-white/[0.02] border border-white/[0.08] focus:border-blue-500/50 rounded-lg pl-9 pr-8 py-1.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 w-72 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Reviews Grid */}
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs font-mono text-slate-500">Loading verified protocol reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-12 max-w-lg mx-auto text-center shadow-2xl relative overflow-hidden space-y-4">
            {/* Ambient neon blue spotlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Icon */}
            <div className="relative inline-block mb-1">
              <span className="bg-cyan-950/60 border border-cyan-500/30 p-3 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] inline-flex items-center justify-center">
                <MessageSquarePlus className="w-7 h-7" />
              </span>
            </div>

            <h3 className="text-base font-semibold text-white tracking-wide">
              {reviews.length === 0 ? "No community reviews yet" : "No reviews found"}
            </h3>

            <p className="text-xs text-slate-400 font-mono mt-1 max-w-xs mx-auto leading-relaxed">
              {reviews.length === 0
                ? "Be the first verified builder to share feedback and testimonials on Verisett AI!"
                : "No testimonials match your current search or category filter."}
            </p>

            {reviews.length === 0 ? (
              <div className="pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Submit the First Review</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="text-xs font-mono font-semibold text-blue-400 hover:underline pt-2 inline-block cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((item) => (
              <div
                key={item.id}
                className={`group relative rounded-2xl border bg-white/[0.02] hover:bg-white/[0.04] p-6 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/15 ${
                  item.is_just_posted
                    ? "border-emerald-500/50 ring-2 ring-emerald-500/20 bg-emerald-950/20"
                    : "border-white/[0.08]"
                }`}
              >
                {/* Just Posted Badge */}
                {item.is_just_posted && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] font-mono font-bold text-black uppercase tracking-wider shadow-md animate-pulse">
                    Just Posted
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Bar: Stars + Category + Timestamp Pill */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1" aria-label={`${item.rating} stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]"
                              : "text-slate-800"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 text-[10px] font-mono font-medium">
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-500">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Message Quote */}
                  <blockquote className="text-sm text-slate-200 leading-relaxed font-sans">
                    “{item.message}”
                  </blockquote>
                </div>

                {/* Author Metadata Footer */}
                <div className="pt-5 mt-6 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Initials Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md ring-1 ring-white/20">
                      {item.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-white truncate">
                          {item.name}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-medium shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Verified</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                        {item.role_title}
                        {item.role_title && item.company && " • "}
                        {item.company && (
                          <span className="text-slate-300 font-semibold">{item.company}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] via-blue-950/20 to-white/[0.01] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-2xl backdrop-blur-xl">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Building on Verisett AI? Share Your Experience
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Join dozens of autonomous agent protocols, AI startups, and systems architects who are shaping the deterministic machine clearinghouse standard.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30 font-semibold text-xs text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.35)] shrink-0 cursor-pointer"
          >
            Submit Protocol Review
          </button>
        </div>
      </main>

      {/* Review Submission Modal with Deep Obsidian Theme */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0D0D12]/95 p-6 sm:p-8 shadow-2xl shadow-black backdrop-blur-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <MessageSquarePlus className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Submit Protocol Feedback</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Your review will be verified and published to the Trust Wall.</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
                {formError}
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    Full Name <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-xs transition-all outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role_title}
                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                    placeholder="e.g. Lead Agent Architect"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-xs transition-all outline-hidden"
                  />
                </div>
              </div>

              {/* Company & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. NovaScale AI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-xs transition-all outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    Category Tag
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-xs transition-all outline-hidden cursor-pointer"
                  >
                    <option value="M2M Escrow">M2M Escrow</option>
                    <option value="Security & Auth">Security &amp; Auth</option>
                    <option value="Settlement Speed">Settlement Speed</option>
                    <option value="Protocol Feedback">Protocol Feedback</option>
                  </select>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Rating: <span className="font-bold text-amber-400">{formData.rating} / 5 Stars</span>
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= formData.rating
                            ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                            : "text-slate-700 hover:text-slate-500"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Review &amp; Testimonial <span className="text-blue-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share your experience with Verisett AI's deterministic settlement, FastMCP tools, or autonomous vaults..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-xs transition-all outline-hidden resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium text-slate-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30 text-xs font-semibold text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.35)] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Unified Footer */}
      <MinimalFooter />
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 5) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Recently";
  }
}
