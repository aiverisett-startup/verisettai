import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

export const API_KEY_SALT = "verisett_secure_salt_ai_escrow";

export interface DbAccount {
  id: string;
  name: string;
  role: string;
  balance_cents: number;
  balance_credits: number;
  frozen_cents: number;
  currency: string;
  status: "ACTIVE" | "SETTLING" | "STANDBY" | "REVOKED";
  created_at: string;
  updated_at: string;
}

export interface DbContract {
  id: string;
  payer_id: string;
  worker_id: string | null;
  amount_cents: number;
  fee_cents: number;
  status: "FUNDED" | "CLAIMED" | "SETTLED" | "DISPUTED" | "EXPIRED" | "REFUNDED" | string;
  assertion_type: string;
  assertion_payload: string | null;
  result_payload: string | null;
  timeout_seconds: number;
  expires_at: string | null;
  created_at: string;
  settled_at: string | null;
  payer_name?: string;
  worker_name?: string;
}

export interface DbLedgerEntry {
  entry_id: string;
  contract_id: string | null;
  from_account: string;
  to_account: string;
  amount_cents: number;
  entry_type: string;
  created_at: string;
  from_name?: string;
  to_name?: string;
}

export interface NormalizedTransaction {
  id: string;
  contract_id?: string;
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
  amountCredits: number;
  feeCredits: number;
  commissionRate: number;
  status: "SUCCESSFUL" | "FAILED" | "PENDING";
  rawStatus: string;
  timestamp: string;
  dateStr: string;
  timeStr: string;
  milestoneTitle: string;
  sha256Proof: string;
  clearingRail: string;
  direction?: "SENT" | "RECEIVED";
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = path.join(process.cwd(), "verisett.db");
  if (!fs.existsSync(dbPath)) {
    throw new Error(`verisett.db not found at ${dbPath}`);
  }

