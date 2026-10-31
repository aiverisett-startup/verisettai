"use client";

import React from "react";

export function UpiLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* UPI Dual Arrows */}
      <path d="M12 28L24 8H16L8 28H12Z" fill="#097939" />
      <path d="M22 28L34 8H26L18 28H22Z" fill="#ED752E" />
      {/* Text UPI */}
      <path d="M42 12V22C42 24.2 43.8 26 46 26H50C52.2 26 54 24.2 54 22V12H49V21.5C49 21.8 48.8 22 48.5 22H47.5C47.2 22 47 21.8 47 21.5V12H42Z" fill="currentColor" />
      <path d="M58 12V26H63V21H66C68.8 21 71 19 71 16.5C71 14 68.8 12 66 12H58ZM63 17V15.5H66C66.8 15.5 67.5 16 67.5 16.25C67.5 16.5 66.8 17 66 17H63Z" fill="currentColor" />
      <path d="M75 12V26H80V12H75Z" fill="currentColor" />
    </svg>
  );
}

export function GPayLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Google G */}
      <path d="M24 20.2C24 19.5 23.9 18.8 23.8 18.2H14V22.2H19.6C19.4 23.4 18.7 24.5 17.6 25.2V27.7H20.8C22.7 25.9 23.8 23.3 23.8 20.2H24Z" fill="#4285F4" />
      <path d="M14 30.5C16.8 30.5 19.2 29.5 20.9 27.7L17.7 25.2C16.8 25.8 15.5 26.3 14 26.3C11.2 26.3 8.9 24.4 8 21.9H4.6V24.5C6.4 28 10 30.5 14 30.5Z" fill="#34A853" />
      <path d="M8 21.9C7.8 21.1 7.6 20.3 7.6 19.5C7.6 18.7 7.8 17.9 8 17.1V14.5H4.6C3.9 16 3.5 17.7 3.5 19.5C3.5 21.3 3.9 23 4.6 24.5L8 21.9Z" fill="#FBBC04" />
      <path d="M14 12.7C15.6 12.7 17 13.2 18.1 14.3L21 11.4C19.2 9.7 16.8 8.5 14 8.5C10 8.5 6.4 11 4.6 14.5L8 17.1C8.9 14.6 11.2 12.7 14 12.7Z" fill="#EA4335" />
      {/* Text Pay */}
      <path d="M36 14H42C44.2 14 46 15.8 46 18C46 20.2 44.2 22 42 22H38.5V26H36V14ZM38.5 19.8H41.8C42.8 19.8 43.6 19 43.6 18C43.6 17 42.8 16.2 41.8 16.2H38.5V19.8Z" fill="currentColor" />
      <path d="M52.5 17.5C54.2 17.5 55.5 18 56.4 18.8C57.3 19.6 57.8 20.8 57.8 22.2V26H55.4V24.4H55.3C54.4 25.7 53.1 26.3 51.6 26.3C50.3 26.3 49.3 25.9 48.5 25.1C47.7 24.3 47.3 23.3 47.3 22.1C47.3 20.9 47.7 19.9 48.6 19.1C49.5 18.3 50.8 17.9 52.3 17.9C53.7 17.9 54.7 18.2 55.4 18.6V18.1C55.4 17.3 55.1 16.7 54.5 16.2C53.9 15.7 53.2 15.5 52.4 15.5C51.2 15.5 50.3 16 49.7 17L47.7 15.8C48.8 14.3 50.4 13.5 52.5 13.5V17.5ZM49.8 22.2C49.8 22.8 50 23.3 50.5 23.7C51 24.1 51.6 24.3 52.3 24.3C53.3 24.3 54.1 23.9 54.8 23.2C55.5 22.5 55.8 21.7 55.8 20.7C55.2 20.2 54.3 20 53.1 20C52.2 20 51.4 20.2 50.8 20.7C50.1 21.1 49.8 21.6 49.8 22.2Z" fill="currentColor" />
      <path d="M68.5 18L63.5 29.5H61L63 25L59 18H61.6L64.2 22.8L66.8 18H68.5Z" fill="currentColor" />
    </svg>
  );
}

export function PhonePeLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* PhonePe Purple Circle Icon */}
      <circle cx="20" cy="20" r="14" fill="#6739B7" />
      {/* Devanagari Pe Symbol */}
      <path d="M16 13H24V16H20.5V19.5C22.2 19.5 23.5 20.8 23.5 22.5C23.5 24.2 22.2 25.5 20.5 25.5H19V28H16V13ZM19 23H20.5C21 23 21.5 22.6 21.5 22C21.5 21.4 21 21 20.5 21H19V23Z" fill="#FFFFFF" />
      <path d="M21 16H24.5C26 16 27 17 27 18.5V28H24.5V19C24.5 18.5 24 18 23.5 18H21V16Z" fill="#FFFFFF" />
      {/* Text PhonePe */}
      <text x="38" y="25" fill="currentColor" fontFamily="sans-serif" fontWeight="bold" fontSize="13" letterSpacing="-0.3">PhonePe</text>
    </svg>
  );
}

