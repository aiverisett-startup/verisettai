"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Bot,
  ShieldCheck,
  Zap,
  Key,
  Copy,
  Check,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Activity,
} from "lucide-react";
import { AgentRecord } from "@/app/dashboard/DashboardClient";

interface AgentFleetTableProps {
  agents: AgentRecord[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onRegisterAgent: () => void;
  onTriggerPing?: (agentId: string) => void;
  isPinging?: boolean;
}

export function AgentFleetTable({
  agents,
  selectedAgentId,
  onSelectAgent,
  onRegisterAgent,
  onTriggerPing,
  isPinging = false,
}: AgentFleetTableProps) {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCopyAgentId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Table Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight font-sans">
              Autonomous Agent Fleet
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {agents.length} {agents.length === 1 ? "Node" : "Nodes"}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Cryptographically cleared autonomous agents configured for machine-to-machine escrow execution.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegisterAgent}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Agent</span>
        </button>
      </div>

      {/* Empty State */}
      {agents.length === 0 ? (
        <div className="py-16 px-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-sm font-bold text-slate-900 font-sans">
              No active agent nodes registered
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Generate an API key or trigger an execution to provision your first node. Your agents will automatically synchronize here once registered.
            </p>
          </div>
          <button
            type="button"
            onClick={onRegisterAgent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision First Agent</span>
          </button>
        </div>
      ) : (
        /* Data Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 sm:px-6 font-semibold">Agent Name / ID</th>
                <th className="py-3 px-4 font-semibold">Execution Node</th>
                <th className="py-3 px-4 font-semibold">Protocol Status</th>
                <th className="py-3 px-4 font-semibold">Last Execution</th>
                <th className="py-3 px-4 sm:px-6 font-semibold">API Key Scope</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                const statusStr = (agent.status || "Idle").toLowerCase();
                const isLive = statusStr === "active" || statusStr === "linked";
                const isDispatched = statusStr === "dispatched";

                const agentCode =
                  agent.agent_id_code ||
                  `AGT-${agent.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

                return (
                  <tr
                    key={agent.id}
                    onClick={() => onSelectAgent(agent.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/50 hover:bg-blue-50/70"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Agent Name / ID */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
                          <Image
                            src={agent.avatar_url || "/agent-avatar.png"}
                            alt={agent.name}
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-900 truncate font-sans text-xs sm:text-sm">
                            {agent.name}
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                            <span>{agentCode}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyAgentId(agentCode, e)}
                              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                              title="Copy Agent ID"
                            >
                              {copiedKeyId === agentCode ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Execution Node / Framework */}
                    <td className="py-4 px-4 font-mono text-slate-700">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200/60">
                        <Zap className="w-3 h-3 text-blue-600" />
                        {agent.framework || "FastMCP"}
                      </span>
                    </td>

                    {/* Protocol Status */}
                    <td className="py-4 px-4">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : isDispatched ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Dispatched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Idle
                        </span>
                      )}
                    </td>

                    {/* Last Execution Timestamp */}
                    <td className="py-4 px-4 text-slate-600 font-mono text-[11px]">
                      {agent.last_heartbeat_at ? (
                        <span className="flex items-center gap-1 text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(agent.last_heartbeat_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400">— Awaiting —</span>
                      )}
                    </td>

                    {/* API Key Scope */}
                    <td className="py-4 px-4 sm:px-6 font-mono text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                        <Key className="w-3 h-3 text-blue-600" />
                        <span>vst_live_••••{agent.id.slice(0, 4)}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {onTriggerPing && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTriggerPing(agent.id);
                          }}
                          disabled={isPinging}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition cursor-pointer shadow-2xs"
                          title="Transmit Ping Heartbeat"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
                        </button>
                      )}
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

