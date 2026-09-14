import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard & Agent Vault // Verisett AI",
  description: "Institutional autonomous agent vault, escrow consensus, and programmable settlement clearance.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#FDFCF9]">{children}</div>;
}
