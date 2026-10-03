"use client";

import React, { useState } from "react";
import { PlusCircle, Shield, ArrowRight, DollarSign, CheckCircle2, Lock, X } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amountCents: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(25000); // $250.00 USD
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalAmountCents = customAmount
      ? Math.round(parseFloat(customAmount) * 100)
      : selectedAmount;

    if (isNaN(finalAmountCents) || finalAmountCents <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      onDeposit(finalAmountCents);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCustomAmount("");
        onClose();
      }, 1200);
    }, 600);
  };

  const presetOptions = [
    { label: "$50", cents: 5000 },
    { label: "$250", cents: 25000 },
    { label: "$500", cents: 50000 },
    { label: "$1,000", cents: 100000 },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#09090B] p-6 md:p-8 shadow-[0_16px_48px_rgba(37,99,235,0.15)] relative overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base tracking-tight">Fund Escrow Vault</h3>
              <p className="text-xs text-slate-400">Simulate Sandbox Deposit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-white">Escrow Deposit Confirmed</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Vault balance updated with instant double-entry ledger allocation.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <p className="text-xs text-slate-400 leading-relaxed">
              Select an agent vault deposit preset or enter a custom amount to fund your escrow vault.
            </p>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {presetOptions.map((opt) => (
                <button
                  key={opt.cents}
                  onClick={() => {
                    setSelectedAmount(opt.cents);
                    setCustomAmount("");
                  }}
                  className={`rounded-xl border py-2.5 text-xs font-medium font-mono transition-all cursor-pointer ${
                    !customAmount && selectedAmount === opt.cents
                      ? "border-blue-500 bg-blue-600/10 text-blue-400 font-semibold shadow-xs"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-blue-500/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Or enter custom amount (USD):</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:outline-none font-mono transition-colors"
                />
              </div>
            </div>

            {/* Invariant Note */}
            <div className="rounded-xl bg-blue-950/20 border border-blue-900/30 p-3 text-xs text-slate-400 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Simulated funds are protected by row-level isolation and will reflect across all milestone contracts.
              </span>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full minimal-btn-primary py-3 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? "Allocating Vault Reserve..." : "Confirm Vault Deposit"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
