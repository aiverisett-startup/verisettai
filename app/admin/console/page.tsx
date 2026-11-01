"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Server,
  Users,
  Terminal,
  PauseCircle,
  PlayCircle,
  Archive,
  RefreshCw,
  Plus,
  Minus,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  ArrowRight,
  Lock,
  Unlock,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import type { PlanConfig } from "@/lib/plans";
import type { AdminUserRecord } from "@/app/api/admin/users/route";
import type { SystemEventLog } from "@/app/api/admin/events/route";

export default function AdminConsolePage() {
  const [adminPasscode, setAdminPasscode] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true);

  // Data states
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [events, setEvents] = useState<SystemEventLog[]>([]);
  const [globalPause, setGlobalPause] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "users" | "telemetry">("inventory");

  // User table search & filter
  const [userSearch, setUserSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Adjust Balance Modal
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<AdminUserRecord | null>(null);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState<string>("500");
  const [balanceAdjustReason, setBalanceAdjustReason] = useState<string>("Support execution credit");
  const [isAdjustingBalance, setIsAdjustingBalance] = useState<boolean>(false);

  // Action status notices
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper headers for API requests
  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (adminPasscode) {
      headers["x-admin-key"] = adminPasscode;
    }
    return headers;
  }, [adminPasscode]);

  // Check saved admin passcode from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem("verisett_admin_key") || "verisett_admin_super_secret_2026";
    if (saved) {
      setAdminPasscode(saved);
      verifyKey(saved);
    } else {
      setIsVerifyingAuth(false);
    }
  }, []);

  const verifyKey = async (key: string) => {
    setIsVerifyingAuth(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        headers: { "x-admin-key": key },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("verisett_admin_key", key);
        loadAllData(key);
      } else {
        const json = await res.json().catch(() => ({}));
        setIsAuthenticated(false);
        setAuthError(json?.error || "Invalid Administrative Security Key.");
      }
    } catch (err: any) {
      setIsAuthenticated(false);
      setAuthError("Failed to connect to authentication rail.");
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  const loadAllData = async (key = adminPasscode) => {
    setIsLoading(true);
    try {
      const authHeader = { "x-admin-key": key };

      // 1. Fetch Plans
      const plansRes = await fetch("/api/admin/plans", { headers: authHeader });
      if (plansRes.ok) {
        const json = await plansRes.json();
        setPlans(json.plans || []);
        setGlobalPause(Boolean(json.globalPause));
      }

      // 2. Fetch Users
      const usersRes = await fetch("/api/admin/users", { headers: authHeader });
      if (usersRes.ok) {
        const json = await usersRes.json();
        setUsers(json.users || []);
      }

      // 3. Fetch Event Stream
      const eventsRes = await fetch("/api/admin/events", { headers: authHeader });
      if (eventsRes.ok) {
        const json = await eventsRes.json();
        setEvents(json.events || []);
      }
    } catch (err: any) {
      console.warn("[ADMIN_DATA_FETCH_NOTE]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Capacity Engine Actions
  const handleToggleGlobalPause = async () => {
    const nextState = !globalPause;
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action: "toggle_global_pause", isPaused: nextState }),
      });
      if (res.ok) {
        setGlobalPause(nextState);
        setPlans((prev) => prev.map((p) => ({ ...p, isPaused: nextState })));
        showNotification(
          nextState
            ? "Emergency Global Pause Activated: Public checkout is frozen."
            : "Platform Checkouts Resumed: Normal operations online."
        );
      }
    } catch (err: any) {
      showNotification("Failed to toggle global pause", "error");
    }
  };

  const handleAdjustSlots = async (planId: string, delta: number) => {
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action: "adjust_slots", planId, delta }),
      });
      if (res.ok) {
        const json = await res.json();
        setPlans((prev) => prev.map((p) => (p.id === planId ? json.plan : p)));
        showNotification(`Slots updated for ${json.plan.displayName}: ${json.plan.currentSubscribers} active`);
      }
    } catch (err) {
      showNotification("Failed to adjust subscriber seats", "error");
    }
  };

  const handleArchivePlan = async (planId: string, targetArchived: boolean) => {
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action: "archive_plan", planId, isArchived: targetArchived }),
      });
      if (res.ok) {
        const json = await res.json();
        setPlans((prev) => prev.map((p) => (p.id === planId ? json.plan : p)));
        showNotification(
          targetArchived
            ? `${json.plan.displayName} has been archived & sunset from pricing.`
            : `${json.plan.displayName} unarchived.`
        );
      }
    } catch (err) {
      showNotification("Failed to update archive status", "error");
    }
  };

  const handleTogglePlanPause = async (planId: string, currentPaused: boolean) => {
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action: "toggle_plan_pause", planId, isPaused: !currentPaused }),
      });
      if (res.ok) {
        const json = await res.json();
        setPlans((prev) => prev.map((p) => (p.id === planId ? json.plan : p)));
        showNotification(`${json.plan.displayName} pause toggled to ${!currentPaused}`);
      }
    } catch (err) {
      showNotification("Failed to toggle plan pause", "error");
    }
  };

  // 2. User Oversight Actions
  const handleToggleSuspendUser = async (user: AdminUserRecord) => {
    const nextSuspended = !user.is_suspended;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action: "toggle_suspend", userId: user.id, isSuspended: nextSuspended }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_suspended: nextSuspended, agent_status: nextSuspended ? "Suspended" : "Active" } : u
          )
        );
        showNotification(
          nextSuspended
            ? `Kill Switch Triggered: ${user.email} suspended.`
            : `Account Reinstated: ${user.email} reactivated.`
        );
      }
    } catch (err) {
      showNotification("Failed to toggle suspension", "error");
    }
  };

  const handleApplyBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    const amountNum = parseFloat(balanceAdjustAmount);
    if (isNaN(amountNum)) return;

    setIsAdjustingBalance(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          action: "adjust_balance",
          userId: selectedUserForBalance.id,
          amount: amountNum,
          reason: balanceAdjustReason,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUserForBalance.id ? { ...u, wallet_balance: json.newBalance } : u))
        );
        showNotification(`Wallet credited/debited: New balance ₹${json.newBalance}`);
        setSelectedUserForBalance(null);
      }
    } catch (err) {
      showNotification("Failed to adjust user wallet balance", "error");
    } finally {
      setIsAdjustingBalance(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.node_uid.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  // Total Enterprise Capacity calculations
  const enterprisePlan = plans.find((p) => p.id === "enterprise");
  const enterpriseSubscribers = enterprisePlan?.currentSubscribers || 0;
  const enterpriseMaxCap = enterprisePlan?.maxSubscribers || 200;
  const enterpriseCapPercent = Math.min(100, Math.round((enterpriseSubscribers / enterpriseMaxCap) * 100));

  // If locked / unauthorized view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="w-full max-w-md bg-[#0D0D12] border border-white/[0.08] p-8 rounded-2xl shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Verisett Admin Console</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Deterministic Clearinghouse Core Operations Rail
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              {authError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyKey(adminPasscode);
            }}
            className="space-y-4"
          >
            <div className="text-left space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
                Admin Security Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingAuth || !adminPasscode.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition cursor-pointer disabled:opacity-50"
            >
              {isVerifyingAuth ? "Verifying Credentials..." : "Unlock Operations Console →"}
            </button>
          </form>

          <Link href="/" className="inline-block text-xs font-mono text-slate-500 hover:text-slate-300 transition">
            ← Return to Public Protocol
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#09090B]/85 backdrop-blur-xl px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <VerisettLogo size={26} />
              <span className="font-bold text-white text-sm tracking-tight">Verisett AI</span>
            </Link>
            <span className="text-slate-700">/</span>
            <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>ADMIN OPERATIONS CONSOLE</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Emergency Global Pause Status */}
            <button
              onClick={handleToggleGlobalPause}
              className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                globalPause
                  ? "bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
                  : "bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/50"
              }`}
            >
              {globalPause ? <PauseCircle className="w-3.5 h-3.5 text-rose-400" /> : <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{globalPause ? "EMERGENCY PAUSE: ACTIVE" : "CHECKOUT SYSTEM: LIVE"}</span>
            </button>

            <button
              onClick={() => loadAllData()}
              className="text-xs font-mono text-slate-400 hover:text-white bg-white/[0.03] border border-white/[0.08] p-2 rounded-lg transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem("verisett_admin_key");
                setIsAuthenticated(false);
              }}
              className="text-xs font-mono text-slate-400 hover:text-rose-300 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3">
          <div
            className={`px-4 py-3 rounded-xl border text-xs font-mono shadow-2xl backdrop-blur-xl flex items-center gap-2.5 ${
              notification.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/90 border-rose-500/40 text-rose-200"
            }`}
          >
            {notification.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8 flex-1">
        {/* Top Summary Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Platform Clearance &amp; Capacity Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Automated 200-seat sunset triggers, real-time node inventory, and manual user ledger adjustments.
            </p>
          </div>

          {/* Segmented Section Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-2 ${
                activeTab === "inventory"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Plan Capacity</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Oversight</span>
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-2 ${
                activeTab === "telemetry"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Error Stream</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: TIER INVENTORY & CAPACITY TOGGLES                                 */}
        {/* ========================================================================= */}
        {activeTab === "inventory" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Enterprise Capacity Hero Metric */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-black border border-blue-500/30 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 font-mono text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full uppercase">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>SOVEREIGN CAP: 200-USER AUTO-SUNSET ENGINE</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Enterprise Tier Fleet Allocation: {enterpriseSubscribers} / {enterpriseMaxCap} Nodes
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    When subscriber count reaches {enterpriseMaxCap}, the platform automatically sets{" "}
                    <code className="text-cyan-300">isArchived: true</code> and{" "}
                    <code className="text-cyan-300">isPaused: true</code>, withdrawing the ₹35,400 tier from the public pricing surface.
                  </p>
                </div>

                <div className="w-full md:w-72 space-y-2 shrink-0">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Capacity Burn:</span>
                    <span className="text-cyan-300 font-bold">{enterpriseCapPercent}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        enterpriseCapPercent >= 90
                          ? "bg-rose-500"
                          : enterpriseCapPercent >= 60
                          ? "bg-amber-400"
                          : "bg-gradient-to-r from-blue-500 to-cyan-400"
                      }`}
                      style={{ width: `${enterpriseCapPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block text-right">
                    {Math.max(0, enterpriseMaxCap - enterpriseSubscribers)} slots remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Tier Inventory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const isEnterprise = plan.id === "enterprise";
                const capLabel = plan.maxSubscribers !== null ? `${plan.currentSubscribers} / ${plan.maxSubscribers} Nodes` : `${plan.currentSubscribers} Active (Uncapped)`;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border p-6 space-y-5 transition-all bg-[#0D0D12]/80 backdrop-blur-xl ${
                      plan.isArchived
                        ? "border-rose-500/30 opacity-70"
                        : plan.isPaused
                        ? "border-amber-500/30"
                        : "border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-white">{plan.displayName}</h4>
                          {plan.isArchived && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30">
                              ARCHIVED / SUNSET
                            </span>
                          )}
                          {plan.isPaused && !plan.isArchived && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                              PAUSED
                            </span>
                          )}
                          {plan.isSoldOut && !plan.isArchived && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                              SOLD OUT
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          Base: ₹{plan.basePrice.toLocaleString()} + 18% GST (₹{plan.gstAmount.toLocaleString()}) = ₹{plan.totalPrice.toLocaleString()} total
                        </p>
                      </div>

                      <span className="font-mono text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-md">
                        ID: {plan.id}
                      </span>
                    </div>

                    {/* Metric Box */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 block">Current Capacity</span>
                        <span className="text-base font-bold text-white font-mono">{capLabel}</span>
                      </div>

                      {/* Seat increment / decrement controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustSlots(plan.id, -1)}
                          disabled={plan.currentSubscribers <= 0}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer disabled:opacity-30"
                          title="Release 1 seat (-1)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono text-slate-300 px-2">{plan.currentSubscribers}</span>
                        <button
                          onClick={() => handleAdjustSlots(plan.id, 1)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
                          title="Allocate 1 seat (+1)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Control Buttons Strip */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06]">
                      <button
                        onClick={() => handleTogglePlanPause(plan.id, plan.isPaused)}
                        className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                          plan.isPaused
                            ? "bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40"
                            : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:text-white"
                        }`}
                      >
                        {plan.isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                        <span>{plan.isPaused ? "Resume Checkout" : "Pause Tier"}</span>
                      </button>

                      {isEnterprise && (
                        <button
                          onClick={() => handleArchivePlan(plan.id, !plan.isArchived)}
                          className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                            plan.isArchived
                              ? "bg-blue-950/40 border-blue-500/40 text-blue-300 hover:bg-blue-900/40"
                              : "bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/40"
                          }`}
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>{plan.isArchived ? "Restore Enterprise Tier" : "Archive / Sunset Tier Now"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: USER & NODE ACCOUNT OVERSIGHT                                     */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by email, name, or node UID..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">Role Filter:</span>
                {["ALL", "BUILDER", "ENTERPRISE", "ADMIN"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                      roleFilter === r
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold"
                        : "bg-white/[0.02] text-slate-400 hover:text-white border border-white/[0.06]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Data Table */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0D0D12] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400">
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">User Identity</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">Tier / Role</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">Node UID</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">Virtual Balance</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">Status</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-xs">
                          No developer accounts match your filter query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === "ADMIN"
                                  ? "bg-purple-950/60 text-purple-300 border border-purple-500/30"
                                  : u.plan_tier === "ENTERPRISE"
                                  ? "bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                                  : "bg-blue-950/60 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {u.plan_tier} ({u.role})
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                              {u.node_uid}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            ₹{Number(u.wallet_balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.is_suspended ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30">
                                <Ban className="w-3 h-3" />
                                <span>SUSPENDED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle className="w-3 h-3" />
                                <span>ACTIVE</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* Adjust Balance Modal Trigger */}
                              <button
                                onClick={() => setSelectedUserForBalance(u)}
                                className="px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer text-[11px]"
                              >
                                Adjust Balance
                              </button>

                              {/* Kill switch / Suspend Toggle */}
                              <button
                                onClick={() => handleToggleSuspendUser(u)}
                                className={`px-2.5 py-1 rounded transition cursor-pointer text-[11px] font-semibold border ${
                                  u.is_suspended
                                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40"
                                    : "bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-900/40"
                                }`}
                              >
                                {u.is_suspended ? "Unsuspend" : "Kill Switch"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RUNTIME ERROR & EVENT STREAM                                      */}
        {/* ========================================================================= */}
        {activeTab === "telemetry" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live Clearinghouse Telemetry &amp; Error Stream
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">Buffer: {events.length} events logged</span>
            </div>

            {/* Terminal Window */}
            <div className="p-5 rounded-2xl bg-black border border-white/[0.08] font-mono text-xs space-y-3 min-h-[380px] overflow-y-auto shadow-2xl">
              {events.map((evt) => {
                const isCrit = evt.severity === "CRITICAL";
                const isWarn = evt.severity === "WARNING";
                const badgeColor = isCrit
                  ? "text-rose-400 bg-rose-950/60 border-rose-500/40"
                  : isWarn
                  ? "text-amber-400 bg-amber-950/60 border-amber-500/40"
                  : "text-emerald-400 bg-emerald-950/60 border-emerald-500/40";

                return (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:bg-white/[0.04] transition"
                  >
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badgeColor}`}>
                        {evt.code}
                      </span>
                      <span className="text-slate-200 truncate leading-relaxed">{evt.message}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-slate-500 text-[11px]">
                      <span className="text-cyan-400/80">{evt.origin}</span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Adjust Balance Modal */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0D0D12] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Adjust Developer Wallet Balance</h3>
              </div>
              <button
                onClick={() => setSelectedUserForBalance(null)}
                className="text-slate-500 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400 space-y-1">
              <div>
                Target: <span className="text-white font-bold">{selectedUserForBalance.email}</span>
              </div>
              <div>
                Current Balance:{" "}
                <span className="text-emerald-400 font-bold">
                  ₹{Number(selectedUserForBalance.wallet_balance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleApplyBalanceAdjustment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 block uppercase">
                  Delta Amount in INR (Use negative for debit, e.g. -500 or 1000)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={balanceAdjustAmount}
                  onChange={(e) => setBalanceAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 block uppercase">
                  Audit Reason / Ticket Reference
                </label>
                <input
                  type="text"
                  required
                  value={balanceAdjustReason}
                  onChange={(e) => setBalanceAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.03] text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjustingBalance}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-mono font-semibold text-white transition shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {isAdjustingBalance ? "Applying Ledger Entry..." : "Apply Adjustment →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#09090B] py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Verisett Sovereign Infrastructure • Administrative Clearance Level 4</span>
          <span className="text-cyan-400/70">Cryptographic Ledger Sync Active</span>
        </div>
      </footer>
    </div>
  );
}
