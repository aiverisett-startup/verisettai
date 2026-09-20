"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { VerisettLogo } from "../VerisettLogo";

function InstagramGradientIcon({ className = "w-4 h-4" }: { className?: string }) {
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

function TwitterXIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function MinimalFooter() {
  return (
    <footer className="border-t border-[#EAE3D2] bg-[#FAF8F5] py-14 text-sm text-[#8C8275] font-montserrat relative overflow-hidden">
      {/* Background Half-Shapes flanking Footer */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        {/* Left Edge: Smooth Half-Circle Arc */}
        <div className="absolute bottom-4 -left-8 sm:-left-12 w-36 sm:w-48 h-36 opacity-30">
          <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M 90,10 A 80,80 0 0,1 90,170 Z"
              fill="#FAF6EE"
              stroke="#C59B5F"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />
          </svg>
        </div>

        {/* Right Edge: Smooth Half-Circle Arc */}
        <div className="absolute bottom-4 -right-8 sm:-right-12 w-36 sm:w-48 h-36 opacity-30">
          <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M 90,10 A 80,80 0 0,0 90,170 Z"
              fill="#FAF6EE"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#EAE3D2]">
          
          <div className="flex items-center gap-3">
            <VerisettLogo size={24} />
            <span className="text-xs font-montserrat font-semibold text-[#9E7A45]">
              / Institutional Software &amp; Milestone Escrow
            </span>
          </div>

          {/* Social Follow & Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* YouTube Follow Button */}
            <a
              href="https://www.youtube.com/@VerisettAI"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF6EE] border border-[#EAE3D2] hover:border-[#FF0000]/60 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-xs font-montserrat font-medium text-[#1C1A17]"
            >
              <YouTubeIcon className="w-4 h-4 shrink-0 text-[#FF0000] transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[#6E675D] group-hover:text-[#1C1A17] transition-colors">
                YouTube:
              </span>
              <span className="font-bold text-[#FF0000] group-hover:text-[#CC0000] transition-colors">
                @Verisett AI
              </span>
              <ExternalLink className="w-3 h-3 text-[#8C8275] group-hover:text-[#FF0000] transition-transform group-hover:translate-x-0.5" />
            </a>

            {/* Instagram Follow Button */}
            <a
              href="https://www.instagram.com/ai.verisett/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF6EE] border border-[#EAE3D2] hover:border-[#C59B5F] shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-xs font-montserrat font-medium text-[#1C1A17]"
            >
              <InstagramGradientIcon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[#6E675D] group-hover:text-[#1C1A17] transition-colors">
                Instagram:
              </span>
              <span className="font-bold text-[#9E7A45] group-hover:text-[#C59B5F] transition-colors">
                @ai.verisett
              </span>
              <ExternalLink className="w-3 h-3 text-[#8C8275] group-hover:text-[#C59B5F] transition-transform group-hover:translate-x-0.5" />
            </a>

            {/* Twitter / X Follow Button */}
            <a
              href="https://x.com/ai_verisett"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF6EE] border border-[#EAE3D2] hover:border-[#C59B5F] shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-xs font-montserrat font-medium text-[#1C1A17]"
            >
              <TwitterXIcon className="w-3.5 h-3.5 shrink-0 text-[#1C1A17] group-hover:text-[#C59B5F] transition-colors" />
              <span className="text-[#6E675D] group-hover:text-[#1C1A17] transition-colors">
                X (Twitter):
              </span>
              <span className="font-bold text-[#9E7A45] group-hover:text-[#C59B5F] transition-colors">
                @ai_verisett
              </span>
              <ExternalLink className="w-3 h-3 text-[#8C8275] group-hover:text-[#C59B5F] transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-montserrat text-[#8C8275]">
          <div>
            © {new Date().getFullYear()} Verisett AI Inc. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <a href="#milestones" className="hover:text-[#C59B5F] transition-colors">
              Milestones
            </a>
            <a href="#how-it-works" className="hover:text-[#C59B5F] transition-colors">
              How It Works
            </a>
            <a href="#sandbox" className="hover:text-[#C59B5F] transition-colors">
              Sandbox
            </a>
            <a href="#trust" className="hover:text-[#C59B5F] transition-colors">
              Security
            </a>
            <a href="#developers" className="hover:text-[#C59B5F] transition-colors">
              API Docs
            </a>
            <Link href="/privacy" className="hover:text-[#C59B5F] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#C59B5F] transition-colors">
              Terms
            </Link>
            <a
              href="https://www.youtube.com/@VerisettAI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#FF0000] hover:text-[#CC0000] font-bold transition-colors"
            >
              <YouTubeIcon className="w-3.5 h-3.5" />
              <span>@Verisett AI</span>
            </a>
            <a
              href="https://www.instagram.com/ai.verisett/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#9E7A45] hover:text-[#C59B5F] font-bold transition-colors"
            >
              <InstagramGradientIcon className="w-3.5 h-3.5" />
              <span>@ai.verisett</span>
            </a>
            <a
              href="https://x.com/ai_verisett"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#1C1A17] hover:text-[#C59B5F] font-bold transition-colors"
            >
              <TwitterXIcon className="w-3 h-3" />
              <span>@ai_verisett</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
