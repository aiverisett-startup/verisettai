/**
 * Verisett AI — Autonomous Agent Escrow Clearinghouse
 * Core Type Definitions & Protocol Contracts
 */

export type VaultStatus = "LOCKED" | "SETTLED" | "REFUNDED" | "DISPUTED";

export interface Vault {
  vault_id: string;
  buyer_agent_id: string;
  seller_agent_id: string;
  amount_cents: number; // Strictly integer cents (e.g., 1000 = $10.00 / 10 VRS)
  timeout_seconds: number;
  expected_sha256: string; // Canonical 64-char lowercase hex
  status: VaultStatus;
  created_at: number; // Epoch timestamp (ms)
  expires_at: number; // Epoch timestamp (ms)
  settled_at?: number;
  refunded_at?: number;
  tx_hash?: string;
  dispute_reason?: string;
}

// ---------------------------------------------------------------------------
// MCP Tool Protocol Schemas
// ---------------------------------------------------------------------------

export interface CreateVaultParams {
  buyer_agent_id: string;
  seller_agent_id: string;
  amount_cents: number;
  timeout_seconds: number;
  expected_sha256: string;
}

export interface CreateVaultResponse {
  vault_id: string;
  status: "LOCKED";
  expires_at: number;
  expected_sha256: string;
}

export interface SubmitAssertionParams {
  vault_id: string;
  seller_agent_id: string;
  payload_data: string; // UTF-8 text or Base64 encoded payload
}

export interface SubmitAssertionResponse {
  settled: boolean;
  tx_hash?: string;
  payout_cents?: number;
  fee_cents?: number;
  latency_ms: number;
  error?: string;
}

export interface ClaimTimeoutClawbackParams {
  vault_id: string;
  buyer_agent_id: string;
}

export interface ClaimTimeoutClawbackResponse {
  refunded: boolean;
  vault_id: string;
  refund_amount_cents: number;
  status: "REFUNDED";
  tx_hash?: string;
  error?: string;
}

export interface GetVaultStatusParams {
  vault_id: string;
}

export interface GetVaultStatusResponse {
  vault_id: string;
  status: VaultStatus;
  amount_cents: number;
  buyer_agent_id: string;
  seller_agent_id: string;
  expected_sha256: string;
  created_at: number;
  expires_at: number;
  settled_at?: number;
  refunded_at?: number;
  tx_hash?: string;
  time_remaining_ms: number;
}

// ---------------------------------------------------------------------------
// Double-Entry Ledger Types
// ---------------------------------------------------------------------------

export type AccountType =
  | "ESCROW_VAULT"
  | "SELLER_BALANCE"
  | "BUYER_BALANCE"
  | "PLATFORM_FEE_ACCOUNT";

export type EntryDirection = "DEBIT" | "CREDIT";

export interface LedgerEntry {
  id: string;
  tx_id: string;
  account_id: string;
  account_type: AccountType;
  direction: EntryDirection;
  amount_cents: number; // Strict positive integer
  timestamp: number;
}

export interface LedgerTransaction {
  tx_id: string;
  tx_hash: string;
  vault_id: string;
  action: "VAULT_LOCKED" | "VAULT_SETTLED" | "VAULT_REFUNDED";
  entries: LedgerEntry[];
  total_debit_cents: number;
  total_credit_cents: number;
  prev_hash: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Sandbox Public API Schemas
// ---------------------------------------------------------------------------

export interface SandboxAssertRequest {
  vault_id?: string;
  expected_sha256?: string;
  payload: string;
}

export interface SandboxAssertResponse {
  status: "SETTLED" | "REJECTED";
  verified: boolean;
  computed_sha256: string;
  expected_sha256: string;
  network_fee_cents: number;
  settlement_latency_ms: number;
  audit_signature: string;
  tx_hash?: string;
  error?: string;
}
