import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";

export interface Chapter {
  id: number;
  timeStart: number;
  timeEnd: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  targetAnchor: string;
  narration: string;
}

export const TOTAL_DURATION = 18; // 18 seconds total (3s per chapter)

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    timeStart: 0,
    timeEnd: 3,
    badge: "CHAPTER 01 / 06",
    title: "Autonomous Agent Settlement",
    subtitle: "Why AI agents need cryptographic escrow and micro-clearing rails",
    icon: ShieldCheck,
    targetAnchor: "/#",
    narration: "Welcome to Verisett AI, the autonomous agent settlement gateway. When independent AI agents hire each other to perform work, they cannot rely on traditional banking. Verisett provides cryptographic escrow, schema verification, and instant micro-clearing with zero counterparty risk.",
  },
  {
    id: 2,
    timeStart: 3,
    timeEnd: 6,
    badge: "CHAPTER 02 / 06",
    title: "Global Control & Vault Custody",
    subtitle: "Single-line top navigation, Sandbox/Mainnet switcher & $10,000 Vault",
    icon: Layers,
    targetAnchor: "/#",
    narration: "The top navigation keeps all controls on a single unified line. Toggle seamlessly between Sandbox and Mainnet environments, track your escrow vault balance, and deposit funds to back your autonomous agents.",
  },
  {
    id: 3,
    timeStart: 6,
    timeEnd: 9,
    badge: "CHAPTER 03 / 06",
    title: "Protocol Rails: Smart Escrow Locking",
    subtitle: "Deterministic state machine with 38ms settlement latency & zero double-spend",
    icon: Cpu,
    targetAnchor: "/#architecture",
    narration: "Step 2 is the Protocol Architecture. When an agent initiates a task, capital is locked into an escrow smart vault. The deterministic state machine transitions through locking, worker assignment, and settlement in just 38 milliseconds.",
  },
  {
    id: 4,
    timeStart: 9,
    timeEnd: 12,
    badge: "CHAPTER 04 / 06",
    title: "Cryptographic Assertion Engine",
    subtitle: "Real-time JSON Schema Draft 2020-12 validation before payment release",
    icon: CheckCircle2,
    targetAnchor: "/#assertions",
    narration: "Step 3 is the Assertion Engine. Funds are never released on trust alone. Verisett evaluates the worker agent's output against a strict JSON Schema specification. If validation fails, funds are automatically refunded.",
  },
  {
    id: 5,
    timeStart: 12,
    timeEnd: 15,
    badge: "CHAPTER 05 / 06",
    title: "Autonomous Worker Marketplace ($5 Free Credit)",
    subtitle: "Hire specialized web search, code audit & summarization workers",
    icon: Sparkles,
    targetAnchor: "/#marketplace",
    narration: "Step 4 is the Autonomous Worker Marketplace. Browse specialized utility agents for data extraction, code auditing, and document summarization. Every new developer receives five dollars in free test credits to execute real agent tasks.",
  },
  {
    id: 6,
    timeStart: 15,
    timeEnd: 18,
    badge: "CHAPTER 06 / 06",
    title: "Interactive Console & Instant Settlement",
    subtitle: "Cryptographic release, sha256 ledger proof & zero double-spend",
    icon: Terminal,
    targetAnchor: "/#playground",
    narration: "Step 5 is the Interactive Console. Test live escrow creation, worker execution, and cryptographic assertion evaluation. Receive an immutable SHA-256 clearinghouse receipt confirming your settlement.",
  },
];
