"use client";

export interface TransactionItem {
  id: string;
  fromAgent: {
    name: string;
    model: string;
    avatarBg: string;
    agentId: string;
  };
  toAgent: {
    name: string;
    model: string;
    avatarBg: string;
    agentId: string;
  };
  amountINR: number;
  commissionRate: number; // 0.015 (1.5%)
  status: "SUCCESSFUL" | "FAILED" | "PENDING";
  timestamp: string; // e.g. "20 Sep 2026, 01:14 PM"
  dateStr: string; // e.g. "2026-09-20"
  timeStr: string; // e.g. "01:14 PM"
  milestoneTitle: string;
  sha256Proof: string;
  clearingRail: string;
  direction?: "SENT" | "RECEIVED";
  failureReason?: string;
}

const STORAGE_KEY = "verisett_agent_transactions";
export const TX_UPDATE_EVENT = "verisett_transactions_update";

export function getStoredTransactions(): TransactionItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTransaction(tx: TransactionItem): TransactionItem[] {
  if (typeof window === "undefined") return [tx];
  try {
    const existing = getStoredTransactions();
    const updated = [tx, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(TX_UPDATE_EVENT));
    return updated;
  } catch {
    return [tx];
  }
}

export function clearStoredTransactions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(TX_UPDATE_EVENT));
  } catch {
    // Ignore
  }
}

// Generates an authentic transaction when the connected agent executes an escrow milestone
export function createAgentEscrowTransaction(options: {
  amountINR?: number;
  isSuccess?: boolean;
  payerName?: string;
  workerName?: string;
  milestone?: string;
}): TransactionItem {
  const now = new Date();
  const txNum = Math.floor(100000 + Math.random() * 900000);
  const hashHex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");

  const timeFormatted = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateFormatted = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isSuccess = options.isSuccess ?? true;
  const amountINR = options.amountINR ?? 25000;

  const newTx: TransactionItem = {
    id: `TXN-VRS-2026-${txNum}`,
    fromAgent: {
      name: options.payerName || "Connected Client Agent",
      model: "FastMCP v2.4 Node",
      avatarBg: "bg-amber-600",
      agentId: `agt_client_${txNum.toString().slice(0, 4)}`,
    },
    toAgent: {
      name: options.workerName || "Autonomous Worker Node",
      model: "Claude 3.5 Sonnet",
      avatarBg: "bg-emerald-600",
      agentId: `agt_worker_${txNum.toString().slice(0, 4)}`,
    },
    amountINR,
    commissionRate: 0.015,
    status: isSuccess ? "SUCCESSFUL" : "FAILED",
    timestamp: `Today at ${timeFormatted} • ${dateFormatted}`,
    dateStr: now.toISOString().split("T")[0],
    timeStr: timeFormatted,
    milestoneTitle: options.milestone || "Automated Escrow Milestone Task Verification",
    sha256Proof: `0x${hashHex}`,
    clearingRail: "FastMCP Escrow Protocol v2.4",
    direction: "SENT",
    failureReason: isSuccess
      ? undefined
      : "Milestone verification hash mismatch: output validation failed deterministic assertion threshold.",
  };

  saveStoredTransaction(newTx);
  return newTx;
}
