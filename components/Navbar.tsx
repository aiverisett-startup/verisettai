"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import VellixyLogo from "./VellixyLogo";
import { useAuthUser } from "@/lib/useAuthUser";

interface NavbarProps {
  onRequestAccess: () => void;
}

export default function Navbar({ onRequestAccess }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuthUser();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 pt-5 transition-all duration-300">
      <nav
        className={`w-full max-w-5xl rounded-full transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md py-3 px-7 border border-[#e5e7eb] shadow-sm"
            : "bg-white/70 backdrop-blur-sm py-3.5 px-8 border border-[#e5e7eb]/60"
        } flex items-center justify-between gap-6`}
      >
        {/* Brand Lockup */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="p-1 rounded-xl bg-[#f4f4f6] border border-[#e5e7eb] flex items-center justify-center transition-colors group-hover:border-zinc-300">
            <VellixyLogo className="w-5 h-5" size={20} />
          </div>
          <span className="text-base font-semibold tracking-tight text-[#111827]">
            Vellixy
          </span>
        </a>

        {/* Minimal Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6b7280]">
          <a href="#platform" className="hover:text-[#111827] transition-colors">
            Platform
          </a>
          <a href="#pipeline" className="hover:text-[#111827] transition-colors">
            Architecture
          </a>
          <a href="#security" className="hover:text-[#111827] transition-colors">
            Security
          </a>
          <a href="#economics" className="hover:text-[#111827] transition-colors">
            Economics
          </a>
        </div>

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="text-xs font-medium text-[#111827] px-3.5 py-1.5 rounded-full border border-[#e5e7eb] bg-white hover:bg-[#f4f4f6] transition-colors"
            >
              Console ({user.name?.split(" ")[0] || "Operator"})
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-medium text-[#6b7280] hover:text-[#111827] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={onRequestAccess}
            className="btn-primary px-5 py-2.5 text-xs tracking-wide flex items-center gap-2 group cursor-pointer"
          >
            <span>Request Access</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full text-[#6b7280] hover:text-[#111827] bg-[#f4f4f6] border border-[#e5e7eb] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-4 right-4 bg-white border border-[#e5e7eb] rounded-3xl p-6 shadow-xl flex flex-col gap-3 z-50">
          <a
            href="#platform"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-[#111827] py-2 border-b border-zinc-100"
          >
            Platform
          </a>
          <a
            href="#pipeline"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-[#111827] py-2 border-b border-zinc-100"
          >
            Architecture
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-[#111827] py-2 border-b border-zinc-100"
          >
            Security
          </a>
          <a
            href="#economics"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-[#111827] py-2 border-b border-zinc-100"
          >
            Economics
          </a>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-[#6b7280] py-2 border-b border-zinc-100"
          >
            Sign In
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onRequestAccess();
            }}
            className="btn-primary w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            <span>Request Access</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      )}
    </header>
  );
}
