import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface ServerTransactionItem {
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
  timestamp: string;
  dateStr: string;
  timeStr: string;
  milestoneTitle: string;
  sha256Proof: string;
  clearingRail: string;
  direction?: "SENT" | "RECEIVED";
  failureReason?: string;
}

export interface VaultState {
  testnet_balance: number;
  available_balance: number;
  frozen_balance: number;
  total_volume: number;
  total_commission: number;
  is_agent_connected: boolean;
  connected_agent_id: string;
  connected_agent_name: string;
  connected_agent_model: string;
  transactions: ServerTransactionItem[];
  last_updated: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "live_vault_state.json");

const DEFAULT_STATE: VaultState = {
  testnet_balance: 10000,
  available_balance: 10000,
  frozen_balance: 0,
  total_volume: 0,
  total_commission: 0,
  is_agent_connected: false,
  connected_agent_id: "agt_live_node",
  connected_agent_name: "FastMCP Autonomous Agent",
  connected_agent_model: "MCP Client v2.4",
  transactions: [],
  last_updated: new Date().toISOString(),
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore
    }
  }
}

export function getVaultState(): VaultState {
  ensureDir();
  if (!fs.existsSync(STATE_FILE)) {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    } catch {
      return DEFAULT_STATE;
    }
    return DEFAULT_STATE;
  }

  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveVaultState(state: VaultState): void {
  ensureDir();
  try {
    state.last_updated = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Error writing vault state:", err);
  }
}

// 1. Transfer Between Agents: Deducts money from vault
export function recordAgentTransfer(params: {
  amountINR: number;
  fromAgentName?: string;
  fromAgentModel?: string;
  toAgentName?: string;
  toAgentModel?: string;
  milestoneTitle?: string;
  status?: "SUCCESSFUL" | "FAILED" | "PENDING";
  failureReason?: string;
}): { state: VaultState; transaction: ServerTransactionItem } {
  const state = getVaultState();
  const now = new Date();
  const isSuccess = params.status !== "FAILED";
  const amount = Math.max(1, params.amountINR || 1000);
  const commission = Math.round(amount * 0.015);
  const txNum = Math.floor(100000 + Math.random() * 900000);

  const senderName = params.fromAgentName || state.connected_agent_name || "Autonomous Agent A";
  const receiverName = params.toAgentName || "Autonomous Agent B";

  // Compute SHA-256 proof hash
  const payloadToHash = `${senderName}-${receiverName}-${amount}-${now.getTime()}`;
  const sha256Proof = "0x" + crypto.createHash("sha256").update(payloadToHash).digest("hex");

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

  const tx: ServerTransactionItem = {
    id: `TXN-VRS-2026-${txNum}`,
    fromAgent: {
      name: senderName,
      model: params.fromAgentModel || "FastMCP v2.4 Node",
      avatarBg: "bg-amber-600",
      agentId: `agt_src_${txNum.toString().slice(0, 4)}`,
    },
    toAgent: {
      name: receiverName,
      model: params.toAgentModel || "Beneficiary Node",
      avatarBg: "bg-emerald-600",
      agentId: `agt_dest_${txNum.toString().slice(0, 4)}`,
    },
    amountINR: amount,
    commissionRate: 0.015,
    status: isSuccess ? "SUCCESSFUL" : "FAILED",
    timestamp: `Today at ${timeFormatted} • ${dateFormatted}`,
    dateStr: now.toISOString().split("T")[0],
    timeStr: timeFormatted,
    milestoneTitle: params.milestoneTitle || `Task: ${senderName} -> ${receiverName}`,
    sha256Proof,
    clearingRail: "FastMCP Escrow Protocol v2.4",
    direction: "SENT",
    failureReason: isSuccess
      ? undefined
      : params.failureReason || "Escrow validation failed: assertion hash discrepancy.",
  };

  // Update Vault Balances in Real Time
  if (isSuccess) {
    state.available_balance = Math.max(0, state.available_balance - amount);
    state.testnet_balance = Math.max(0, state.testnet_balance - amount);
    state.total_volume += amount;
    state.total_commission += commission;
  }

  state.is_agent_connected = true;
  if (params.fromAgentName) {
    state.connected_agent_name = params.fromAgentName;
  }
  state.transactions.unshift(tx);

  saveVaultState(state);
  return { state, transaction: tx };
}

// 2. Add Money / Deposit Funds: Increases Vault Money in Real Time!
export function recordVaultDeposit(params: {
  amountINR: number;
  agentName?: string;
  agentModel?: string;
  milestoneTitle?: string;
}): { state: VaultState; transaction: ServerTransactionItem } {
  const state = getVaultState();
  const now = new Date();
  const amount = Math.max(1, params.amountINR || 5000);
  const txNum = Math.floor(100000 + Math.random() * 900000);
  const agentName = params.agentName || state.connected_agent_name || "Autonomous Agent";

  const payloadToHash = `DEPOSIT-${agentName}-${amount}-${now.getTime()}`;
  const sha256Proof = "0x" + crypto.createHash("sha256").update(payloadToHash).digest("hex");

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

  const tx: ServerTransactionItem = {
    id: `TXN-VRS-2026-${txNum}`,
    fromAgent: {
      name: agentName,
      model: params.agentModel || "FastMCP Deposit Client",
      avatarBg: "bg-emerald-600",
      agentId: `agt_dep_${txNum.toString().slice(0, 4)}`,
    },
    toAgent: {
      name: "Verisett Vault Custody",
      model: "Autonomous Clearinghouse Vault",
      avatarBg: "bg-[#9E7A45]",
      agentId: "vault_custody_01",
    },
    amountINR: amount,
    commissionRate: 0,
    status: "SUCCESSFUL",
    timestamp: `Today at ${timeFormatted} • ${dateFormatted}`,
    dateStr: now.toISOString().split("T")[0],
    timeStr: timeFormatted,
    milestoneTitle: params.milestoneTitle || `Vault Liquidity Deposit by ${agentName}`,
    sha256Proof,
    clearingRail: "FastMCP Escrow Protocol v2.4",
    direction: "RECEIVED",
  };

  // REAL-TIME VAULT INCREASE:
  state.available_balance += amount;
  state.testnet_balance += amount;
  state.total_volume += amount;
  state.is_agent_connected = true;
  state.connected_agent_name = agentName;
  state.transactions.unshift(tx);

  saveVaultState(state);
  return { state, transaction: tx };
}

export function setServerAgentConnected(
  connected: boolean,
  agentId?: string,
  agentName?: string,
  agentModel?: string
): VaultState {
  const state = getVaultState();
  state.is_agent_connected = connected;
  if (agentId) state.connected_agent_id = agentId;
  if (agentName) state.connected_agent_name = agentName;
  if (agentModel) state.connected_agent_model = agentModel;
  saveVaultState(state);
  return state;
}

export function resetServerVault(): VaultState {
  const resetState: VaultState = {
    ...DEFAULT_STATE,
    transactions: [],
    last_updated: new Date().toISOString(),
  };
  saveVaultState(resetState);
  return resetState;
}
