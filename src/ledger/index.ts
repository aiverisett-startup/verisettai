/**
 * Verisett AI — High-Integrity Double-Entry Accounting Ledger
 * Implements strict integer cents arithmetic, zero-sum balancing invariants,
 * and SHA-256 state hash chaining for immutable audit logging.
 */

import crypto from "crypto";
import {
  AccountType,
  EntryDirection,
  LedgerEntry,
  LedgerTransaction,
} from "../types";

export class DoubleEntryLedger {
  private transactions: LedgerTransaction[] = [];
  private lastTxHash: string = "0000000000000000000000000000000000000000000000000000000000000000";

  /**
   * Enforce positive integer cents invariant
   */
  private assertIntegerCents(cents: number, context: string): void {
    if (!Number.isInteger(cents) || cents <= 0) {
      throw new Error(
        `[Ledger Invariant Violation] ${context}: Amount must be a positive integer cents value. Received: ${cents}`
      );
    }
  }

  /**
   * Compute deterministic SHA-256 transaction hash forming a cryptographic hash chain
   */
  private computeTransactionHash(
    txId: string,
    vaultId: string,
    action: string,
    entries: LedgerEntry[],
    prevHash: string,
    timestamp: number
  ): string {
    const canonicalPayload = JSON.stringify({
      txId,
      vaultId,
      action,
      entries: entries.map((e) => ({
        account: e.account_id,
        type: e.account_type,
        direction: e.direction,
        amount: e.amount_cents,
      })),
      prevHash,
      timestamp,
    });

    return crypto.createHash("sha256").update(canonicalPayload).digest("hex");
  }

  /**
   * Commit a balanced double-entry transaction
   * Invariant: Total DEBITS === Total CREDITS
   */
  private commitTransaction(
    vaultId: string,
    action: LedgerTransaction["action"],
    entries: Omit<LedgerEntry, "id" | "tx_id" | "timestamp">[]
  ): LedgerTransaction {
    const timestamp = Date.now();
    const txId = `tx_${timestamp}_${crypto.randomBytes(4).toString("hex")}`;

    let totalDebits = 0;
    let totalCredits = 0;

    const fullEntries: LedgerEntry[] = entries.map((e, index) => {
      this.assertIntegerCents(e.amount_cents, `Entry #${index} [${e.account_id}]`);

      if (e.direction === "DEBIT") {
        totalDebits += e.amount_cents;
      } else {
        totalCredits += e.amount_cents;
      }

      return {
        id: `entry_${txId}_${index}`,
        tx_id: txId,
        account_id: e.account_id,
        account_type: e.account_type,
        direction: e.direction,
        amount_cents: e.amount_cents,
        timestamp,
      };
    });

    // STRICT DOUBLE-ENTRY INVARIANT: Sum(Debits) === Sum(Credits)
    if (totalDebits !== totalCredits) {
      throw new Error(
        `[Ledger Balance Invariant Violation] Unbalanced transaction: Debits (${totalDebits} cents) != Credits (${totalCredits} cents)`
      );
    }

    const txHash = this.computeTransactionHash(
      txId,
      vaultId,
      action,
      fullEntries,
      this.lastTxHash,
      timestamp
    );

    const tx: LedgerTransaction = {
      tx_id: txId,
      tx_hash: txHash,
      vault_id: vaultId,
      action,
      entries: fullEntries,
      total_debit_cents: totalDebits,
      total_credit_cents: totalCredits,
      prev_hash: this.lastTxHash,
      timestamp,
    };

    this.transactions.push(tx);
    this.lastTxHash = txHash;
    return tx;
  }

  /**
   * 1. Record Vault Lock
   * DEBIT Buyer Balance / CREDIT Escrow Vault
   */
  recordVaultLock(
    vaultId: string,
    buyerAgentId: string,
    amountCents: number
  ): LedgerTransaction {
    this.assertIntegerCents(amountCents, "recordVaultLock");

    return this.commitTransaction(vaultId, "VAULT_LOCKED", [
      {
        account_id: `buyer:${buyerAgentId}`,
        account_type: "BUYER_BALANCE",
        direction: "DEBIT",
        amount_cents: amountCents,
      },
      {
        account_id: `vault:${vaultId}`,
        account_type: "ESCROW_VAULT",
        direction: "CREDIT",
        amount_cents: amountCents,
      },
    ]);
  }

