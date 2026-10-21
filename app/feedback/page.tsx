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
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-blue-600/15 blur-[120px] rounded-full -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[600px] right-0 w-[500px] h-[400px] bg-indigo-600/10 blur-[130px] rounded-full -z-10"
      />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#09090B]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <VerisettLogo size={28} />
            </Link>
            <span className="hidden sm:inline-block text-zinc-700">/</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-mono text-zinc-400 border border-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>COMMUNITY TRUST WALL</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-blue-400" />
              <span>Back to Platform</span>
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VERIFIED TESTIMONIALS &amp; REVIEWS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Community Feedback &amp; Protocol Trust Wall
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            See what developers, research labs, and teams building autonomous agent workflows are saying about Verisett AI’s deterministic settlement engine.
          </p>

          {/* Key Metrics Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-mono">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300">
              <span className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </span>
              <span className="font-bold text-white">{averageRating}</span>
              <span className="text-zinc-500">/ 5.0 Average</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-white">{reviews.length}+</span>
              <span className="text-zinc-500">Verified Reviews</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">100%</span>
              <span className="text-zinc-500">Deterministic Settlement</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 pb-2 border-b border-zinc-800">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0 hidden sm:inline" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by builder, company, text..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
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
            <p className="text-xs font-mono text-zinc-500">Loading verified protocol reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-800 p-8 space-y-3.5 max-w-md mx-auto">
            <MessageSquarePlus className="w-8 h-8 text-blue-500 mx-auto" />
            <h3 className="text-base font-bold text-zinc-200">
              {reviews.length === 0 ? "No community reviews yet" : "No reviews found"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {reviews.length === 0
                ? "Be the first verified builder to share feedback and testimonials on Verisett AI!"
                : "No testimonials match your current search or category filter."}
            </p>
            {reviews.length === 0 ? (
              <div className="pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-sm cursor-pointer"
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
                className="text-xs font-semibold text-blue-400 hover:underline pt-2 inline-block cursor-pointer"
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
                className={`group relative rounded-2xl border bg-zinc-900/60 p-6 backdrop-blur-md flex flex-col justify-between transition-all hover:border-zinc-700/80 hover:shadow-xl hover:shadow-blue-900/10 ${
                  item.is_just_posted
                    ? "border-blue-500/60 ring-2 ring-blue-500/20 bg-blue-950/20"
                    : "border-white/10"
                }`}
              >
                {/* Just Posted Badge */}
                {item.is_just_posted && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-mono font-bold text-white uppercase tracking-wider shadow-md animate-pulse">
                    Just Posted
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Bar: Stars + Category */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5" aria-label={`${item.rating} stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-zinc-700"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-[10px] font-mono font-medium text-zinc-300 border border-zinc-700/60">
                      {item.category}
                    </span>
                  </div>

                  {/* Message Quote */}
                  <blockquote className="text-sm text-zinc-300 leading-relaxed font-sans">
                    “{item.message}”
                  </blockquote>
                </div>

                {/* Author Metadata Footer */}
                <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Initials Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
                      {item.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white truncate">
                          {item.name}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-label="Verified Builder" />
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate font-mono">
                        {item.role_title}
                        {item.role_title && item.company && " • "}
                        {item.company && (
                          <span className="text-zinc-400 font-semibold">{item.company}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-600 shrink-0">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/40 via-zinc-900 to-indigo-950/40 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-2xl backdrop-blur-md">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Building on Verisett AI? Share Your Experience
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Join dozens of autonomous agent protocols, AI startups, and systems architects who are shaping the deterministic machine clearinghouse standard.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition-all shadow-xl shadow-blue-600/25 shrink-0 cursor-pointer"
          >
            Submit Protocol Review
          </button>
        </div>
      </main>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0F0F12] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <MessageSquarePlus className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Submit Protocol Feedback</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">Your review will be verified and published to the Trust Wall.</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                {formError}
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Full Name <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role_title}
                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                    placeholder="e.g. Lead Agent Architect"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Company & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. NovaScale AI"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Category Tag
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    <option value="M2M Escrow">M2M Escrow</option>
                    <option value="Security & Auth">Security &amp; Auth</option>
                    <option value="Settlement Speed">Settlement Speed</option>
                    <option value="Protocol Feedback">Protocol Feedback</option>
                  </select>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300 block">
                  Rating: <span className="font-bold text-amber-400">{formData.rating} / 5 Stars</span>
                </label>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-zinc-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300 block">
                  Review &amp; Testimonial <span className="text-blue-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share your experience with Verisett AI's deterministic settlement, FastMCP tools, or autonomous vaults..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
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
