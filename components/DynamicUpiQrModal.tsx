"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

export interface DynamicUpiQrModalProps {
  amount: number; // in paise (e.g., 250000 = ₹2,500)
  customerName?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentData: {
    qr_id: string;
    payment_id: string;
    amount: number;
  }) => void;
}

export function DynamicUpiQrModal({
  amount,
  customerName = "Verisett Operator",
  description = "Settlement Node Provisioning",
  isOpen,
  onClose,
  onPaymentSuccess,
}: DynamicUpiQrModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrId, setQrId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(amount);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [paidPaymentId, setPaidPaymentId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate dynamic QR code upon modal opening
  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setQrId(null);
      setImageUrl(null);
      setIsPaid(false);
      setErrorMessage(null);
      return;
    }

    async function initQr() {
      setIsLoading(true);
      setErrorMessage(null);
      setIsPaid(false);

      try {
        const res = await fetch("/api/billing/create-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            customer_name: customerName,
            description,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.qr_id) {
          throw new Error(data.error || "Failed to create dynamic UPI QR code.");
        }

        setQrId(data.qr_id);
        setImageUrl(data.image_url);
        setPaymentAmount(data.amount || amount);
      } catch (err: any) {
        setErrorMessage(err?.message || "Failed to generate dynamic UPI QR code.");
      } finally {
        setIsLoading(false);
      }
    }

    initQr();
  }, [isOpen, amount, customerName, description]);

  // Real-time Polling for Webhook / Razorpay Settlement status
  useEffect(() => {
    if (!qrId || isPaid) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        setPollCount((prev) => prev + 1);
        const res = await fetch(`/api/billing/check-status?qr_id=${encodeURIComponent(qrId)}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.status === "paid") {
          setIsPaid(true);
          setPaidPaymentId(data.payment_id || `pay_${qrId}`);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

          // Notify parent callback after short celebratory pause
          setTimeout(() => {
            onPaymentSuccess({
              qr_id: qrId,
              payment_id: data.payment_id || `pay_${qrId}`,
              amount: data.amount || paymentAmount,
            });
          }, 1200);
        }
      } catch (pollErr) {
        // Non-fatal polling error
        console.warn("[DYNAMIC_QR_POLL_NOTICE]:", pollErr);
      }
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [qrId, isPaid, paymentAmount, onPaymentSuccess]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!imageUrl) return;
    navigator.clipboard.writeText(imageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-md rounded-[20px] bg-white border border-[#E2E8F0] p-6 sm:p-7 text-[#0F172A] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)] relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-[8px] border border-[#CBD5E1] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition cursor-pointer shadow-2xs"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pb-4 border-b border-[#E2E8F0]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-[11px] font-mono uppercase text-[#2563EB] font-bold">
            <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Razorpay Dynamic UPI QR</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Real-Time UPI Settlement
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Single-use cryptographic QR code with automatic webhook verification.
          </p>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4">
          {isLoading ? (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#2563EB]" />
              <p className="text-xs font-mono text-[#64748B]">
                Generating Razorpay single-use UPI QR...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-[12px] border border-rose-200 bg-rose-50 text-rose-800 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>QR Generation Error</span>
              </div>
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setIsLoading(true);
                  // Trigger re-mount
                  setQrId(null);
                }}
                className="mt-2 px-3 py-1.5 rounded-[8px] bg-rose-600 text-white font-semibold flex items-center gap-1.5 hover:bg-rose-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : isPaid ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-[#0F172A]">
                  Payment Verified!
                </h4>
                <p className="text-xs text-[#64748B] font-mono">
                  Webhook captured &amp; settlement verified in real-time.
                </p>
              </div>
              <div className="p-3 rounded-[10px] bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-mono text-[#334155] space-y-1">
                <div>Payment ID: <strong className="text-emerald-700">{paidPaymentId}</strong></div>
                <div>Amount: <strong>₹{(paymentAmount / 100).toLocaleString()}</strong></div>
              </div>
            </div>
          ) : (
            /* Active QR State */
            <div className="space-y-4">
              {/* QR Image Box */}
              <div className="p-4 rounded-[16px] border border-[#CBD5E1] bg-gradient-to-b from-[#F8FAFC] to-white flex flex-col items-center justify-center text-center shadow-xs">
                {imageUrl ? (
                  <div className="p-2.5 bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm inline-block">
                    <img
                      src={imageUrl}
                      alt="Razorpay Dynamic UPI QR"
                      className="w-56 h-56 object-contain rounded-[8px]"
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-[#F1F5F9] rounded-[12px] border border-dashed border-[#CBD5E1]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#64748B]" />
                  </div>
                )}

                {/* Amount Callout */}
                <div className="mt-3 space-y-0.5">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                    Exact Amount to Pay
                  </div>
                  <div className="text-3xl font-extrabold tracking-tight text-[#2563EB] font-sans">
                    ₹{(paymentAmount / 100).toLocaleString()}
                  </div>
                </div>

                {/* Live Waiting Status Pill */}
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Waiting for UPI payment...</span>
                </div>
              </div>

              {/* Instructional message */}
              <div className="p-3.5 rounded-[12px] border border-blue-100 bg-blue-50/70 text-xs text-[#334155] space-y-1">
                <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#2563EB]" />
                  <span>How to complete payment:</span>
                </div>
                <p className="leading-relaxed text-[#475569]">
                  Scan with <strong>GPay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or any UPI app.
                  The modal will automatically advance upon real-time webhook confirmation.
                </p>
              </div>

              {/* Secondary link / copy */}
              {imageUrl && (
                <div className="flex items-center justify-between text-xs font-mono text-[#64748B] pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#0F172A] transition"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied URL</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy QR Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#2563EB] hover:underline"
                  >
                    <span>Open Raw QR</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Webhook Settlement</span>
          </div>
          <span>Refreshes every 2.5s</span>
        </div>
      </div>
    </div>
  );
}
