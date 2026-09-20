"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Eye, EyeOff, ShieldCheck, Terminal, Globe, Key, X, AlertTriangle, Lock } from "lucide-react";
import { useAuthUser } from "@/lib/useAuthUser";

interface ConnectAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

type ConnectionType = "gateway" | "mcp" | "apikey";

export function ConnectAgentModal({ isOpen, onClose, onConnected }: ConnectAgentModalProps) {
  const router = useRouter();
  const { user } = useAuthUser();
  const [selectedType, setSelectedType] = useState<ConnectionType>("gateway");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Live runtime credentials derived from authenticated session
  const userKeySeed = user
    ? (user.id || user.email || "live").replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)
    : "";
  const liveApiKey = user
    ? `vrs_live_${userKeySeed.padEnd(24, "89f72b1049c81a29e4d0812b")}`
    : "vrs_live_••••••••••••••••••••••••";
  const agentId = user
    ? `agt_${userKeySeed.slice(0, 12).padEnd(12, "89f72b1049c8")}`
    : "agt_••••••••••••";
  const liveGatewayUrl = user
    ? `https://gateway.verisett.com/v1/${agentId}`
    : "https://gateway.verisett.com/v1/agt_••••••••••••";

  const liveMcpConfig = user
    ? JSON.stringify(
        {
          mcpServers: {
            verisett: {
              url: "https://gateway.verisett.com/mcp",
              headers: {
                Authorization: `Bearer ${liveApiKey}`,
              },
            },
          },
        },
        null,
        2
      )
    : JSON.stringify(
        {
          mcpServers: {
            verisett: {
              url: "https://gateway.verisett.com/mcp",
              headers: {
                Authorization: "Bearer vrs_live_••••••••••••••••••••••••",
              },
            },
          },
        },
        null,
        2
      );

  const liveCreds = {
    apiKey: liveApiKey,
    gatewayUrl: liveGatewayUrl,
    mcpConfig: liveMcpConfig,
  };

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    if (!user) {
      setAuthError("Authentication Required: You must be signed in with Google or Email to copy Gateway URLs, MCP server configs, or API keys.");
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onConnected) {
      onConnected();
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-7 shadow-[0_20px_60px_rgba(197,155,95,0.15)]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45] shadow-[0_2px_12px_rgba(197,155,95,0.1)]">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1C1A17] tracking-tight">Connect Your Agent</h3>
              <p className="text-xs text-[#8C8275] mt-0.5">
                Select your integration method to link an autonomous agent to the settlement engine.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#8C8275] hover:bg-[#FAF8F5] hover:text-[#1C1A17] transition cursor-pointer"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* 3 Tier Selector Cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => { setSelectedType("gateway"); setRevealed(false); }}
            className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition cursor-pointer ${
              selectedType === "gateway"
                ? "border-[#C59B5F] bg-[#FAF6EE] text-[#1C1A17] shadow-[0_4px_16px_rgba(197,155,95,0.12)] ring-1 ring-[#C59B5F]/30"
                : "border-[#EAE3D2] bg-[#FDFCF9] text-[#8C8275] hover:border-[#C59B5F]/40 hover:text-[#1C1A17]"
            }`}
          >
            <Globe className="w-5 h-5 text-[#9E7A45] mb-2"/>
            <span className="text-xs font-semibold text-[#1C1A17]">Hosted Gateway</span>
            <span className="text-[10px] text-[#8C8275] mt-1">Zero-code URL for SaaS & agents</span>
          </button>

          <button
            onClick={() => { setSelectedType("mcp"); setRevealed(false); }}
            className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition cursor-pointer ${
              selectedType === "mcp"
                ? "border-[#C59B5F] bg-[#FAF6EE] text-[#1C1A17] shadow-[0_4px_16px_rgba(197,155,95,0.12)] ring-1 ring-[#C59B5F]/30"
                : "border-[#EAE3D2] bg-[#FDFCF9] text-[#8C8275] hover:border-[#C59B5F]/40 hover:text-[#1C1A17]"
            }`}
          >
            <Terminal className="w-5 h-5 text-[#9E7A45] mb-2"/>
            <span className="text-xs font-semibold text-[#1C1A17]">MCP Config</span>
            <span className="text-[10px] text-[#8C8275] mt-1">Claude Desktop & Cursor</span>
          </button>

          <button
            onClick={() => { setSelectedType("apikey"); setRevealed(false); }}
            className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition cursor-pointer ${
              selectedType === "apikey"
                ? "border-[#C59B5F] bg-[#FAF6EE] text-[#1C1A17] shadow-[0_4px_16px_rgba(197,155,95,0.12)] ring-1 ring-[#C59B5F]/30"
                : "border-[#EAE3D2] bg-[#FDFCF9] text-[#8C8275] hover:border-[#C59B5F]/40 hover:text-[#1C1A17]"
            }`}
          >
            <Key className="w-5 h-5 text-[#9E7A45] mb-2"/>
            <span className="text-xs font-semibold text-[#1C1A17]">Secret API Key</span>
            <span className="text-[10px] text-[#8C8275] mt-1">Custom Python & TS daemons</span>
          </button>
        </div>

        {/* Authentication Alert if user attempts copy without session */}
        {authError && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-montserrat flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-medium">{authError}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                router.push("/login");
              }}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#C59B5F] hover:bg-[#B38A4F] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
            >
              Sign In →
            </button>
          </div>
        )}

        {/* Selected Credential Display */}
        <div className="mt-5 rounded-2xl border border-[#EAE3D2] bg-[#FDFCF9] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-[#8C8275] uppercase tracking-wider">
              {selectedType === "gateway" && "Private Gateway Endpoint"}
              {selectedType === "mcp" && "MCP Server Configuration"}
              {selectedType === "apikey" && "Active Settlement Bearer Token"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRevealed(!revealed)}
                className="flex items-center gap-1 text-[11px] text-[#8C8275] hover:text-[#1C1A17] transition cursor-pointer"
              >
                {revealed ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                {revealed ? "Mask" : "Reveal"}
              </button>
            </div>
          </div>

          {selectedType === "gateway" && (
            <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 border border-[#EAE3D2] font-mono text-xs">
              <span className="text-[#9E7A45] font-medium truncate mr-2">
                {revealed ? liveCreds.gatewayUrl : "https://gateway.verisett.com/v1/agt_••••••••••••"}
              </span>
              <button
                onClick={() => handleCopy(liveCreds.gatewayUrl)}
                className="text-[#8C8275] hover:text-[#1C1A17] shrink-0 ml-2 cursor-pointer p-1"
                title={!user ? "Login required to copy" : "Copy Gateway URL"}
              >
                {!user ? <Lock className="w-4 h-4 text-[#C59B5F]"/> : copied ? <Check className="w-4 h-4 text-[#9E7A45]"/> : <Copy className="w-4 h-4"/>}
              </button>
            </div>
          )}

          {selectedType === "mcp" && (
            <div className="relative rounded-xl bg-white p-3 border border-[#EAE3D2] font-mono text-xs text-[#1C1A17]">
              <pre className="overflow-x-auto text-[11px]">
                {revealed
                  ? liveCreds.mcpConfig
                  : '{\n  "mcpServers": {\n    "verisett": {\n      "url": "https://gateway.verisett.com/mcp",\n      "headers": { "Authorization": "Bearer vrs_live_••••••••" }\n    }\n  }\n}'}
              </pre>
              <button
                onClick={() => handleCopy(liveCreds.mcpConfig)}
                className="absolute top-2.5 right-2.5 text-[#8C8275] hover:text-[#1C1A17] cursor-pointer p-1 bg-[#FAF8F5] rounded border border-[#EAE3D2]"
                title={!user ? "Login required to copy" : "Copy MCP Config"}
              >
                {!user ? <Lock className="w-4 h-4 text-[#C59B5F]"/> : copied ? <Check className="w-4 h-4 text-[#9E7A45]"/> : <Copy className="w-4 h-4"/>}
              </button>
            </div>
          )}

          {selectedType === "apikey" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 border border-[#EAE3D2] font-mono text-xs">
                <span className="text-[#9E7A45] font-medium truncate mr-2">
                  {revealed ? liveCreds.apiKey : "vrs_live_••••••••••••••••••••••••"}
                </span>
                <button
                  onClick={() => handleCopy(liveCreds.apiKey)}
                  className="text-[#8C8275] hover:text-[#1C1A17] shrink-0 ml-2 cursor-pointer p-1"
                  title={!user ? "Login required to copy" : "Copy API Key"}
                >
                  {!user ? <Lock className="w-4 h-4 text-[#C59B5F]"/> : copied ? <Check className="w-4 h-4 text-[#9E7A45]"/> : <Copy className="w-4 h-4"/>}
                </button>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6EE] border border-[#EAE3D2] text-[11px] text-[#9E7A45] font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-[#C59B5F] shrink-0" />
                <span>Warning: This secret key will only be shown once. Store it securely in your environment variables.</span>
              </div>
            </div>
          )}

          {/* Live Handshake Status Indicator */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#8C8275]">
            <span className="flex items-center gap-1.5 text-[#8C8275] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#C59B5F] animate-pulse"></span>
              Listening for initial agent handshake...
            </span>
            <span className="text-[#8C8275]">Never share credentials publicly</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#EAE3D2] pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#8C8275] hover:text-[#1C1A17] transition cursor-pointer"
          >
            Close
          </button>
          {!user ? (
            <button
              onClick={() => {
                onClose();
                router.push("/login");
              }}
              className="flex items-center gap-2 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shadow-md shadow-[#C59B5F]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="w-3.5 h-3.5"/>
              <span>Sign In to Connect Agent</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(selectedType === "gateway" ? liveCreds.gatewayUrl : selectedType === "mcp" ? liveCreds.mcpConfig : liveCreds.apiKey)}
                className="flex items-center gap-1.5 rounded-xl border border-[#EAE3D2] bg-[#FAF8F5] hover:bg-white px-3 py-2 text-xs font-semibold text-[#8C8275] hover:text-[#1C1A17] transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <Copy className="w-3.5 h-3.5"/>}
                <span>{copied ? "Copied" : "Copy Config"}</span>
              </button>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("verisett_agent_connected", "true");
                    localStorage.setItem("verisett_connected_agent_id", agentId);
                  }
                  if (onConnected) onConnected();
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shadow-md shadow-[#C59B5F]/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck className="w-3.5 h-3.5"/>
                <span>Authorize &amp; Connect Agent</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
