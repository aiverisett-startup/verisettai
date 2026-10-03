"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuthUser } from "@/lib/useAuthUser";

export interface StoredKey {
  id: string;
  keyHint: string;
  prefix: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
  revokedAt?: string | null;
  lastUsedAt?: string | null;
}

export interface ApiKeysSectionProps {
  onKeySelected?: (key: string) => void;
  compact?: boolean;
}

export function ApiKeysSection({ onKeySelected, compact = false }: ApiKeysSectionProps) {
  const { user: _user } = useAuthUser();
  const [keys, setKeys] = useState<StoredKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [newKeyData, setNewKeyData] = useState<{
    key: string;
    keyHint: string;
    warning: string;
  } | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [_copiedId, setCopiedId] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/verisett/keys");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.keys)) {
          setKeys(data.keys);
        }
      }
    } catch (err) {
      console.warn("Could not fetch API keys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerateKey = async (type: "live" | "test" = "live") => {
    try {
      setGenerating(true);
      const res = await fetch("/api/verisett/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", type }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.apiKey) {
          setNewKeyData({
            key: data.apiKey,
            keyHint: data.keyHint,
            warning: data.warning || "Copy this key now. It will never be displayed again.",
          });
          if (typeof window !== "undefined") {
            localStorage.setItem("verisett_api_key", data.apiKey);
          }
          if (onKeySelected) {
            onKeySelected(data.apiKey);
          }
          await fetchKeys();
        }
      }
    } catch (err) {
      console.error("Failed to generate API key:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      setRevokingId(keyId);
      const res = await fetch("/api/verisett/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", keyId }),
      });
      if (res.ok) {
        await fetchKeys();
      }
    } catch (err) {
      console.error("Failed to revoke API key:", err);
    } finally {
      setRevokingId(null);
    }
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Generate Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D2]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-[#1C1A17]">Developer API Keys</h4>
            <span className="rounded-full bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[10px] font-mono text-blue-700 font-semibold">
              CSPRNG 256-bit
            </span>
          </div>
          <p className="text-[11px] text-[#8C8275]">
            Keys are hashed using SHA-256 and authenticated in constant time via <code className="text-blue-600 font-semibold font-mono">crypto.timingSafeEqual()</code>.
          </p>
        </div>

        {/* Top-Right Action Button: Conditionally rendered only when keys exist to avoid empty-state duplicates */}
        <div className="flex items-center gap-2">
          {!loading && keys.length > 0 && (
            <button
              type="button"
              onClick={() => handleGenerateKey("live")}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Generate New Key</span>
            </button>
          )}
        </div>
      </div>

      {/* One-Time Raw Key Warning Banner (Shown ONCE upon creation) */}
      {newKeyData && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-md space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>One-Time Plaintext Key Generation</span>
            </div>
            <button
              type="button"
              onClick={() => setNewKeyData(null)}
              className="text-xs text-blue-600 hover:text-blue-500 font-medium underline-offset-4 hover:underline cursor-pointer"
            >
              Done / Dismiss
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-blue-200 font-mono text-xs text-[#1C1A17] flex items-center justify-between gap-2 break-all">
            <span className="select-all font-medium text-blue-600">{newKeyData.key}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(newKeyData.key)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-xs font-mono font-semibold text-blue-700 shrink-0 cursor-pointer transition-colors"
            >
              {copiedRaw ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
            ⚠️ <strong>{newKeyData.warning}</strong> The raw key is never stored on our servers. Only the SHA-256 hash has been recorded.
          </p>
        </div>
      )}

      {/* Keys Table / List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-6 text-center text-xs font-mono text-[#8C8275] flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Loading cryptographic keys...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-[#EAE3D2] bg-[#FAF8F5]/60 text-xs text-[#8C8275] space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1C1A17]">No active API keys found</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Generate a cryptographically unguessable key to authenticate your autonomous agent.</p>
            </div>
            <button
              type="button"
              onClick={() => handleGenerateKey("live")}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Generate First Key</span>
            </button>
          </div>
        ) : (
          keys.map((k) => (
            <div
              key={k.id}
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                k.status === "ACTIVE"
                  ? "bg-white border-[#EAE3D2] hover:border-blue-500/40 shadow-2xs"
                  : "bg-[#F5F4F0] border-[#EAE3D2]/60 opacity-60"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {/* Masked Key Display showing strictly first 8 and last 4 characters */}
                  <span className="font-mono text-xs font-bold text-[#1C1A17] bg-[#FAF8F5] px-2.5 py-0.5 rounded-lg border border-[#EAE3D2]">
                    {k.keyHint}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      k.status === "ACTIVE"
                        ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                        : "text-red-800 bg-red-50 border border-red-200"
                    }`}
                  >
                    {k.status === "ACTIVE" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {k.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-[#8C8275]">
                  <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>SHA-256 Hashed at Rest</span>
                  {k.lastUsedAt && (
                    <>
                      <span>•</span>
                      <span>Last used: {new Date(k.lastUsedAt).toLocaleTimeString()}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {k.status === "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => handleRevokeKey(k.id)}
                    disabled={revokingId === k.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                    title="Instantly invalidate key and reject future requests"
                  >
                    {revokingId === k.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    <span>Revoke Key</span>
                  </button>
                )}
                {k.status === "REVOKED" && (
                  <span className="text-[11px] font-mono text-[#8C8275] italic">Invalidated</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Re-export as ApiKeyManager for drop-in backward compatibility
export const ApiKeyManager = ApiKeysSection;