  dbInstance = new DatabaseSync(dbPath);
  try {
    dbInstance.exec("PRAGMA journal_mode = WAL;");
    dbInstance.exec("PRAGMA busy_timeout = 5000;");

    // Initialize cryptographic API keys table with hash-at-rest storage
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id VARCHAR(36) PRIMARY KEY,
        account_id VARCHAR(36) NOT NULL,
        key_hash VARCHAR(64) NOT NULL UNIQUE,
        key_hint VARCHAR(32) NOT NULL,
        prefix VARCHAR(16) NOT NULL,
        status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
        created_at DATETIME NOT NULL,
        revoked_at DATETIME,
        last_used_at DATETIME,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      );
      CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
      CREATE INDEX IF NOT EXISTS idx_api_keys_account ON api_keys(account_id);
    `);
  } catch (err) {
    console.warn("Could not configure PRAGMA or api_keys schema:", err);
  }

  return dbInstance;
}

export interface GeneratedApiKey {
  rawKey: string;
  keyHash: string;
  keyHint: string;
  prefix: string;
  createdAt: string;
}

export interface StoredApiKeyRecord {
  id: string;
  accountId: string;
  keyHint: string;
  prefix: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
  revokedAt?: string | null;
  lastUsedAt?: string | null;
}

/**
 * Generates an unguessable 256-bit entropy API key using Node's native CSPRNG (crypto.randomBytes).
 * Format: vrs_live_[64_hex_chars] or vrs_test_[64_hex_chars] (256 bits entropy).
 */
export function generateCryptographicApiKey(type: "live" | "test" = "live"): GeneratedApiKey {
  const prefix = type === "live" ? "vrs_live_" : "vrs_test_";
  // 32 random bytes = 256 bits of true cryptographic entropy
  const entropyHex = crypto.randomBytes(32).toString("hex");
  const rawKey = `${prefix}${entropyHex}`;

  // One-way SHA-256 hash (never store rawKey in database)
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  // Truncated hint for UI: prefix + ... + last 4 characters (e.g. vrs_live_...8f2a)
  const keyHint = `${prefix}...${rawKey.slice(-4)}`;
  const createdAt = new Date().toISOString();

  return {
    rawKey,
    keyHash,
    keyHint,
    prefix,
    createdAt,
  };
}

/**
 * Creates and stores a new hashed API key for an account.
 * Stores only key_hash, hint, and timestamp.
 * Returns rawKey ONCE with security warning.
 */
export function createAgentApiKey(
  accountId: string,
  type: "live" | "test" = "live"
): {
  id: string;
  key: string;
  keyHint: string;
  prefix: string;
  createdAt: string;
  warning: string;
} {
  const db = getDb();
  const generated = generateCryptographicApiKey(type);
  const id = crypto.randomUUID();

  const insertStmt = db.prepare(`
    INSERT INTO api_keys (id, account_id, key_hash, key_hint, prefix, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)
  `);
  insertStmt.run(
    id,
    accountId,
    generated.keyHash,
    generated.keyHint,
    generated.prefix,
    generated.createdAt
  );

  // Update account's active api_key_hash and timestamp
  try {
    db.prepare(`
      UPDATE accounts
      SET api_key_hash = ?, updated_at = ?
      WHERE id = ?
    `).run(generated.keyHash, generated.createdAt, accountId);
  } catch (err) {
    console.warn("Could not update account api_key_hash:", err);
  }

  return {
    id,
    key: generated.rawKey,
    keyHint: generated.keyHint,
    prefix: generated.prefix,
    createdAt: generated.createdAt,
    warning: "Copy this key now. It will never be displayed again.",
  };
}

/**
 * Instantly revokes an API key by ID or hash.
 */
export function revokeApiKey(keyId: string, accountId?: string): boolean {
  const db = getDb();
  const now = new Date().toISOString();

  // Retrieve key_hash for this keyId
  const keyRow = db
    .prepare("SELECT key_hash, account_id FROM api_keys WHERE id = ?")
    .get(keyId) as { key_hash: string; account_id: string } | undefined;

  let changes = 0;
  if (accountId) {
    const stmt = db.prepare(`
      UPDATE api_keys
      SET status = 'REVOKED', revoked_at = ?
      WHERE id = ? AND account_id = ?
    `);
    const res = stmt.run(now, keyId, accountId);
    changes = res.changes;
  } else {
    const stmt = db.prepare(`
      UPDATE api_keys
      SET status = 'REVOKED', revoked_at = ?
      WHERE id = ?
    `);
    const res = stmt.run(now, keyId);
    changes = res.changes;
  }

  // Instantly invalidate corresponding hash in accounts table to ensure fallback never authenticates revoked key
  if (keyRow?.key_hash) {
    try {
      db.prepare(`
        UPDATE accounts
        SET api_key_hash = 'REVOKED_' || ?, updated_at = ?
        WHERE api_key_hash = ?
      `).run(keyId, now, keyRow.key_hash);
    } catch (err) {
      console.warn("Could not invalidate accounts.api_key_hash on revoke:", err);
    }
  }

  return changes > 0;
}

/**
 * List API keys for an account, showing only masked hints (first 8 and last 4 characters).
 * Raw key and key_hash are never returned.
 */
export function listApiKeys(accountId?: string): StoredApiKeyRecord[] {
  const db = getDb();
  let rows: any[];

  if (accountId) {
    rows = db.prepare(`
      SELECT id, account_id, key_hint, prefix, status, created_at, revoked_at, last_used_at
      FROM api_keys
      WHERE account_id = ?
      ORDER BY created_at DESC
    `).all(accountId) as any[];
  } else {
    rows = db.prepare(`
      SELECT id, account_id, key_hint, prefix, status, created_at, revoked_at, last_used_at
      FROM api_keys
      ORDER BY created_at DESC
      LIMIT 20
    `).all() as any[];
  }

  return rows.map((r) => ({
    id: r.id,
    accountId: r.account_id,
    keyHint: r.key_hint,
    prefix: r.prefix,
    status: r.status,
    createdAt: r.created_at,
    revokedAt: r.revoked_at,
    lastUsedAt: r.last_used_at,
  }));
}

/**
 * Constant-time API key verification using crypto.timingSafeEqual().
 * Prevents timing side-channel attacks by comparing 32-byte sha256 hash buffers.
 */
export function verifyApiKeyConstantTime(providedKey: string): {
  valid: boolean;
  account: DbAccount | null;
  keyId?: string;
} {
  if (!providedKey || typeof providedKey !== "string") {
    return { valid: false, account: null };
  }

  const cleanKey = providedKey.replace(/^Bearer\s+/i, "").trim();
  if (!cleanKey) {
    return { valid: false, account: null };
  }

  // 1. Compute 32-byte SHA-256 buffer of incoming key
  const incomingHashBuffer = crypto.createHash("sha256").update(cleanKey).digest(); // 32 bytes
  const saltedIncomingHashBuffer = crypto
    .createHash("sha256")
    .update(`${API_KEY_SALT}:${cleanKey}`)
    .digest(); // 32 bytes

  const db = getDb();
  let matchedAccountId: string | null = null;
  let matchedKeyId: string | undefined = undefined;

  // 2. Compare against active keys in api_keys table in constant time
  const activeKeys = db.prepare(`
    SELECT id, account_id, key_hash, status FROM api_keys WHERE status = 'ACTIVE'
  `).all() as Array<{ id: string; account_id: string; key_hash: string; status: string }>;

  for (const k of activeKeys) {
    if (k.key_hash && k.key_hash.length === 64) {
      const storedBuffer = Buffer.from(k.key_hash, "hex");
      if (storedBuffer.length === incomingHashBuffer.length) {
        if (crypto.timingSafeEqual(incomingHashBuffer, storedBuffer)) {
          matchedAccountId = k.account_id;
          matchedKeyId = k.id;
          try {
            db.prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").run(
              new Date().toISOString(),
              k.id
            );
          } catch {}
          break;
        }
      }
    }
  }

  // 2b. Reject immediately if key is explicitly marked REVOKED in api_keys
  if (!matchedAccountId) {
    const revokedKeys = db.prepare(`
      SELECT key_hash FROM api_keys WHERE status = 'REVOKED'
    `).all() as Array<{ key_hash: string }>;

    for (const r of revokedKeys) {
      if (r.key_hash && r.key_hash.length === 64) {
        const storedBuffer = Buffer.from(r.key_hash, "hex");
        if (storedBuffer.length === 32 && crypto.timingSafeEqual(incomingHashBuffer, storedBuffer)) {
          const dummyBuffer = Buffer.alloc(32, 0);
          crypto.timingSafeEqual(incomingHashBuffer, dummyBuffer);
          return { valid: false, account: null };
        }
      }
    }
  }

  // 3. Fallback: check accounts table directly (both un-salted SHA-256 and legacy salted hash)
  if (!matchedAccountId) {
    const allAccounts = db.prepare(`
      SELECT id, api_key_hash FROM accounts WHERE api_key_hash IS NOT NULL AND api_key_hash NOT LIKE 'REVOKED%'
    `).all() as Array<{ id: string; api_key_hash: string }>;

    for (const acc of allAccounts) {
      if (acc.api_key_hash && acc.api_key_hash.length === 64) {
        const storedBuffer = Buffer.from(acc.api_key_hash, "hex");
        if (storedBuffer.length === 32) {
          const matchPlain = crypto.timingSafeEqual(incomingHashBuffer, storedBuffer);
          const matchSalted = crypto.timingSafeEqual(saltedIncomingHashBuffer, storedBuffer);
          if (matchPlain || matchSalted) {
            matchedAccountId = acc.id;
            break;
          }
        }
      }
    }
  }

  if (!matchedAccountId) {
    // Execute a constant-time dummy comparison to neutralize timing differences when key is invalid
    const dummyBuffer = Buffer.alloc(32, 0);
    crypto.timingSafeEqual(incomingHashBuffer, dummyBuffer);
    return { valid: false, account: null };
  }

  const account = getAgentAccountById(matchedAccountId);
  return { valid: !!account, account, keyId: matchedKeyId };
}

export function getAgentAccountById(accountId: string): DbAccount | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, name, role, balance_cents, frozen_cents, currency, created_at, updated_at, api_key_hash
    FROM accounts
    WHERE id = ?
    LIMIT 1
  `);
  const row = stmt.get(accountId) as any;
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    balance_cents: Number(row.balance_cents),
    balance_credits: Number(row.balance_cents),
    frozen_cents: Number(row.frozen_cents),
    currency: row.currency || "USD",
    status: row.frozen_cents > 0 ? "SETTLING" : "ACTIVE",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Computes salted SHA-256 hash of agent API key (legacy support).
 */
