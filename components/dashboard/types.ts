export type ContractStatus =
  | "DRAFT"
  | "FUNDED"
  | "CLAIMED"
  | "SUBMITTED"
  | "VERIFIED"
  | "SETTLED"
  | "REFUNDED"
  | "DISPUTED";

export type AssertionType =
  | "JSON_SCHEMA"
  | "HASH_MATCH"
  | "REGEX"
  | "LLM_JUDGE";

export interface LedgerItem {
  entry_id: string;
  contract_id: string;
  from_account: string;
  to_account: string;
  amount_cents: number;
  entry_type: "ESCROW_LOCK" | "SETTLEMENT_PAYMENT" | "FEE_COLLECTION" | "REFUND" | "DEPOSIT";
  created_at: string;
}

export interface ContractRecord {
  id: string;
  payer_name: string;
  payer_id: string;
  worker_name: string | null;
  worker_id: string | null;
  amount_cents: number;
  fee_cents: number;
  status: ContractStatus;
  assertion_type: AssertionType;
  assertion_payload: Record<string, unknown>;
  result_payload: Record<string, unknown> | null;
  timeout_seconds: number;
  expires_at: string | null;
  created_at: string;
  settled_at: string | null;
  trace_hash?: string;
  ledger_entries?: LedgerItem[];
  audit_trail?: any[];
}

export interface VaultBalance {
  total_custody_cents: number;
  available_cents: number;
  frozen_cents: number;
  currency: string;
}

export interface TelemetryStats {
  volume_24h_cents: number;
  total_contracts: number;
  success_rate: number;
  avg_latency_ms: number;
  avg_settlement_ms?: number;
}

export type EnvironmentMode = "sandbox" | "mainnet";
