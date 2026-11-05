"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASINGS, fadeUp, staggerContainer, defaultViewport } from "@/lib/motion";

interface MotionSectionProps {
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  id?: string;
}

export function MotionSection({
  children,
  stagger = 0.08,
  delay = 0.05,
  className = "",
  id,
}: MotionSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      className={className}
    >
      {children}
    </motion.section>
  );
}

interface MotionItemProps {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  className?: string;
}

export function MotionItem({
  children,
  distance = 20,
  duration = 0.5,
  className = "",
}: MotionItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeUp(distance, duration)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = "",
  glow = true,
  onClick,
}: GlassCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      whileHover={shouldReduceMotion ? undefined : {
        y: -4,
        transition: { duration: 0.22, ease: EASINGS.luxury },
      }}
      className={`relative rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.06),0_1px_3px_rgba(0,0,0,0.03)] transition-colors hover:border-blue-400/60 hover:shadow-[0_16px_36px_-6px_rgba(37,99,235,0.12),0_4px_12px_rgba(0,0,0,0.02)] ${className}`}
    >
      {/* Subtle Specular Ambient Blue Light Bloom on hover */}
      {glow && (
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent -z-10" />
      )}
      {children}
    </motion.div>
  );
}

interface InteractiveButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function InteractiveButton({
  children,
  className = "",
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
}: InteractiveButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    primary:
      "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] border border-[#2563EB]",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-blue-400 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:text-blue-600",
    ghost:
      "bg-transparent hover:bg-blue-50/60 text-slate-700 hover:text-blue-600",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={shouldReduceMotion || disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.98, y: 0 }}
      transition={{ duration: 0.15, ease: EASINGS.luxury }}
      className={`inline-flex items-center justify-center font-medium rounded-full px-5 py-2.5 transition-colors disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