export function PaytmLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* "Pay" in dark blue */}
      <path d="M12 7H5V25H9V18.5H12C15.5 18.5 18 16 18 12.75C18 9.5 15.5 7 12 7ZM12 15H9V10.5H12C13.5 10.5 14.5 11.25 14.5 12.75C14.5 14.25 13.5 15 12 15Z" fill="#002970" />
      <path d="M24 12C21.5 12 19.5 14 19.5 16.5C19.5 19 21.5 21 24 21C25.5 21 26.5 20.5 27 19.5V21H30.5V12H27V13.5C26.5 12.5 25.5 12 24 12ZM25 18C23.8 18 23 17.2 23 16.5C23 15.8 23.8 15 25 15C26.2 15 27 15.8 27 16.5C27 17.2 26.2 18 25 18Z" fill="#002970" />
      <path d="M38 12.5L34 22L33.5 20.8L35.5 16.2L32 12.5H36L38 15.5L40 12.5H44L39.5 19.2L38 25H34.5L36 20.5L38 12.5Z" fill="#002970" />
      {/* "tm" in vibrant cyan */}
      <path d="M47 9H54V12H52V25H49V12H47V9Z" fill="#00BAF2" />
      <path d="M56 12H59V13.5C59.5 12.5 60.5 12 61.5 12C62.5 12 63.5 12.5 64 13.5C64.5 12.5 65.5 12 66.5 12C68 12 69 13 69 15V25H66V16C66 15.5 65.5 15 65 15C64.5 15 64 15.5 64 16V25H61V16C61 15.5 60.5 15 60 15C59.5 15 59 15.5 59 16V25H56V12Z" fill="#00BAF2" />
    </svg>
  );
}

export function VisaLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M28.4 2.8L18.6 21.2H12.2L7.4 6.8C7.1 5.7 6.9 5.3 6 4.8C4.5 4 2.1 3.3 0 2.8L0.2 2H10.6C12 2 13.2 2.9 13.5 4.5L16.1 16.5L22.2 2.8H28.4ZM53.4 15.2C53.4 9.4 45.4 9.1 45.4 6.5C45.4 5.6 46.3 4.6 48.2 4.4C49.1 4.3 51.7 4.2 54.5 5.5L55.6 1.1C54.1 0.5 52.2 0 49.8 0C43.7 0 39.4 3.2 39.4 7.8C39.4 14.8 49.2 15.2 49.2 19.3C49.2 20.6 48 21.6 45.7 21.6C42.8 21.6 39.9 20.3 38.3 19.5L37.1 24.1C38.8 24.9 42 25.6 45.2 25.6C51.6 25.6 56 22.4 56 17.5C56 16.7 54.8 15.8 53.4 15.2ZM69.5 21.2H74.8L70.2 2.8H65.3C64.2 2.8 63.3 3.4 62.9 4.4L53.8 21.2H59.8L61 17.8H68.3L69.5 21.2ZM62.7 13.2L65.6 5.3L67.3 13.2H62.7ZM38.4 2.8L33.7 21.2H28.1L32.8 2.8H38.4Z" fill="#1434CB" />
    </svg>
  );
}

export function MastercardLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="17" cy="16" r="14" fill="#EB001B" />
      <circle cx="33" cy="16" r="14" fill="#F79E1B" fillOpacity="0.88" />
    </svg>
  );
}

export function RupayLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* RuPay Arrows */}
      <path d="M12 22L19 4H13L6 22H12Z" fill="#097939" />
      <path d="M21 22L28 4H22L15 22H21Z" fill="#ED752E" />
      <path d="M30 22L37 4H31L24 22H30Z" fill="#0088CC" />
      {/* Text RuPay */}
      <text x="40" y="19" fill="currentColor" fontFamily="sans-serif" fontWeight="900" fontSize="15" letterSpacing="-0.5">RuPay</text>
    </svg>
  );
}

export function AcceptedPaymentRailsStrip() {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
        Accepted Payment Rails
      </span>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {/* UPI */}
        <div
          title="Unified Payments Interface (UPI)"
          className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-2 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-850"
        >
          <UpiLogo className="h-4.5 w-auto text-zinc-200" />
        </div>

        {/* Google Pay */}
        <div
          title="Google Pay"
          className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-2 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-850"
        >
          <GPayLogo className="h-4.5 w-auto text-zinc-200" />
        </div>

        {/* PhonePe */}
        <div
          title="PhonePe"
          className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-2 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-850"
        >
          <PhonePeLogo className="h-4.5 w-auto text-zinc-200" />
        </div>

        {/* Paytm */}
        <div
          title="Paytm"
          className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-2 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-850"
        >
          <PaytmLogo className="h-4.5 w-auto text-zinc-200" />
        </div>

        {/* Visa */}
        <div
          title="Visa"
          className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-2 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-850"
        >
          <VisaLogo className="h-4.5 w-auto text-zinc-200" />
        </div>

        {/* Mastercard */}
        <div
          title="Mastercard"
          className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-2 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-850"
        >
          <MastercardLogo className="h-4.5 w-auto text-zinc-200" />
        </div>

        {/* RuPay */}
        <div
          title="RuPay"
          className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-2 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-850"
        >
          <RupayLogo className="h-4.5 w-auto text-zinc-200" />
        </div>
      </div>
    </div>
  );
}

