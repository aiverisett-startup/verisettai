/**
 * Verisett AI — Premium Futuristic Motion Design System
 * Built on Framer Motion with hardware-accelerated transitions,
 * spring physics, and accessibility-first reduced motion support.
 */

import { Variants, Transition } from "framer-motion";

// Custom luxury bezier easing curves (Apple / Vercel / Linear inspired)
export const EASINGS = {
  luxury: [0.16, 1, 0.3, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
  snappy: [0.2, 0.8, 0.2, 1] as const,
  bouncy: [0.34, 1.56, 0.64, 1] as const,
};

// Physics-based spring presets
export const SPRINGS: Record<string, Transition> = {
  gentle: { type: "spring", stiffness: 180, damping: 24, mass: 0.8 },
  smooth: { type: "spring", stiffness: 240, damping: 28, mass: 1 },
  snappy: { type: "spring", stiffness: 380, damping: 30, mass: 0.6 },
  bouncy: { type: "spring", stiffness: 400, damping: 18, mass: 0.5 },
  subtle: { type: "spring", stiffness: 120, damping: 20 },
};

// Standard viewport threshold configuration for scroll-triggered reveals
export const defaultViewport = {
  once: true,
  margin: "-60px",
  amount: 0.15,
};

// Staggered Container Variant
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
      ease: EASINGS.luxury,
    },
  },
});

// Vertical Reveal Variants
export const fadeUp = (distance = 24, duration = 0.55): Variants => ({
  hidden: {
    opacity: 0,
    y: distance,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      ease: EASINGS.luxury,
    },
  },
});

// Pure Fade Variant
export const fadeIn = (duration = 0.45): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration,
      ease: EASINGS.luxury,
    },
  },
});

// Scale-in Variant for Badges, Modals and Nodes
export const scaleIn = (initialScale = 0.94, duration = 0.4): Variants => ({
  hidden: { opacity: 0, scale: initialScale },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration,
      ease: EASINGS.luxury,
    },
  },
});

// Slide-in horizontal variants
export const slideIn = (direction: "left" | "right" = "left", distance = 30): Variants => ({
  hidden: {
    opacity: 0,
    x: direction === "left" ? -distance : distance,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.55,
      ease: EASINGS.luxury,
    },
  },
});

// Interactive Micro-Interaction Variants for Buttons
export const buttonMicroInteraction = {
  initial: { scale: 1 },
  hover: {
    scale: 1.025,
    y: -1,
    transition: { duration: 0.18, ease: EASINGS.luxury },
  },
  tap: {
    scale: 0.975,
    y: 0,
    transition: { duration: 0.1, ease: EASINGS.luxury },
  },
};

// Interactive Micro-Interaction Variants for Cards
export const cardMicroInteraction = {
  initial: { y: 0, boxShadow: "0 1px 3px rgba(37,99,235,0.04), 0 4px 16px rgba(0,0,0,0.02)" },
  hover: {
    y: -4,
    boxShadow: "0 16px 36px -8px rgba(37,99,235,0.14), 0 4px 12px rgba(0,0,0,0.03)",
    transition: { duration: 0.25, ease: EASINGS.luxury },
  },
};

// Pulsing Aura Ring for Active Telemetry Nodes
export const pulseRing: Variants = {
  initial: { scale: 1, opacity: 0.7 },
  animate: {
    scale: [1, 1.4, 1.6],
    opacity: [0.7, 0.25, 0],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeOut",
    },
  },
};
