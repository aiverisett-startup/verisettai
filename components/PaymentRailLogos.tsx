"use client";

import React from "react";

export function UpiLogo({ className = "h-5 max-h-[24px] w-auto max-w-[80px] object-contain shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* UPI Dual Arrows */}
      <path d="M10 24L20 8H14L4 24H10Z" fill="#097939" />
      <path d="M19 24L29 8H23L13 24H19Z" fill="#ED752E" />
      {/* Text UPI */}
      <path d="M35 9V19C35 21.2 36.8 23 39 23H43C45.2 23 47 21.2 47 19V9H42.5V18.5C42.5 18.8 42.3 19 42 19H40C39.7 19 39.5 18.8 39.5 18.5V9H35Z" fill="#0F172A" />
      <path d="M51 9V23H55.5V18H58.5C61.3 18 63.5 16 63.5 13.5C63.5 11 61.3 9 58.5 9H51ZM55.5 14V12.5H58.5C59.3 12.5 60 13 60 13.25C60 13.5 59.3 14 58.5 14H55.5Z" fill="#0F172A" />
      <path d="M68 9V23H72.5V9H68Z" fill="#0F172A" />
    </svg>
  );
}

export function GPayLogo({ className = "h-5 max-h-[24px] w-auto max-w-[80px] object-contain shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Google G */}
      <path d="M20 15.2C20 14.5 19.9 13.9 19.8 13.3H11.5V16.8H16.3C16.1 17.8 15.5 18.7 14.6 19.3V21.4H17.3C18.9 19.9 20 17.7 20 15.2Z" fill="#4285F4" />
      <path d="M11.5 23.8C13.9 23.8 15.9 23 17.3 21.4L14.6 19.3C13.8 19.8 12.8 20.2 11.5 20.2C9.2 20.2 7.2 18.6 6.5 16.5H3.7V18.7C5.2 21.7 8.1 23.8 11.5 23.8Z" fill="#34A853" />
      <path d="M6.5 16.5C6.3 15.8 6.2 15.1 6.2 14.4C6.2 13.7 6.3 13 6.5 12.3V10.1H3.7C3.1 11.4 2.8 12.9 2.8 14.4C2.8 15.9 3.1 17.4 3.7 18.7L6.5 16.5Z" fill="#FBBC04" />
      <path d="M11.5 8.6C12.8 8.6 14 9 14.9 9.9L17.4 7.4C15.8 5.9 13.8 5 11.5 5C8.1 5 5.2 7.1 3.7 10.1L6.5 12.3C7.2 10.2 9.2 8.6 11.5 8.6Z" fill="#EA4335" />
      {/* Text Pay */}
      <path d="M30 9H35.5C37.5 9 39 10.5 39 12.5C39 14.5 37.5 16 35.5 16H32.2V20H30V9ZM32.2 14H35.3C36.2 14 36.8 13.3 36.8 12.5C36.8 11.7 36.2 11 35.3 11H32.2V14Z" fill="#0F172A" />
      <path d="M44.5 12.5C46 12.5 47.2 13 48 13.8C48.8 14.6 49.2 15.7 49.2 17V20H47.1V18.6C46.3 19.7 45.2 20.2 43.8 20.2C42.6 20.2 41.7 19.9 41 19.2C40.3 18.5 40 17.6 40 16.5C40 15.4 40.4 14.5 41.2 13.8C42 13.1 43.1 12.8 44.5 12.8C45.7 12.8 46.6 13 47.1 13.4V13C47.1 12.3 46.8 11.8 46.3 11.4C45.8 11 45.2 10.8 44.5 10.8C43.5 10.8 42.7 11.2 42.2 12.1L40.4 11C41.4 9.6 42.8 8.9 44.5 8.9V12.5ZM42.2 16.6C42.2 17.1 42.4 17.6 42.8 17.9C43.2 18.3 43.8 18.5 44.4 18.5C45.3 18.5 46 18.1 46.6 17.5C47.2 16.9 47.5 16.2 47.5 15.3C47 14.8 46.2 14.6 45.1 14.6C44.3 14.6 43.6 14.8 43 15.2C42.5 15.6 42.2 16 42.2 16.6Z" fill="#0F172A" />
      <path d="M59 13L54.5 23H52.2L54 19.2L50.5 13H52.8L55.1 17.2L57.4 13H59Z" fill="#0F172A" />
    </svg>
  );
}

export function PhonePeLogo({ className = "h-5 max-h-[24px] w-auto max-w-[82px] object-contain shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Crisp Purple Circle */}
      <circle cx="16" cy="16" r="12" fill="#6739B7" />
      <path d="M13 10H19V12.5H16.5V15.2C17.8 15.2 18.8 16.2 18.8 17.5C18.8 18.8 17.8 19.8 16.5 19.8H15.2V22H13V10ZM15.2 17.8H16.5C17 17.8 17.4 17.4 17.4 16.9C17.4 16.4 17 16 16.5 16H15.2V17.8Z" fill="#FFFFFF" />
      <path d="M16.8 12.5H19.5C20.8 12.5 21.6 13.3 21.6 14.5V22H19.5V15C19.5 14.6 19.1 14.2 18.7 14.2H16.8V12.5Z" fill="#FFFFFF" />
      {/* High-Contrast Crisp PhonePe Label */}
      <text x="34" y="21" fill="#0F172A" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="13.5" letterSpacing="-0.2">PhonePe</text>
    </svg>
  );
}

