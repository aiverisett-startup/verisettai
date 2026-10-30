"use client";

import React, { useState } from "react";
import { QrCode, ArrowRight, ShieldCheck } from "lucide-react";
import { DynamicUpiQrModal } from "./DynamicUpiQrModal";

export interface PayViaUpiQrButtonProps {
  amount: number; // in paise (e.g. 250000 = ₹2,500)
  customerName?: string;
  description?: string;
  className?: string;
  buttonText?: string;
  onPaymentSuccess?: (paymentData: {
    qr_id: string;
    payment_id: string;
    amount: number;
  }) => void;
}

export function PayViaUpiQrButton({
  amount,
  customerName = "Verisett Operator",
  description = "Settlement Node Provisioning",
  className = "",
  buttonText = "Pay via UPI QR",
  onPaymentSuccess,
}: PayViaUpiQrButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultClasses =
    "w-full bg-[#0F172A] hover:bg-slate-800 text-white px-6 py-3.5 rounded-[12px] font-semibold text-sm shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || defaultClasses}
      >
        <QrCode className="w-4 h-4 text-emerald-400" />
        <span>{buttonText}</span>
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </button>

      <DynamicUpiQrModal
        amount={amount}
        customerName={customerName}
        description={description}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPaymentSuccess={(data) => {
          setIsOpen(false);
          onPaymentSuccess?.(data);
        }}
      />
    </>
  );
}
