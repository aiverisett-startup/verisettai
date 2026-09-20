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

export interface VaultDeployment {
  id: string;
  title: string;
  amount: number;
  currency: string;
  status: "Active" | "Settled" | "Custody Locked";
  allocatedAgent: string;
  createdAt: string;
  rail: string;
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
  vault_deployments: VaultDeployment[];
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
  connected_agent_name: "Autonomous Settlement Agent",
  connected_agent_model: "FastMCP Protocol v2.4",
  transactions: [],
  vault_deployments: [
    {
      id: "VLT-PRIMARY-NODE",
      title: "Primary Autonomous Settlement Vault",
      amount: 10000,
      currency: "VRS",
      status: "Active",
      allocatedAgent: "Autonomous Settlement Agent",
      createdAt: new Date().toISOString(),
      rail: "FastMCP Escrow Protocol v2.4",
    },
  ],
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
  let state: VaultState = DEFAULT_STATE;

  if (fs.existsSync(STATE_FILE)) {
    try {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      state = {
        ...DEFAULT_STATE,
        ...parsed,
      };
    } catch {
      state = DEFAULT_STATE;
    }
  } else {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    } catch {
      // Ignore
    }
  }

  // Ensure active vault deployments are always populated with live data
  if (!state.vault_deployments || state.vault_deployments.length === 0) {
    state.vault_deployments = [
      {
        id: "VLT-PRIMARY-NODE",
        title: "Primary Autonomous Settlement Vault",
        amount: state.available_balance || 10000,
        currency: "VRS",
        status: "Active",
        allocatedAgent: state.connected_agent_name || "Autonomous Settlement Agent",
        createdAt: state.last_updated || new Date().toISOString(),
        rail: "FastMCP Escrow Protocol v2.4",
      },
    ];
  } else {
    // Keep primary vault synced with current available balance
    state.vault_deployments[0].amount = state.available_balance;
    if (state.connected_agent_name) {
      state.vault_deployments[0].allocatedAgent = state.connected_agent_name;
    }
  }

  return state;
}

