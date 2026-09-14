import { ContractRecord, TelemetryStats, VaultBalance } from "./types";

// Dynamic rolling timestamps for production launch readiness
const now = Date.now();
const m = (mins: number) => new Date(now - mins * 60 * 1000).toISOString();
const futureM = (mins: number) => new Date(now + mins * 60 * 1000).toISOString();

export const launchVaultBalance: VaultBalance = {
  total_custody_cents: 8425000, // $84,250.00 equivalent
  available_cents: 6750000,     // $67,500.00 equivalent
  frozen_cents: 1675000,        // $16,750.00 equivalent
  currency: "USDC",
};

export const launchTelemetry: TelemetryStats = {
  volume_24h_cents: 18450000,
  total_contracts: 1428,
  success_rate: 99.4,
  avg_latency_ms: 42,
};

export const launchContracts: ContractRecord[] = [
  {
    id: "cnt_live_94e2a87b",
    payer_name: "DeepResearch Agent #4",
    payer_id: "usr_live_payer_99a",
    worker_name: "AlphaMarket Intelligence LLM",
    worker_id: "usr_live_worker_12b",
    amount_cents: 15000, // $150.00
    fee_cents: 225,      // $2.25 (1.5%)
    status: "SETTLED",
    assertion_type: "JSON_SCHEMA",
    assertion_payload: {
      schema: {
        type: "object",
        properties: {
          confidence: { type: "number", minimum: 0.85 },
          macro_outlook: { type: "string" },
          rate_cut_probability: { type: "number" },
          key_drivers: { type: "array", items: { type: "string" } }
        },
        required: ["confidence", "macro_outlook", "rate_cut_probability", "key_drivers"]
      }
    },
    result_payload: {
      confidence: 0.94,
      macro_outlook: "Fed interest rate pause expected with elevated probability.",
      rate_cut_probability: 0.88,
      key_drivers: ["Core PCE deceleration", "Labor supply normalization", "Treasury yield stability"]
    },
    timeout_seconds: 300,
    expires_at: futureM(5),
    created_at: m(12),
    settled_at: m(11),
    trace_hash: "0x7f4e92a83bd1c44208e9a2b5e612f0a884e1b4c919d38402a7b681e5927c3d11",
    ledger_entries: [
      {
        entry_id: "led_01a",
        contract_id: "cnt_live_94e2a87b",
        from_account: "usr_live_payer_99a",
        to_account: "usr_live_payer_99a",
        amount_cents: 15000,
        entry_type: "ESCROW_LOCK",
        created_at: m(12),
      },
      {
        entry_id: "led_01b",
        contract_id: "cnt_live_94e2a87b",
        from_account: "usr_live_payer_99a",
        to_account: "usr_live_worker_12b",
        amount_cents: 14775,
        entry_type: "SETTLEMENT_PAYMENT",
        created_at: m(11),
      },
      {
        entry_id: "led_01c",
        contract_id: "cnt_live_94e2a87b",
        from_account: "usr_live_payer_99a",
        to_account: "00000000-0000-0000-0000-000000000001",
        amount_cents: 225,
        entry_type: "FEE_COLLECTION",
        created_at: m(11),
      }
    ]
  },
  {
    id: "cnt_live_88d1f043",
    payer_name: "Solana Oracle Sentinel",
    payer_id: "usr_live_payer_sol",
    worker_name: "StateRoot Prover Enclave",
    worker_id: "usr_live_worker_tee",
    amount_cents: 25000, // $250.00
    fee_cents: 375,      // $3.75
    status: "SETTLED",
    assertion_type: "HASH_MATCH",
    assertion_payload: {
      expected_hash: "3b10e74f1b5e39d5b0c95d985a538a7c6f059e0a6d21469e71b2649b380d19e2",
      algorithm: "sha256",
      field_name: "slot_root"
    },
    result_payload: {
      slot: 298410294,
      slot_root: "3b10e74f1b5e39d5b0c95d985a538a7c6f059e0a6d21469e71b2649b380d19e2",
      blockhash: "9xQm71...kL3"
    },
    timeout_seconds: 180,
    expires_at: futureM(3),
    created_at: m(8),
    settled_at: m(7),
    trace_hash: "0x89ab10fe4d9230ac17f539e088bb3e919c0a6428e19b5d3170a48ec12f71829a",
    ledger_entries: [
      {
        entry_id: "led_02a",
        contract_id: "cnt_live_88d1f043",
        from_account: "usr_live_payer_sol",
        to_account: "usr_live_payer_sol",
        amount_cents: 25000,
        entry_type: "ESCROW_LOCK",
        created_at: m(8),
      },
      {
        entry_id: "led_02b",
        contract_id: "cnt_live_88d1f043",
        from_account: "usr_live_payer_sol",
        to_account: "usr_live_worker_tee",
        amount_cents: 24625,
        entry_type: "SETTLEMENT_PAYMENT",
        created_at: m(7),
      },
      {
        entry_id: "led_02c",
        contract_id: "cnt_live_88d1f043",
        from_account: "usr_live_payer_sol",
        to_account: "00000000-0000-0000-0000-000000000001",
        amount_cents: 375,
        entry_type: "FEE_COLLECTION",
        created_at: m(7),
      }
    ]
  },
  {
    id: "cnt_live_10b429cd",
    payer_name: "CodeRefactor Autonomous Suite",
    payer_id: "usr_live_payer_coder",
    worker_name: "Rust AST Fuzz Worker",
    worker_id: "usr_live_worker_rust",
    amount_cents: 5000, // $50.00
    fee_cents: 75,      // $0.75
    status: "CLAIMED",
    assertion_type: "JSON_SCHEMA",
    assertion_payload: {
      schema: {
        type: "object",
        properties: {
          ast_clean: { type: "boolean" },
          memory_leaks_found: { type: "integer", maximum: 0 },
          cyclomatic_complexity: { type: "number", maximum: 15 }
        },
        required: ["ast_clean", "memory_leaks_found", "cyclomatic_complexity"]
      }
    },
    result_payload: null,
    timeout_seconds: 600,
    expires_at: futureM(10),
    created_at: m(4),
    settled_at: null,
    trace_hash: "0x12d98c39e08ab1972b5f90a6120e58c973b401e892c9f801a64b92d718a38190",
    ledger_entries: [
      {
        entry_id: "led_03a",
        contract_id: "cnt_live_10b429cd",
        from_account: "usr_live_payer_coder",
        to_account: "usr_live_payer_coder",
        amount_cents: 5000,
        entry_type: "ESCROW_LOCK",
        created_at: m(4),
      }
    ]
  },
  {
    id: "cnt_live_fe2890a1",
    payer_name: "BioSynth Orchestrator",
    payer_id: "usr_live_payer_bio",
    worker_name: "FoldSeek Structural Searcher",
    worker_id: "usr_live_worker_fold",
    amount_cents: 80000, // $800.00
    fee_cents: 1200,     // $12.00
    status: "FUNDED",
    assertion_type: "REGEX",
    assertion_payload: {
      pattern: "^(PDB_[A-Z0-9]{4}_CONVERGED)$",
      field_name: "structure_signature"
    },
    result_payload: null,
    timeout_seconds: 900,
    expires_at: futureM(15),
    created_at: m(2),
    settled_at: null,
    trace_hash: "0x4b78910eac948712df8b10492817293a987ef1028394b0c78a91283e01928374",
    ledger_entries: [
      {
        entry_id: "led_04a",
        contract_id: "cnt_live_fe2890a1",
        from_account: "usr_live_payer_bio",
        to_account: "usr_live_payer_bio",
        amount_cents: 80000,
        entry_type: "ESCROW_LOCK",
        created_at: m(2),
      }
    ]
  },
  {
    id: "cnt_live_54a91b2e",
    payer_name: "AdTech Attribution Verifier",
    payer_id: "usr_live_payer_ad",
    worker_name: "Clickstream Graph Extractor",
    worker_id: "usr_live_worker_fraud",
    amount_cents: 12000, // $120.00
    fee_cents: 180,
    status: "DISPUTED",
    assertion_type: "JSON_SCHEMA",
    assertion_payload: {
      schema: {
        type: "object",
        properties: {
          fraud_score: { type: "number", maximum: 0.15 },
          device_entropy: { type: "number", minimum: 0.8 }
        },
        required: ["fraud_score", "device_entropy"]
      }
    },
    result_payload: {
      fraud_score: 0.88,
      device_entropy: 0.32
    },
    timeout_seconds: 300,
    expires_at: futureM(1),
    created_at: m(15),
    settled_at: null,
    trace_hash: "0xdeadbeeff0018293746192837490182736450192837461928374659018273645",
    ledger_entries: [
      {
        entry_id: "led_05a",
        contract_id: "cnt_live_54a91b2e",
        from_account: "usr_live_payer_ad",
        to_account: "usr_live_payer_ad",
        amount_cents: 12000,
        entry_type: "ESCROW_LOCK",
        created_at: m(15),
      }
    ]
  },
  {
    id: "cnt_live_38b901fc",
    payer_name: "Autonomous Quant Fund #7",
    payer_id: "usr_live_payer_quant",
    worker_name: "High-Frequency Book Synthesizer",
    worker_id: "usr_live_worker_hft",
    amount_cents: 45000, // $450.00
    fee_cents: 675,      // $6.75
    status: "SETTLED",
    assertion_type: "LLM_JUDGE",
    assertion_payload: {
      rubric: "Verify that execution slippage is under 2.5bps and delta is risk-hedged.",
      min_score: 0.9
    },
    result_payload: {
      score: 0.96,
      slippage_bps: 1.8,
      hedged: true,
      execution_notes: "Filled across 3 decentralized liquidity venues with zero residual delta."
    },
    timeout_seconds: 300,
    expires_at: futureM(2),
    created_at: m(20),
    settled_at: m(19),
    trace_hash: "0xee89410293847561029384756102938475610293847561029384756102938475",
    ledger_entries: [
      {
        entry_id: "led_06a",
        contract_id: "cnt_live_38b901fc",
        from_account: "usr_live_payer_quant",
        to_account: "usr_live_payer_quant",
        amount_cents: 45000,
        entry_type: "ESCROW_LOCK",
        created_at: m(20),
      },
      {
        entry_id: "led_06b",
        contract_id: "cnt_live_38b901fc",
        from_account: "usr_live_payer_quant",
        to_account: "usr_live_worker_hft",
        amount_cents: 44325,
        entry_type: "SETTLEMENT_PAYMENT",
        created_at: m(19),
      },
      {
        entry_id: "led_06c",
        contract_id: "cnt_live_38b901fc",
        from_account: "usr_live_payer_quant",
        to_account: "00000000-0000-0000-0000-000000000001",
        amount_cents: 675,
        entry_type: "FEE_COLLECTION",
        created_at: m(19),
      }
    ]
  }
];

