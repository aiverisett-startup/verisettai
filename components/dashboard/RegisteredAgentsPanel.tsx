"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, Check, Bot, Activity, Trash2 } from "lucide-react";

export interface AgentApiRecord {
  id: string;
  userId?: string | null;
  name: string;
  endpoint?: string | null;
  protocol: string;
  status: string;
  throughputTps: number;
  totalSettled: string;
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RegisteredAgentsPanelProps {
  selectedAgentId: string | null;
  onSelectAgent: (agent: AgentApiRecord) => void;
  onRegisterAgent?: () => void;
  onDeleteAgent?: (agentId: string, agentName: string) => void;
  className?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-store" },
  });
  if (!res.ok) throw new Error("Failed to fetch agents");
  return res.json();
};

export function RegisteredAgentsPanel({
  selectedAgentId,
  onSelectAgent,
  onRegisterAgent,
  onDeleteAgent,
  className = "",
}: RegisteredAgentsPanelProps) {
  const { data, mutate } = useSWR<{ agents: AgentApiRecord[]; totalCount: number }>(
    "/api/agents",
    fetcher,
    {
      refreshInterval: 4000,
      revalidateOnFocus: true,
    }
  );

  const agents = data?.agents || [];

  // Default selection to agents[0]?.id if nothing is selected or current selection is invalid
  useEffect(() => {
    if (agents.length > 0) {
      const exists = agents.some((a) => a.id === selectedAgentId);
      if (!selectedAgentId || !exists) {
        onSelectAgent(agents[0]);
      }
    }
  }, [agents, selectedAgentId, onSelectAgent]);

  // Listen for real-time mutation events from modals
  useEffect(() => {
    const handleAgentsUpdated = () => {
      mutate();
    };

    window.addEventListener("verisett_agents_updated", handleAgentsUpdated);
    window.addEventListener("verisett_data_mutated", handleAgentsUpdated);

    return () => {
      window.removeEventListener("verisett_agents_updated", handleAgentsUpdated);
      window.removeEventListener("verisett_data_mutated", handleAgentsUpdated);
    };
  }, [mutate]);

  return (
    <div
      className={`w-full bg-white border border-[#EAE3D2] rounded-2xl shadow-xs overflow-hidden font-sans ${className}`}
    >
      {/* Header: Title only and clean + Register Agent button */}
      <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between gap-4 bg-[#FDFCF9]">
        <h2 className="text-base sm:text-lg font-bold text-[#1C1A17] tracking-tight">
          Registered Agents
        </h2>

        <Link
          href="/dashboard/register-agent"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Register Agent</span>
        </Link>
      </div>

      {/* Table / Empty State */}
      {agents.length === 0 ? (
        <div className="py-16 px-6 text-center space-y-3">
          <p className="text-sm font-medium text-[#6E675D]">
            No registered agents.
          </p>
          <Link
            href="/dashboard/register-agent"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Register Agent</span>
          </Link>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#EAE3D2] bg-[#FAF8F5] text-[11px] font-semibold uppercase tracking-wider text-[#8C8275]">
                <th className="py-3 px-6">Agent Name / ID</th>
                <th className="py-3 px-6">Protocol</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions / Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D2]/70">
              {agents.map((agent) => {
                const isSelected = selectedAgentId === agent.id;
                const formattedId = `AGT-${agent.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
                const isActive = (agent.status || "").toUpperCase() === "ACTIVE";

                return (
                  <tr
                    key={agent.id}
                    onClick={() => onSelectAgent(agent)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-blue-50/70 text-[#1C1A17]"
                        : "hover:bg-[#FAF8F5] text-[#334155]"
                    }`}
                  >
                    {/* AGENT NAME / ID */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-[#FAF8F5] text-[#6E675D] border-[#CBD5E1] group-hover:border-[#2563EB]/50"
                          }`}
                        >
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-[#1C1A17] group-hover:text-blue-600 transition truncate">
                            {agent.name}
                          </div>
                          <div className="font-mono text-[11px] text-[#8C8275] tracking-wide">
                            {formattedId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* PROTOCOL */}
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EAE3D2] text-[#4A453E]">
                        {agent.protocol || "A2A"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-6">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-slate-400"
                          }`}
                        />
                        <span
                          className={
                            isActive ? "text-emerald-700 font-bold" : "text-[#64748B]"
                          }
                        >
                          {agent.status || "ACTIVE"}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS / SELECT */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAgent(agent);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-2xs"
                              : "bg-white border border-[#CBD5E1] hover:border-blue-500 text-[#0F172A] hover:bg-blue-50/50"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <span>Select</span>
                          )}
                        </button>

                        {onDeleteAgent && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAgent(agent.id, agent.name);
                            }}
                            className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title={`Delete ${agent.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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

export default RegisteredAgentsPanel;
