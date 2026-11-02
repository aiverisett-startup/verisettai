"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Bot,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Activity,
  ArrowUpRight,
} from "lucide-react";

export interface AgentDbRecord {
  id: string;
  userId?: string | null;
  name: string;
  endpoint?: string | null;
  protocol: string;
  status: string;
  throughputTps: number;
  totalSettled: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

interface RegisteredAgentsTableProps {
  onRegisterAgent: () => void;
  selectedAgentId?: string | null;
  onSelectAgent?: (agentId: string) => void;
  className?: string;
}

export function RegisteredAgentsTable({
  onRegisterAgent,
  selectedAgentId,
  onSelectAgent,
  className = "",
}: RegisteredAgentsTableProps) {
  const [agents, setAgents] = useState<AgentDbRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAgents = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/agents", {
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.agents)) {
          setAgents(data.agents);
        }
      }
    } catch (err) {
      console.error("[RegisteredAgentsTable] Fetch error:", err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();

    const handleUpdate = () => {
      fetchAgents();
    };

    window.addEventListener("verisett_agents_updated", handleUpdate);
    window.addEventListener("verisett_data_mutated", handleUpdate);

    return () => {
      window.removeEventListener("verisett_agents_updated", handleUpdate);
      window.removeEventListener("verisett_data_mutated", handleUpdate);
    };
  }, [fetchAgents]);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const formatCode = (agent: AgentDbRecord) => {
    return `AGT-${agent.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  };

  return (
    <div
      className={`bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 font-sans ${className}`}
    >
      {/* Table Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-sans">
              Registered Agents
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              ({agents.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Cryptographically registered sovereign AI agents and clearinghouse nodes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchAgents(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-2xs"
            title="Refresh agents list"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={onRegisterAgent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Register Agent</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="py-14 px-6 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <p className="text-xs text-slate-500 font-mono">Synchronizing registered nodes...</p>
        </div>
      ) : agents.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-sm font-bold text-slate-900 font-sans">
              No agents connected yet
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              No agents connected yet. Click &apos;+ Register Agent&apos; to deploy your first node.
            </p>
          </div>
          <button
            type="button"
            onClick={onRegisterAgent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Register Agent</span>
          </button>
        </div>
      ) : (
        /* Dynamic Full-Width Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 sm:px-6 font-semibold">AGENT NAME &amp; ID</th>
                <th className="py-3 px-4 font-semibold">PROTOCOL</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold">THROUGHPUT</th>
                <th className="py-3 px-4 sm:px-6 font-semibold">REGISTERED AT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                const statusUpper = (agent.status || "IDLE").toUpperCase();
                const isActive = statusUpper === "ACTIVE" || statusUpper === "LINKED";
                const code = formatCode(agent);

                return (
                  <tr
                    key={agent.id}
                    onClick={() => onSelectAgent && onSelectAgent(agent.id)}
                    className={`transition-colors ${
                      onSelectAgent ? "cursor-pointer" : "cursor-default"
                    } ${
                      isSelected
                        ? "bg-blue-50/60 hover:bg-blue-50/80"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* AGENT NAME & ID */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs flex items-center justify-center text-blue-600">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-900 truncate font-sans text-xs sm:text-sm">
                            {agent.name}
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                            <span>{code}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(code, e)}
                              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                              title="Copy Agent ID"
                            >
                              {copiedId === code ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* PROTOCOL */}
                    <td className="py-4 px-4 font-mono text-slate-700">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200/80 shadow-2xs">
                        <Zap className="w-3 h-3 text-blue-600" />
                        {agent.protocol || "A2A"}
                      </span>
                    </td>

                    {/* STATUS (Green badge for ACTIVE, Gray for IDLE) */}
                    <td className="py-4 px-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          IDLE
                        </span>
                      )}
                    </td>

                    {/* THROUGHPUT */}
                    <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-900">
                      {typeof agent.throughputTps === "number"
                        ? `${agent.throughputTps.toFixed(1)} TPS`
                        : "0.0 TPS"}
                    </td>

                    {/* REGISTERED AT */}
                    <td className="py-4 px-4 sm:px-6 font-mono text-[11px] text-slate-600">
                      {formatDate(agent.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RegisteredAgentsTable;