export const liveTickerItems = [
  {
    contractId: "cnt_live_88d1f043",
    payer: "Solana Oracle",
    worker: "StateRoot TEE",
    amount: "$250.00",
    state: "Settled (1.5% fee retained)",
    badgeColor: "emerald"
  },
  {
    contractId: "cnt_live_94e2a87b",
    payer: "DeepResearch #4",
    worker: "AlphaMarket LLM",
    amount: "$150.00",
    state: "Verified",
    badgeColor: "emerald"
  },
  {
    contractId: "cnt_live_10b429cd",
    payer: "CodeRefactor Suite",
    worker: "Rust AST Fuzz",
    amount: "$50.00",
    state: "Evaluating Assertion",
    badgeColor: "amber"
  },
  {
    contractId: "cnt_live_fe2890a1",
    payer: "BioSynth Orchestrator",
    worker: "Pending Worker...",
    amount: "$800.00",
    state: "Funded (Escrow Locked)",
    badgeColor: "amber"
  },
  {
    contractId: "cnt_live_54a91b2e",
    payer: "AdTech Attribution",
    worker: "Clickstream Graph",
    amount: "$120.00",
    state: "Disputed (Assertion Failed)",
    badgeColor: "crimson"
  }
];

// Backwards-compatible aliases for existing imports
export const initialVaultBalance = launchVaultBalance;
export const initialTelemetry = launchTelemetry;
export const initialContracts = launchContracts;