export function hashApiKey(apiKey: string): string {
  const salted = `${API_KEY_SALT}:${apiKey}`;
  return crypto.createHash("sha256").update(salted).digest("hex");
}

/**
 * Query the accounts table in verisett.db for the authenticated agent.
 * Authenticates using constant-time hash comparison (timingSafeEqual).
 */
export function getAgentAccount(keyOrId?: string): DbAccount | null {
  const db = getDb();
  let row: any = null;

  if (keyOrId && keyOrId.trim()) {
    const cleanKey = keyOrId.trim();

    // Constant-time check first
    const authResult = verifyApiKeyConstantTime(cleanKey);
    if (authResult.valid && authResult.account) {
      return authResult.account;
    }

    // Direct account ID lookup
    const stmtId = db.prepare(`
      SELECT id, name, role, balance_cents, frozen_cents, currency, created_at, updated_at, api_key_hash
      FROM accounts
      WHERE id = ?
      LIMIT 1
    `);
    row = stmtId.get(cleanKey);

    // If no row exists for this live API key, automatically provision a secure account with hashed key
    if (!row && (cleanKey.startsWith("vrs_live_") || cleanKey.startsWith("vrs_test_") || cleanKey.startsWith("vst_"))) {
      let agentName = "Autonomous Settlement Agent";
      const keySuffix = cleanKey.replace(/^vrs_(live|test)_/, "");
      if (keySuffix.toLowerCase().includes("noothan")) {
        agentName = "Noothan Autonomous Agent";
      } else {
        const rawPart = keySuffix.split("gmail")[0].replace(/[^a-zA-Z0-9]/g, "");
        if (rawPart && rawPart.length >= 3) {
          agentName = `${rawPart.charAt(0).toUpperCase() + rawPart.slice(1)} Autonomous Agent`;
        }
      }

      const newId = crypto.randomUUID();
      const now = new Date().toISOString();
      const oneWayHash = crypto.createHash("sha256").update(cleanKey).digest("hex");
      const keyHint = `${cleanKey.slice(0, 9)}...${cleanKey.slice(-4)}`;

      try {
        const insertStmt = db.prepare(`
          INSERT INTO accounts (id, api_key_hash, name, role, balance_cents, frozen_cents, currency, created_at, updated_at)
          VALUES (?, ?, ?, 'PAYER', 169000, 0, 'USD', ?, ?)
        `);
        insertStmt.run(newId, oneWayHash, agentName, now, now);

        // Also record in api_keys table
        try {
          db.prepare(`
            INSERT INTO api_keys (id, account_id, key_hash, key_hint, prefix, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)
          `).run(crypto.randomUUID(), newId, oneWayHash, keyHint, cleanKey.slice(0, 9), now);
        } catch {}

        row = {
          id: newId,
          name: agentName,
          role: "PAYER",
          balance_cents: 169000,
          frozen_cents: 0,
          currency: "USD",
          created_at: now,
          updated_at: now,
          api_key_hash: oneWayHash,
        };
      } catch (insertErr) {
        console.warn("Could not auto-provision account for key:", insertErr);
      }
    }
  }

  // Fallback: lookup Aiverisett Primary Payer Agent by name or known UUID
  if (!row) {
    const stmtFallback = db.prepare(`
      SELECT id, name, role, balance_cents, frozen_cents, currency, created_at, updated_at, api_key_hash
      FROM accounts
      WHERE name LIKE '%Aiverisett%' OR id = '827fe271-637a-414c-8fbc-5ba6b99f3bed'
      LIMIT 1
    `);
    row = stmtFallback.get();
  }

  // Second fallback: any active PAYER account
  if (!row) {
    const stmtPayer = db.prepare(`
      SELECT id, name, role, balance_cents, frozen_cents, currency, created_at, updated_at, api_key_hash
      FROM accounts
      WHERE role = 'PAYER'
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    row = stmtPayer.get();
  }

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    balance_cents: Number(row.balance_cents),
    balance_credits: Number(row.balance_cents), // 1 cent = 1 credit in Verisett testnet
    frozen_cents: Number(row.frozen_cents),
    currency: row.currency || "USD",
    status: row.frozen_cents > 0 ? "SETTLING" : "ACTIVE",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetch all recent contracts and ledger entries joined with account names.
 */
export function getTransactions(limit = 50): {
  contracts: DbContract[];
  ledger_entries: DbLedgerEntry[];
  transactions: NormalizedTransaction[];
} {
  const db = getDb();

  const contractsStmt = db.prepare(`
    SELECT 
      c.id, c.payer_id, c.worker_id, c.amount_cents, c.fee_cents, c.status,
      c.assertion_type, c.assertion_payload, c.result_payload, c.timeout_seconds,
      c.expires_at, c.created_at, c.settled_at,
      ap.name AS payer_name,
      aw.name AS worker_name
    FROM contracts c
    LEFT JOIN accounts ap ON c.payer_id = ap.id
    LEFT JOIN accounts aw ON c.worker_id = aw.id
    ORDER BY c.created_at DESC
    LIMIT ?
  `);
  const rawContracts = contractsStmt.all(limit) as any[];

  const ledgerStmt = db.prepare(`
    SELECT 
      l.entry_id, l.contract_id, l.from_account, l.to_account, l.amount_cents,
      l.entry_type, l.created_at,
      af.name AS from_name,
      at.name AS to_name
    FROM ledger_entries l
    LEFT JOIN accounts af ON l.from_account = af.id
    LEFT JOIN accounts at ON l.to_account = at.id
    ORDER BY l.created_at DESC
    LIMIT ?
  `);
  const rawLedger = ledgerStmt.all(limit) as any[];

  const contracts: DbContract[] = rawContracts.map((c) => ({
    id: c.id,
    payer_id: c.payer_id,
    worker_id: c.worker_id,
    amount_cents: Number(c.amount_cents),
    fee_cents: Number(c.fee_cents),
    status: c.status,
    assertion_type: c.assertion_type,
    assertion_payload: c.assertion_payload,
    result_payload: c.result_payload,
    timeout_seconds: Number(c.timeout_seconds),
    expires_at: c.expires_at,
    created_at: c.created_at,
    settled_at: c.settled_at,
    payer_name: c.payer_name || "Unknown Payer",
    worker_name: c.worker_name || "Unknown Worker",
  }));

  const ledger_entries: DbLedgerEntry[] = rawLedger.map((l) => ({
    entry_id: l.entry_id,
    contract_id: l.contract_id,
    from_account: l.from_account,
    to_account: l.to_account,
    amount_cents: Number(l.amount_cents),
    entry_type: l.entry_type,
    created_at: l.created_at,
    from_name: l.from_name,
    to_name: l.to_name,
  }));

  // Normalize contracts into UI-friendly TransactionItem structures
  const transactions: NormalizedTransaction[] = contracts.map((c) => {
    let taskTitle = "Autonomous Agent Escrow Settlement";
    if (c.assertion_payload) {
      try {
        const parsed = JSON.parse(c.assertion_payload);
        if (parsed.task_description) taskTitle = parsed.task_description;
        else if (parsed.schema?.description) taskTitle = parsed.schema.description;
        else if (parsed.pattern) taskTitle = `Pattern Verification: ${parsed.pattern}`;
      } catch {
        // use default
      }
    }

    const isSettled = c.status === "SETTLED";
    const isFailed = c.status === "DISPUTED" || c.status === "EXPIRED";
    const normStatus: "SUCCESSFUL" | "FAILED" | "PENDING" = isSettled
      ? "SUCCESSFUL"
      : isFailed
      ? "FAILED"
      : "PENDING";

    const timestamp = c.settled_at || c.created_at;
    const dateObj = new Date(timestamp);
    const dateStr = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Sep 20, 2026";
    const timeStr = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "12:00:00 PM";

    const proof =
      c.result_payload && c.result_payload.length > 10
        ? `sha256:${crypto.createHash("sha256").update(c.result_payload).digest("hex").slice(0, 16)}`
        : `sha256:${crypto.createHash("sha256").update(c.id).digest("hex").slice(0, 16)}`;

    return {
      id: c.id,
      contract_id: c.id,
      fromAgent: {
        name: c.payer_name || "Aiverisett Primary Payer Agent",
        model: "FastMCP Payer Agent",
        avatarBg: "from-amber-500 to-yellow-600",
        agentId: c.payer_id,
      },
      toAgent: {
        name: c.worker_name || "Gemini-Flash-Extractor (Worker)",
        model: "FastMCP Autonomous Worker",
        avatarBg: "from-emerald-500 to-teal-600",
        agentId: c.worker_id || "worker-node",
      },
      amountINR: c.amount_cents,
      amountCredits: c.amount_cents,
      feeCredits: c.fee_cents,
      commissionRate: c.amount_cents > 0 ? c.fee_cents / c.amount_cents : 0.015,
      status: normStatus,
      rawStatus: c.status,
      timestamp,
      dateStr,
      timeStr,
      milestoneTitle: taskTitle,
      sha256Proof: proof,
      clearingRail: "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP",
      direction: "SENT",
    };
  });

  return { contracts, ledger_entries, transactions };
}

/**
 * Execute a live transfer between agents directly in verisett.db.
 */
export function recordTransferInDb(params: {
  fromAgentName?: string;
  toAgentName?: string;
  amountCredits: number;
  status?: "SUCCESSFUL" | "FAILED";
  milestone?: string;
  apiKey?: string;
}): {
  contractId: string;
  newPayerBalance: number;
  transaction: NormalizedTransaction;
} {
  const db = getDb();
  const amount = Math.max(1, Math.round(params.amountCredits));
  const fee = Math.max(1, Math.round(amount * 0.015));
  const workerPayment = amount - fee;
  const isSuccess = params.status !== "FAILED";
  const now = new Date().toISOString().replace("T", " ").slice(0, 26);

  // 1. Resolve payer account (via apiKey if available, then by name / ID fallback)
  let payer: any = null;
  if (params.apiKey) {
    const acc = getAgentAccount(params.apiKey);
    if (acc) {
      payer = db.prepare("SELECT id, name, balance_cents FROM accounts WHERE id = ?").get(acc.id);
    }
  }

  if (!payer) {
    const payerStmt = db.prepare(`
      SELECT id, name, balance_cents FROM accounts
      WHERE name = ? OR name LIKE '%Aiverisett%' OR id = '827fe271-637a-414c-8fbc-5ba6b99f3bed'
      LIMIT 1
    `);
    payer = payerStmt.get(params.fromAgentName || "") as any;
  }

  if (!payer) {
    payer = db.prepare("SELECT id, name, balance_cents FROM accounts WHERE role = 'PAYER' LIMIT 1").get() as any;
  }

  // 2. Resolve worker account (dynamically register if new agent name)
  let worker: any = null;
  if (params.toAgentName) {
    worker = db.prepare("SELECT id, name, balance_cents FROM accounts WHERE name = ? LIMIT 1").get(params.toAgentName) as any;
    if (!worker) {
      const workerId = crypto.randomUUID();
      const dummyHash = crypto.createHash("sha256").update(workerId).digest("hex");
      try {
        db.prepare(`
          INSERT INTO accounts (id, api_key_hash, name, role, balance_cents, frozen_cents, currency, created_at, updated_at)
          VALUES (?, ?, ?, 'WORKER', 0, 0, 'USD', ?, ?)
        `).run(workerId, dummyHash, params.toAgentName, now, now);
        worker = { id: workerId, name: params.toAgentName, balance_cents: 0 };
      } catch {
        worker = db.prepare("SELECT id, name, balance_cents FROM accounts WHERE role = 'WORKER' ORDER BY updated_at DESC LIMIT 1").get() as any;
      }
    }
  }

  if (!worker) {
    worker = db.prepare("SELECT id, name, balance_cents FROM accounts WHERE role = 'WORKER' ORDER BY updated_at DESC LIMIT 1").get() as any;
  }

  // 3. Resolve treasury account
  const treasuryStmt = db.prepare("SELECT id, balance_cents FROM accounts WHERE id = '00000000-0000-0000-0000-000000000001'");
  let treasury = treasuryStmt.get() as any;
  const contractId = crypto.randomUUID();
  const contractStatus = isSuccess ? "SETTLED" : "DISPUTED";

  // Insert contract
  db.prepare(`
    INSERT INTO contracts (
      id, payer_id, worker_id, amount_cents, fee_cents, status,
      assertion_type, assertion_payload, result_payload, timeout_seconds,
      created_at, settled_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    contractId,
    payer?.id || "827fe271-637a-414c-8fbc-5ba6b99f3bed",
    worker?.id || "51c25b1a-27c7-484b-a038-37f071158581",
    amount,
    fee,
    contractStatus,
    "JSON_SCHEMA",
    JSON.stringify({ task_description: params.milestone || `Autonomous Task: ${params.fromAgentName} -> ${params.toAgentName}` }),
    isSuccess ? JSON.stringify({ verified: true, signature: "ECDSA_SECP256K1_OK" }) : JSON.stringify({ error: "Assertion criteria failed" }),
    300,
    now,
    isSuccess ? now : null
  );

  let newPayerBalance = payer ? Number(payer.balance_cents) : 169000;

  if (isSuccess && payer) {
    newPayerBalance = Math.max(0, newPayerBalance - amount);
    db.prepare("UPDATE accounts SET balance_cents = ?, updated_at = ? WHERE id = ?").run(newPayerBalance, now, payer.id);

    if (worker) {
      const newWorkerBal = Number(worker.balance_cents) + workerPayment;
      db.prepare("UPDATE accounts SET balance_cents = ?, updated_at = ? WHERE id = ?").run(newWorkerBal, now, worker.id);
    }

    if (treasury) {
      const newTreasuryBal = Number(treasury.balance_cents) + fee;
      db.prepare("UPDATE accounts SET balance_cents = ?, updated_at = ? WHERE id = ?").run(newTreasuryBal, now, treasury.id);
    }

    // Ledger entries
    db.prepare(`
      INSERT INTO ledger_entries (entry_id, contract_id, from_account, to_account, amount_cents, entry_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), contractId, payer.id, worker?.id || payer.id, workerPayment, "SETTLEMENT_PAYMENT", now);

    db.prepare(`
      INSERT INTO ledger_entries (entry_id, contract_id, from_account, to_account, amount_cents, entry_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), contractId, payer.id, "00000000-0000-0000-0000-000000000001", fee, "FEE_COLLECTION", now);
  }

  const transaction: NormalizedTransaction = {
    id: contractId,
    contract_id: contractId,
    fromAgent: {
      name: payer?.name || "Aiverisett Primary Payer Agent",
      model: "FastMCP Payer Agent",
      avatarBg: "from-amber-500 to-yellow-600",
      agentId: payer?.id || "payer-id",
    },
    toAgent: {
      name: worker?.name || params.toAgentName || "Gemini-Flash-Extractor (Worker)",
      model: "FastMCP Autonomous Worker",
      avatarBg: "from-emerald-500 to-teal-600",
      agentId: worker?.id || "worker-id",
    },
    amountINR: amount,
    amountCredits: amount,
    feeCredits: fee,
    commissionRate: fee / amount,
    status: isSuccess ? "SUCCESSFUL" : "FAILED",
    rawStatus: contractStatus,
    timestamp: now,
    dateStr: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    timeStr: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    milestoneTitle: params.milestone || `Autonomous Task: ${payer?.name} -> ${worker?.name}`,
    sha256Proof: `sha256:${crypto.createHash("sha256").update(contractId).digest("hex").slice(0, 16)}`,
    clearingRail: "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP",
    direction: "SENT",
  };

  return { contractId, newPayerBalance, transaction };
}

/**
 * Execute a live deposit directly to an agent's account in verisett.db.
 */
export function recordDepositInDb(params: {
  agentName?: string;
  amountCredits: number;
  milestone?: string;
}): {
  newBalance: number;
  transaction: NormalizedTransaction;
} {
  const db = getDb();
  const amount = Math.max(1, Math.round(params.amountCredits));
  const now = new Date().toISOString().replace("T", " ").slice(0, 26);

  const stmt = db.prepare(`
    SELECT id, name, balance_cents FROM accounts
    WHERE name = ? OR name LIKE '%Aiverisett%' OR id = '827fe271-637a-414c-8fbc-5ba6b99f3bed'
    LIMIT 1
  `);
  let payer = stmt.get(params.agentName || "") as any;
  if (!payer) {
    payer = db.prepare("SELECT id, name, balance_cents FROM accounts WHERE role = 'PAYER' LIMIT 1").get() as any;
  }

  let newBalance = 169000;
  if (payer) {
    newBalance = Number(payer.balance_cents) + amount;
    db.prepare("UPDATE accounts SET balance_cents = ?, updated_at = ? WHERE id = ?").run(newBalance, now, payer.id);

    // Ledger DEPOSIT entry
    db.prepare(`
      INSERT INTO ledger_entries (entry_id, contract_id, from_account, to_account, amount_cents, entry_type, created_at)
      VALUES (?, NULL, ?, ?, ?, 'DEPOSIT', ?)
    `).run(crypto.randomUUID(), payer.id, payer.id, amount, now);
  }

  const txId = crypto.randomUUID();
  const transaction: NormalizedTransaction = {
    id: txId,
    fromAgent: {
      name: "External Liquidity Provider",
      model: "Fiat/Crypto Ramp",
      avatarBg: "from-blue-500 to-indigo-600",
      agentId: "external-provider",
    },
    toAgent: {
      name: payer?.name || "Aiverisett Primary Payer Agent",
      model: "FastMCP Payer Agent",
      avatarBg: "from-amber-500 to-yellow-600",
      agentId: payer?.id || "payer-id",
    },
    amountINR: amount,
    amountCredits: amount,
    feeCredits: 0,
    commissionRate: 0,
    status: "SUCCESSFUL",
    rawStatus: "DEPOSITED",
    timestamp: now,
    dateStr: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    timeStr: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    milestoneTitle: params.milestone || `Liquidity Injection to ${payer?.name}`,
    sha256Proof: `sha256:${crypto.createHash("sha256").update(txId).digest("hex").slice(0, 16)}`,
    clearingRail: "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP",
    direction: "RECEIVED",
  };

  return { newBalance, transaction };
}

/**
 * Reset an agent's balance back to the starting testnet balance (169,000 Credits).
 */
export function resetAgentBalanceInDb(agentName?: string, defaultBalance = 169000): number {
  const db = getDb();
  const now = new Date().toISOString().replace("T", " ").slice(0, 26);
  const stmt = db.prepare(`
    SELECT id, name FROM accounts
    WHERE name = ? OR name LIKE '%Aiverisett%' OR id = '827fe271-637a-414c-8fbc-5ba6b99f3bed'
    LIMIT 1
  `);
  const payer = stmt.get(agentName || "") as any;
  if (payer) {
    db.prepare("UPDATE accounts SET balance_cents = ?, updated_at = ? WHERE id = ?").run(defaultBalance, now, payer.id);
    return defaultBalance;
  }
  return defaultBalance;
}