export function PaytmLogo({ className = "h-5 max-h-[24px] w-auto max-w-[80px] object-contain shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 84 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Dark Navy "Pay" */}
      <path d="M9 6H3V22H6.5V16.5H9C12 16.5 14 14.5 14 11.25C14 8 12 6 9 6ZM9 13.5H6.5V9.5H9C10.2 9.5 11 10.2 11 11.25C11 12.3 10.2 13.5 9 13.5Z" fill="#002970" />
      <path d="M19 10.5C17 10.5 15.5 12 15.5 14C15.5 16 17 17.5 19 17.5C20.2 17.5 21 17 21.5 16.2V17.5H24.5V10.5H21.5V11.8C21 11 20.2 10.5 19 10.5ZM20 15C19 15 18.3 14.3 18.3 13.7C18.3 13.1 19 12.5 20 12.5C21 12.5 21.7 13.1 21.7 13.7C21.7 14.3 21 15 20 15Z" fill="#002970" />
      <path d="M30 11L27 18.5L26.5 17.5L28.2 13.8L25.5 11H28.8L30 13.5L31.5 11H34.8L31.2 16.5L30 21H27.5L28.5 17.2L30 11Z" fill="#002970" />
      {/* Bright Cyan "tm" */}
      <path d="M38 8H44V10.5H42.2V22H39.8V10.5H38V8Z" fill="#00BAF2" />
      <path d="M46 10.5H48.5V11.8C49 11 49.8 10.5 50.8 10.5C51.5 10.5 52.2 10.8 52.6 11.5C53.2 10.8 54 10.5 54.8 10.5C56 10.5 57 11.3 57 13V22H54.6V14C54.6 13.6 54.2 13.2 53.8 13.2C53.4 13.2 53 13.6 53 14V22H50.6V14C50.6 13.6 50.2 13.2 49.8 13.2C49.4 13.2 49 13.6 49 14V22H46V10.5Z" fill="#00BAF2" />
    </svg>
  );
}

export function VisaLogo({ className = "h-5 max-h-[24px] w-auto max-w-[70px] object-contain shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M28.4 2.8L18.6 21.2H12.2L7.4 6.8C7.1 5.7 6.9 5.3 6 4.8C4.5 4 2.1 3.3 0 2.8L0.2 2H10.6C12 2 13.2 2.9 13.5 4.5L16.1 16.5L22.2 2.8H28.4ZM53.4 15.2C53.4 9.4 45.4 9.1 45.4 6.5C45.4 5.6 46.3 4.6 48.2 4.4C49.1 4.3 51.7 4.2 54.5 5.5L55.6 1.1C54.1 0.5 52.2 0 49.8 0C43.7 0 39.4 3.2 39.4 7.8C39.4 14.8 49.2 15.2 49.2 19.3C49.2 20.6 48 21.6 45.7 21.6C42.8 21.6 39.9 20.3 38.3 19.5L37.1 24.1C38.8 24.9 42 25.6 45.2 25.6C51.6 25.6 56 22.4 56 17.5C56 16.7 54.8 15.8 53.4 15.2ZM69.5 21.2H74.8L70.2 2.8H65.3C64.2 2.8 63.3 3.4 62.9 4.4L53.8 21.2H59.8L61 17.8H68.3L69.5 21.2ZM62.7 13.2L65.6 5.3L67.3 13.2H62.7ZM38.4 2.8L33.7 21.2H28.1L32.8 2.8H38.4Z" fill="#1434CB" />
    </svg>
  );
}

export function MastercardLogo({ className = "h-5.5 max-h-[26px] w-auto max-w-[48px] object-contain shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="17" cy="16" r="14" fill="#EB001B" />
      <circle cx="33" cy="16" r="14" fill="#F79E1B" fillOpacity="0.88" />
    </svg>
  );
}

export function RupayLogo({ className = "h-5 max-h-[24px] w-auto max-w-[80px] object-contain shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 22L19 4H13L6 22H12Z" fill="#097939" />
      <path d="M21 22L28 4H22L15 22H21Z" fill="#ED752E" />
      <path d="M30 22L37 4H31L24 22H30Z" fill="#0088CC" />
      <text x="40" y="19" fill="#0F172A" fontFamily="sans-serif" fontWeight="900" fontSize="15" letterSpacing="-0.5">RuPay</text>
    </svg>
  );
}

export function AcceptedPaymentRailsStrip({ variant = "light" }: { variant?: "light" | "dark" }) {
  const containerClass =
    variant === "light"
      ? "min-w-[96px] w-full h-11 sm:h-12 px-3 py-1.5 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-xs hover:border-blue-400 transition-all"
      : "min-w-[96px] w-full h-11 sm:h-12 px-3 py-1.5 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl grayscale hover:grayscale-0 transition-all duration-200 hover:border-blue-500 hover:bg-zinc-850";

  return (
    <div className="space-y-2.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
        Accepted Payment Rails
      </span>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {/* UPI */}
        <div title="UPI (Unified Payments Interface)" className={containerClass}>
          <UpiLogo />
        </div>

        {/* Google Pay */}
        <div title="Google Pay" className={containerClass}>
          <GPayLogo />
        </div>

        {/* PhonePe */}
        <div title="PhonePe" className={containerClass}>
          <PhonePeLogo />
        </div>

        {/* Paytm */}
        <div title="Paytm" className={containerClass}>
          <PaytmLogo />
        </div>

        {/* Visa */}
        <div title="Visa" className={containerClass}>
          <VisaLogo />
        </div>

        {/* Mastercard */}
        <div title="Mastercard" className={containerClass}>
          <MastercardLogo />
        </div>
      </div>
    </div>
  );
}
