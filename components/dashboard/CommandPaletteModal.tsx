"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bot,
  Plus,
  ShieldCheck,
  FileText,
  DollarSign,
  Activity,
  LogOut,
  X,
  ArrowRight,
} from "lucide-react";

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAgent: () => void;
  onDepositFunds: () => void;
  onSimulatePing: () => void;
  onSignOut: () => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onRegisterAgent,
  onDepositFunds,
  onSimulatePing,
  onSignOut,
}: CommandPaletteModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: "register-agent",
      title: "Register AI Agent Node",
      category: "Agent Swarm",
      icon: Bot,
      run: () => {
        onClose();
        onRegisterAgent();
      },
    },
    {
      id: "deposit-funds",
      title: "Deposit Vault Custody Funds",
      category: "Escrow & Custody",
      icon: Plus,
      run: () => {
        onClose();
        onDepositFunds();
      },
    },
    {
      id: "simulate-ping",
      title: "Transmit Swarm Heartbeat Ping",
      category: "Telemetry",
      icon: Activity,
      run: () => {
        onClose();
        onSimulatePing();
      },
    },
    {
      id: "nav-agents",
      title: "Browse Registered Agents",
      category: "Navigation",
      icon: Bot,
      run: () => {
        onClose();
        router.push("/dashboard");
      },
    },
    {
      id: "nav-protocol",
      title: "Protocol Billing & Rails",
      category: "Navigation",
      icon: DollarSign,
      run: () => {
        onClose();
        router.push("/dashboard/billing");
      },
    },
    {
      id: "nav-settlements",
      title: "Settlement Ledger & Proofs",
      category: "Navigation",
      icon: ShieldCheck,
      run: () => {
        onClose();
        router.push("/dashboard?tab=transactions");
      },
    },
    {
      id: "nav-docs",
      title: "Verisett Protocol Documentation",
      category: "Documentation",
      icon: FileText,
      run: () => {
        onClose();
        window.open("https://github.com/aiverisett/verisett", "_blank");
      },
    },
    {
      id: "action-signout",
      title: "Sign Out of Terminal",
      category: "Session",
      icon: LogOut,
      run: () => {
        onClose();
        onSignOut();
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl overflow-hidden font-sans">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (e.g. 'Register', 'Deposit', 'Docs')..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List with Custom Dark Scrollbar */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-dark-scrollbar scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs font-sans text-zinc-400">
              No commands or navigation destinations matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.run}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-zinc-800/80 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-950 text-blue-500 border border-zinc-800 group-hover:border-blue-500 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-zinc-100 group-hover:text-blue-400 transition-colors font-sans block">
                        {item.title}
                      </span>
                      <span className="block text-xs text-zinc-400 font-normal font-sans">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-t border-zinc-800 text-[11px] font-sans text-zinc-400">
          <span>Navigation &amp; Execution</span>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">ESC</span>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPaletteModal;