  /**
   * 2. Record Vault Settlement
   * Balancing Entries:
   *   - DEBIT Escrow Vault / CREDIT Seller Balance (Payout: 98.5%)
   *   - DEBIT Escrow Vault / CREDIT Platform Fee Account (Fee: 1.5%)
   */
  recordVaultSettlement(
    vaultId: string,
    sellerAgentId: string,
    amountCents: number,
    feeCents: number,
    payoutCents: number
  ): LedgerTransaction {
    this.assertIntegerCents(amountCents, "recordVaultSettlement:amount");
    this.assertIntegerCents(payoutCents, "recordVaultSettlement:payout");

    if (payoutCents + feeCents !== amountCents) {
      throw new Error(
        `[Ledger Invariant Violation] Settlement math discrepancy: Payout (${payoutCents}) + Fee (${feeCents}) != Gross Amount (${amountCents})`
      );
    }

    const entries: Omit<LedgerEntry, "id" | "tx_id" | "timestamp">[] = [
      // 1. Principal Seller Payout
      {
        account_id: `vault:${vaultId}`,
        account_type: "ESCROW_VAULT",
        direction: "DEBIT",
        amount_cents: payoutCents,
      },
      {
        account_id: `seller:${sellerAgentId}`,
        account_type: "SELLER_BALANCE",
        direction: "CREDIT",
        amount_cents: payoutCents,
      },
    ];

    // 2. Protocol Platform Fee Entry (1.5%)
    if (feeCents > 0) {
      entries.push(
        {
          account_id: `vault:${vaultId}`,
          account_type: "ESCROW_VAULT",
          direction: "DEBIT",
          amount_cents: feeCents,
        },
        {
          account_id: "account:platform:fees",
          account_type: "PLATFORM_FEE_ACCOUNT",
          direction: "CREDIT",
          amount_cents: feeCents,
        }
      );
    }

    return this.commitTransaction(vaultId, "VAULT_SETTLED", entries);
  }

  /**
   * 3. Record Timeout Clawback (Refund)
   * DEBIT Escrow Vault / CREDIT Buyer Balance (Zero platform fee)
   */
  recordVaultRefund(
    vaultId: string,
    buyerAgentId: string,
    amountCents: number
  ): LedgerTransaction {
    this.assertIntegerCents(amountCents, "recordVaultRefund");

    return this.commitTransaction(vaultId, "VAULT_REFUNDED", [
      {
        account_id: `vault:${vaultId}`,
        account_type: "ESCROW_VAULT",
        direction: "DEBIT",
        amount_cents: amountCents,
      },
      {
        account_id: `buyer:${buyerAgentId}`,
        account_type: "BUYER_BALANCE",
        direction: "CREDIT",
        amount_cents: amountCents,
      },
    ]);
  }

  /**
   * Calculate current balance of any ledger account from immutable journal entries
   */
  getAccountLedgerBalance(accountId: string): number {
    let balance = 0;
    for (const tx of this.transactions) {
      for (const entry of tx.entries) {
        if (entry.account_id === accountId) {
          if (entry.direction === "CREDIT") {
            balance += entry.amount_cents;
          } else {
            balance -= entry.amount_cents;
          }
        }
      }
    }
    return balance;
  }

  /**
   * Fetch complete audit trail for a specific vault
   */
  getVaultAuditTrail(vaultId: string): LedgerTransaction[] {
    return this.transactions.filter((tx) => tx.vault_id === vaultId);
  }

  /**
   * Verify integrity of the entire cryptographic hash chain
   */
  verifyChainIntegrity(): { valid: boolean; transactionsChecked: number } {
    let currentPrev = "0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < this.transactions.length; i++) {
      const tx = this.transactions[i];
      if (tx.prev_hash !== currentPrev) {
        return { valid: false, transactionsChecked: i };
      }

      const recomputed = this.computeTransactionHash(
        tx.tx_id,
        tx.vault_id,
        tx.action,
        tx.entries,
        tx.prev_hash,
        tx.timestamp
      );

      if (recomputed !== tx.tx_hash) {
        return { valid: false, transactionsChecked: i };
      }

      currentPrev = tx.tx_hash;
    }

    return { valid: true, transactionsChecked: this.transactions.length };
  }

  getAllTransactions(): LedgerTransaction[] {
    return [...this.transactions];
  }

  clear(): void {
    this.transactions = [];
    this.lastTxHash = "0000000000000000000000000000000000000000000000000000000000000000";
  }
}

// Global Ledger Instance
export const globalLedger = new DoubleEntryLedger();