export function autoDetectAgentIdentity(
  headers?: { get(name: string): string | null } | Headers | Record<string, string | string[] | undefined> | null,
  body?: any
): { name: string; model: string; hasAgentSignals: boolean } {
  const getHeader = (key: string): string => {
    if (!headers) return "";
    if (typeof (headers as any).get === "function") {
      return (headers as any).get(key) || "";
    }
    const val = (headers as Record<string, any>)[key] || (headers as Record<string, any>)[key.toLowerCase()];
    if (Array.isArray(val)) return val[0] || "";
    return typeof val === "string" ? val : "";
  };

  // 1. Explicit Agent Headers
  const explicitName = getHeader("x-agent-name") || getHeader("agent-name") || getHeader("x-client-name");
  if (explicitName && explicitName.trim()) {
    return { name: explicitName.trim(), model: "Header-Defined Agent", hasAgentSignals: true };
  }

  // 2. Body Payload
  if (body) {
    if (body.clientInfo?.name) {
      return {
        name: body.clientInfo.name,
        model: body.clientInfo.version ? `FastMCP ${body.clientInfo.version}` : "FastMCP Client",
        hasAgentSignals: true,
      };
    }
    const bName =
      body.agent_name ||
      body.agentName ||
      body.client_name ||
      body.clientName ||
      body.payer_name ||
      body.payer_id ||
      body.fromAgent ||
      body.from_agent ||
      body.name;
    if (bName && typeof bName === "string" && bName.trim()) {
      return {
        name: bName.trim(),
        model: body.agent_model || body.model || "Autonomous Agent Node",
        hasAgentSignals: true,
      };
    }
  }

  // 3. User-Agent Header
  const ua = getHeader("user-agent") || "";
  if (ua) {
    if (ua.includes("python-requests") || ua.includes("Python") || ua.includes("aiohttp") || ua.includes("urllib")) {
      return { name: "Autonomous Python Agent", model: ua.split(" ")[0] || "Python Node", hasAgentSignals: true };
    }
    if (ua.includes("Claude") || ua.includes("anthropic")) {
      return { name: "Claude Desktop Agent", model: "Claude FastMCP Node", hasAgentSignals: true };
    }
    if (ua.includes("Cursor")) {
      return { name: "Cursor IDE Agent", model: "Cursor Daemon", hasAgentSignals: true };
    }
    if (ua.includes("node-fetch") || ua.includes("axios") || ua.includes("undici")) {
      return { name: "Autonomous Node.js Agent", model: "Node FastMCP Gateway", hasAgentSignals: true };
    }
    if (ua.includes("Go-http-client")) {
      return { name: "Go Autonomous Agent", model: "Go Runtime", hasAgentSignals: true };
    }
    if (ua.includes("curl")) {
      return { name: "cURL Automated Agent", model: "CLI Client", hasAgentSignals: true };
    }
    // Clean custom user-agent
    if (ua.length > 3 && !ua.includes("Mozilla") && !ua.includes("WebKit") && !ua.includes("Chrome")) {
      return { name: ua.split("/")[0].trim() + " Agent", model: "Custom Protocol Client", hasAgentSignals: true };
    }
  }

  // 4. API Key or Bearer Token
  const auth = getHeader("authorization") || getHeader("x-api-key") || "";
  if (auth) {
    const cleanToken = auth.replace(/^Bearer\s+/i, "").trim();
    if (cleanToken.startsWith("vrs_live_")) {
      const shortSeed = cleanToken.slice(9, 17);
      return { name: `Autonomous Agent (${shortSeed})`, model: "Bearer Token Protocol", hasAgentSignals: true };
    }
    if (cleanToken.startsWith("agt_")) {
      return { name: `Agent Node (${cleanToken.slice(0, 10)})`, model: "Direct Gateway", hasAgentSignals: true };
    }
    if (cleanToken.length > 5) {
      return { name: "Authenticated Agent Node", model: "API Key Client", hasAgentSignals: true };
    }
  }

  return { name: "Autonomous Settlement Agent", model: "FastMCP Protocol v2.4", hasAgentSignals: false };
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

export function deployNewSubVault(title: string, amount: number, agentName?: string): VaultDeployment {
  const state = getVaultState();
  const id = `VLT-${Math.floor(100000 + Math.random() * 900000)}`;
  const deployment: VaultDeployment = {
    id,
    title: title || "Autonomous Agent Escrow Sub-Vault",
    amount: amount || 2500,
    currency: "VRS",
    status: "Active",
    allocatedAgent: agentName || state.connected_agent_name || "Autonomous Settlement Agent",
    createdAt: new Date().toISOString(),
    rail: "FastMCP Escrow Protocol v2.4",
  };
  if (!state.vault_deployments) state.vault_deployments = [];
  state.vault_deployments.unshift(deployment);
  state.is_agent_connected = true;
  saveVaultState(state);
  return deployment;
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

  // Sync active vault deployments
  if (!state.vault_deployments || state.vault_deployments.length === 0) {
    state.vault_deployments = [
      {
        id: "VLT-PRIMARY-NODE",
        title: "Primary Autonomous Settlement Vault",
        amount: state.available_balance,
        currency: "VRS",
        status: "Active",
        allocatedAgent: senderName,
        createdAt: now.toISOString(),
        rail: "FastMCP Escrow Protocol v2.4",
      },
    ];
  } else {
    state.vault_deployments[0].amount = state.available_balance;
    state.vault_deployments[0].allocatedAgent = senderName;
  }

  // Add escrow settlement sub-deployment
  state.vault_deployments.unshift({
    id: `VLT-ESC-${txNum}`,
    title: `Escrow: ${senderName} -> ${receiverName}`,
    amount,
    currency: "VRS",
    status: isSuccess ? "Settled" : "Active",
    allocatedAgent: senderName,
    createdAt: now.toISOString(),
    rail: "FastMCP Escrow Protocol v2.4",
  });

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

  // Sync active vault deployments
  if (!state.vault_deployments || state.vault_deployments.length === 0) {
    state.vault_deployments = [
      {
        id: "VLT-PRIMARY-NODE",
        title: "Primary Autonomous Settlement Vault",
        amount: state.available_balance,
        currency: "VRS",
        status: "Active",
        allocatedAgent: agentName,
        createdAt: now.toISOString(),
        rail: "FastMCP Escrow Protocol v2.4",
      },
    ];
  } else {
    state.vault_deployments[0].amount = state.available_balance;
    state.vault_deployments[0].allocatedAgent = agentName;
    state.vault_deployments[0].status = "Active";
  }

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
  if (state.vault_deployments && state.vault_deployments.length > 0) {
    state.vault_deployments[0].allocatedAgent = state.connected_agent_name;
    state.vault_deployments[0].amount = state.available_balance;
    state.vault_deployments[0].status = "Active";
  }
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
