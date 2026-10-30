/**
 * In-memory fast cache and store for Razorpay Dynamic QR payments.
 * Allows instant O(1) polling lookups and webhook reconciliation.
 */

export interface DynamicQrPaymentRecord {
  qr_id: string;
  image_url: string;
  amount: number; // in paise
  description?: string;
  customer_name?: string;
  status: "active" | "paid" | "closed";
  payment_id?: string;
  created_at: number;
  paid_at?: number;
}

// Global store across hot reloads in Next.js development
const globalQrMap = globalThis as unknown as {
  __verisett_qr_store__?: Map<string, DynamicQrPaymentRecord>;
};

if (!globalQrMap.__verisett_qr_store__) {
  globalQrMap.__verisett_qr_store__ = new Map<string, DynamicQrPaymentRecord>();
}

const qrStore = globalQrMap.__verisett_qr_store__;

export function saveQrRecord(record: DynamicQrPaymentRecord): void {
  qrStore.set(record.qr_id, record);
}

export function getQrRecord(qr_id: string): DynamicQrPaymentRecord | undefined {
  return qrStore.get(qr_id);
}

export function markQrPaid(
  qr_id: string,
  payment_id: string,
  amount?: number
): DynamicQrPaymentRecord {
  const existing = qrStore.get(qr_id);
  const updated: DynamicQrPaymentRecord = {
    qr_id,
    image_url: existing?.image_url || "",
    amount: amount || existing?.amount || 0,
    description: existing?.description,
    customer_name: existing?.customer_name,
    status: "paid",
    payment_id,
    created_at: existing?.created_at || Date.now(),
    paid_at: Date.now(),
  };

  qrStore.set(qr_id, updated);
  return updated;
}

export function getAllQrRecords(): DynamicQrPaymentRecord[] {
  return Array.from(qrStore.values());
}
