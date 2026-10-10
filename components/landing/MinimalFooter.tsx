"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { VerisettLogo } from "../VerisettLogo";

function InstagramGradientIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-grad" cx="20%" cy="100%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#ig-grad)" strokeWidth="2" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad)" />
    </svg>
  );
}

function TwitterXIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function GithubIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function MinimalFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-[#FAF8F5] py-14 text-sm font-sans relative overflow-hidden">
      {/* Background Subtle Semicircles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        <div className="absolute bottom-4 -left-8 sm:-left-12 w-36 sm:w-48 h-36 opacity-25">
          <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M 90,10 A 80,80 0 0,1 90,170 Z"
              fill="#FAF6EE"
              stroke="#3B82F6"
              strokeWidth="1.2"
              strokeOpacity="0.2"
            />
          </svg>
        </div>
        <div className="absolute bottom-4 -right-8 sm:-right-12 w-36 sm:w-48 h-36 opacity-25">
          <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M 90,10 A 80,80 0 0,0 90,170 Z"
              fill="#FAF6EE"
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeOpacity="0.2"
            />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Brand & Social Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-200">
          
          {/* Left: Verisett AI Logo & Protocol Tag aligned vertically */}
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2.5">
              <VerisettLogo size={24} />
              <span className="font-bold text-base tracking-tight text-zinc-950 font-sans">
                Verisett AI
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Autonomous M2M Clearinghouse Protocol
            </span>
          </div>

          {/* Right: Unified 4 Social Links in an evenly spaced single flex row */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* GitHub */}
            <a
              href="https://github.com/aiverisett-startup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-xs font-medium text-zinc-700 hover:text-zinc-950 transition-all shadow-2xs group"
            >
              <GithubIcon className="w-3.5 h-3.5 text-zinc-800 transition-transform group-hover:scale-110" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-400 group-hover:text-zinc-600 transition-transform group-hover:translate-x-0.5" />
            </a>

            {/* X */}
            <a
              href="https://x.com/ai_verisett"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-xs font-medium text-zinc-700 hover:text-zinc-950 transition-all shadow-2xs group"
            >
              <TwitterXIcon className="w-3.5 h-3.5 text-zinc-800 transition-transform group-hover:scale-110" />
              <span>X</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-400 group-hover:text-zinc-600 transition-transform group-hover:translate-x-0.5" />
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@VerisettAI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-xs font-medium text-zinc-700 hover:text-zinc-950 transition-all shadow-2xs group"
            >
              <YouTubeIcon className="w-3.5 h-3.5 text-[#FF0000] transition-transform group-hover:scale-110" />
              <span>YouTube</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-400 group-hover:text-zinc-600 transition-transform group-hover:translate-x-0.5" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/ai.verisett/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-xs font-medium text-zinc-700 hover:text-zinc-950 transition-all shadow-2xs group"
            >
              <InstagramGradientIcon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              <span>Instagram</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-400 group-hover:text-zinc-600 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

        </div>

        {/* 2. Founder & Architecture Bar */}
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          
          {/* Left: Green status pulse + credit text */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
              <span className="font-semibold text-zinc-950">
                Founded &amp; Architected by Manoj S.M.
              </span>{" "}
              <span className="text-zinc-500">
                — Deterministic financial settlement for autonomous agent economies.
              </span>
            </p>
          </div>

          {/* Right: Quick action buttons group */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800 hover:text-zinc-950 transition-colors shadow-2xs"
            >
              <span>About Lead</span>
            </Link>
            <a
              href="https://github.com/aiverisett-startup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800 hover:text-zinc-950 transition-colors shadow-2xs"
            >
              <GithubIcon className="w-3.5 h-3.5 text-zinc-800" />
              <span>GitHub</span>
            </a>
            <a
              href="https://x.com/ai_verisett"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800 hover:text-zinc-950 transition-colors shadow-2xs"
            >
              <TwitterXIcon className="w-3 h-3 text-zinc-800" />
              <span>X</span>
            </a>
          </div>

        </div>

        {/* 3. Bottom Navigation & Copyright */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Bottom Left: Copyright */}
          <div className="text-zinc-500 font-sans">
            © 2026 Verisett AI. All rights reserved.
          </div>

          {/* Bottom Right: Evenly spaced single-line horizontal bar with subtle dividers */}
          <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 sm:gap-x-4 gap-y-2 text-zinc-600 font-sans font-medium">
            <Link href="/about" className="hover:text-zinc-950 transition-colors">
              About
            </Link>
            <span className="text-zinc-300 select-none">•</span>
            <Link href="/security" className="hover:text-zinc-950 transition-colors">
              Security
            </Link>
            <span className="text-zinc-300 select-none">•</span>
            <Link href="/docs" className="hover:text-zinc-950 transition-colors">
              Docs
            </Link>
            <span className="text-zinc-300 select-none">•</span>
            <Link href="/pricing" className="hover:text-zinc-950 transition-colors">
              Pricing
            </Link>
            <span className="text-zinc-300 select-none">•</span>
            <Link href="/terms" className="hover:text-zinc-950 transition-colors">
              Terms
            </Link>
            <span className="text-zinc-300 select-none">•</span>
            <Link href="/privacy" className="hover:text-zinc-950 transition-colors">
              Privacy
            </Link>
            <span className="text-zinc-300 select-none">•</span>
            <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
              How It Works
            </a>
            <span className="text-zinc-300 select-none">•</span>
            <a href="#sandbox" className="hover:text-zinc-950 transition-colors">
              Sandbox
            </a>
          </nav>

        </div>

      </div>
    </footer>
  );
}

export default MinimalFooter;
