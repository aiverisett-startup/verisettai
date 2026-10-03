/**
 * Verisett AI — State & Distributed Concurrency Storage
 * Implements Redis distributed locking (SET NX PX) and fast in-memory vault caching
 * with a zero-dependency in-memory fallback for local dev & testing.
 */

import crypto from "crypto";
import { Vault } from "../types";

export interface IVaultStorage {
  getVault(vaultId: string): Promise<Vault | null>;
  saveVault(vault: Vault): Promise<void>;
  acquireLock(lockKey: string, ttlMs?: number): Promise<string | null>;
  releaseLock(lockKey: string, token: string): Promise<boolean>;
  getAccountBalance(accountId: string): Promise<number>;
  setAccountBalance(accountId: string, amountCents: number): Promise<void>;
  deductAccountBalance(accountId: string, amountCents: number): Promise<boolean>;
  creditAccountBalance(accountId: string, amountCents: number): Promise<number>;
  close(): Promise<void>;
}

// ---------------------------------------------------------------------------
// In-Memory Vault & Distributed Lock Storage (Zero-Latency Test Harness / Dev)
// ---------------------------------------------------------------------------

interface MemoryLockEntry {
  token: string;
  expiresAt: number;
}

export class MemoryVaultStorage implements IVaultStorage {
  private vaults = new Map<string, Vault>();
  private locks = new Map<string, MemoryLockEntry>();
  private balances = new Map<string, number>();

  constructor() {
    // Seed default testnet liquidity accounts
    this.balances.set("agent:buyer:primary", 1_000_000); // 10,000 VRS / $10,000.00
    this.balances.set("agent:buyer:default", 500_000);   // 5,000 VRS
    this.balances.set("agent:seller:primary", 0);
    this.balances.set("account:platform:fees", 0);
  }

  async getVault(vaultId: string): Promise<Vault | null> {
    const v = this.vaults.get(vaultId);
    return v ? { ...v } : null;
  }

  async saveVault(vault: Vault): Promise<void> {
    this.vaults.set(vault.vault_id, { ...vault });
  }

  /**
   * Distributed Lock Acquisition: Atomic SET NX PX equivalent
   * Returns token on success, null if lock is currently held.
   */
  async acquireLock(lockKey: string, ttlMs: number = 3000): Promise<string | null> {
    const now = Date.now();
    const existing = this.locks.get(lockKey);

    if (existing && existing.expiresAt > now) {
      return null; // Lock is currently held by another worker
    }

    const token = crypto.randomUUID();
    this.locks.set(lockKey, {
      token,
      expiresAt: now + ttlMs,
    });
    return token;
  }

  /**
   * Distributed Lock Release: Atomic check-and-delete
   */
  async releaseLock(lockKey: string, token: string): Promise<boolean> {
    const existing = this.locks.get(lockKey);
    if (!existing) return true; // Already expired

    if (existing.token === token) {
      this.locks.delete(lockKey);
      return true;
    }
    return false; // Token mismatch: lock stolen or renewed by someone else
  }

  async getAccountBalance(accountId: string): Promise<number> {
    return this.balances.get(accountId) ?? 0;
  }

  async setAccountBalance(accountId: string, amountCents: number): Promise<void> {
    this.balances.set(accountId, Math.max(0, Math.floor(amountCents)));
  }

  async deductAccountBalance(accountId: string, amountCents: number): Promise<boolean> {
    const current = await this.getAccountBalance(accountId);
    if (current < amountCents) return false;
    this.balances.set(accountId, current - amountCents);
    return true;
  }

  async creditAccountBalance(accountId: string, amountCents: number): Promise<number> {
    const current = await this.getAccountBalance(accountId);
    const updated = current + amountCents;
    this.balances.set(accountId, updated);
    return updated;
  }

  async close(): Promise<void> {
    this.vaults.clear();
    this.locks.clear();
  }
}

// ---------------------------------------------------------------------------
// Production Redis Storage Implementation (ioredis)
// ---------------------------------------------------------------------------

export class RedisVaultStorage implements IVaultStorage {
  private client: any;
  private readonly keyPrefix: string = "verisett:";

  constructor(redisClient: any) {
    this.client = redisClient;
  }

  private vKey(vaultId: string): string {
    return `${this.keyPrefix}vault:${vaultId}`;
  }

  private balKey(accountId: string): string {
    return `${this.keyPrefix}balance:${accountId}`;
  }

  async getVault(vaultId: string): Promise<Vault | null> {
    const raw = await this.client.get(this.vKey(vaultId));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async saveVault(vault: Vault): Promise<void> {
    const ttlSeconds = Math.max(60, Math.ceil((vault.expires_at - Date.now()) / 1000) + 86400);
    await this.client.set(this.vKey(vault.vault_id), JSON.stringify(vault), "EX", ttlSeconds);
  }

  async acquireLock(lockKey: string, ttlMs: number = 3000): Promise<string | null> {
    const token = crypto.randomUUID();
    const result = await this.client.set(
      `${this.keyPrefix}${lockKey}`,
      token,
      "PX",
      ttlMs,
      "NX"
    );
    return result === "OK" ? token : null;
  }

  async releaseLock(lockKey: string, token: string): Promise<boolean> {
    // Lua script for atomic check-and-delete
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const res = await this.client.eval(luaScript, 1, `${this.keyPrefix}${lockKey}`, token);
    return res === 1;
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const raw = await this.client.get(this.balKey(accountId));
    return raw ? parseInt(raw, 10) : 0;
  }

  async setAccountBalance(accountId: string, amountCents: number): Promise<void> {
    await this.client.set(this.balKey(accountId), amountCents.toString());
  }

  async deductAccountBalance(accountId: string, amountCents: number): Promise<boolean> {
    // Atomic check-and-debit via Lua
    const luaScript = `
      local bal = tonumber(redis.call("get", KEYS[1]) or "0")
      local deduction = tonumber(ARGV[1])
      if bal >= deduction then
        redis.call("decrby", KEYS[1], deduction)
        return 1
      else
        return 0
      end
    `;
    const res = await this.client.eval(luaScript, 1, this.balKey(accountId), amountCents.toString());
    return res === 1;
  }

  async creditAccountBalance(accountId: string, amountCents: number): Promise<number> {
    return await this.client.incrby(this.balKey(accountId), amountCents);
  }

  async close(): Promise<void> {
    if (typeof this.client.quit === "function") {
      await this.client.quit();
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton Storage Factory
// ---------------------------------------------------------------------------

let activeStorage: IVaultStorage | null = null;

export function getVaultStorage(): IVaultStorage {
  if (activeStorage) return activeStorage;

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      // Attempt dynamic loading of ioredis if configured
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require("ioredis");
      const client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      activeStorage = new RedisVaultStorage(client);
      return activeStorage;
    } catch {
      // Fall through to in-memory on module absence or connection issue
    }
  }

  activeStorage = new MemoryVaultStorage();
  return activeStorage;
}

export function resetVaultStorage(): void {
  activeStorage = new MemoryVaultStorage();
}
