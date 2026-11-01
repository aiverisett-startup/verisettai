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
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden selection:bg-blue-100 selection:text-blue-700">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-500/10 via-cyan-400/5 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none -z-10" />

        <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl backdrop-blur-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Verisett Admin Console</h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Deterministic Clearinghouse Core Operations Rail
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
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
              <label className="text-[11px] font-mono text-slate-600 block uppercase tracking-wider font-semibold">
                Admin Security Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingAuth || !adminPasscode.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isVerifyingAuth ? "Verifying Credentials..." : "Unlock Operations Console →"}
            </button>
          </form>

          <Link href="/" className="inline-block text-xs font-mono text-slate-500 hover:text-slate-700 transition">
            ← Return to Public Protocol
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen relative font-sans selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-x-hidden">
      {/* Background Ambient Lighting & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-blue-500/10 via-cyan-400/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none -z-10" />

      {/* Top Header Container */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <VerisettLogo size={26} />
              <span className="font-bold text-slate-900 text-sm tracking-tight">Verisett AI</span>
            </Link>
            <span className="text-slate-300">/</span>
            {/* Breadcrumb Pill */}
            <span className="font-mono text-[11px] tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              <span>ADMIN OPERATIONS CONSOLE</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge (Emergency Global Pause / Live) */}
            <button
              onClick={handleToggleGlobalPause}
              className={`font-mono text-xs px-3 py-1 rounded-full flex items-center gap-2 border transition-all cursor-pointer shadow-xs ${
                globalPause
                  ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {globalPause ? (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-semibold">EMERGENCY PAUSE: ACTIVE</span>
                </>
              ) : (
                <>
                  <span className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse" />
                  <span className="font-semibold">CHECKOUT SYSTEM: LIVE</span>
                </>
              )}
            </button>

            {/* Refresh Action Button */}
            <button
              onClick={() => loadAllData()}
              className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg p-2 text-xs transition-all shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>

            {/* Lock Action Button */}
            <button
              onClick={() => {
                sessionStorage.removeItem("verisett_admin_key");
                setIsAuthenticated(false);
              }}
              className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono transition-all shadow-xs cursor-pointer"
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
            className={`px-4 py-3 rounded-xl border text-xs font-mono shadow-lg backdrop-blur-xl flex items-center gap-2.5 ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8 flex-1">
        {/* Title Section & Navigation Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Clearance &amp; Capacity Control
            </h1>
            <p className="font-mono text-xs text-slate-500 mt-1 max-w-2xl">
              Automated 200-seat sunset triggers, real-time node inventory, and manual user ledger adjustments.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`transition cursor-pointer flex items-center gap-2 ${
                activeTab === "inventory"
                  ? "bg-white text-blue-600 font-semibold text-xs px-4 py-2 rounded-lg shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800 text-xs font-medium px-4 py-2 rounded-lg transition-all"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Plan Capacity</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`transition cursor-pointer flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-white text-blue-600 font-semibold text-xs px-4 py-2 rounded-lg shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800 text-xs font-medium px-4 py-2 rounded-lg transition-all"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Oversight</span>
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`transition cursor-pointer flex items-center gap-2 ${
                activeTab === "telemetry"
                  ? "bg-white text-blue-600 font-semibold text-xs px-4 py-2 rounded-lg shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800 text-xs font-medium px-4 py-2 rounded-lg transition-all"
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
            {/* Hero Sovereign Cap Banner */}
            <div className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 border border-blue-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="font-mono text-[11px] text-blue-700 bg-blue-100/70 border border-blue-300/60 px-3 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    <span>SOVEREIGN CAP: 200-USER AUTO-SUNSET ENGINE</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3 tracking-tight">
                    Enterprise Tier Fleet Allocation: {enterpriseSubscribers} / {enterpriseMaxCap} Nodes
                  </h3>
                  <p className="font-mono text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                    When subscriber count reaches {enterpriseMaxCap}, the platform automatically sets{" "}
                    <code className="bg-white border border-slate-200 text-blue-600 px-1.5 py-0.5 rounded font-mono text-[11px]">
                      isArchived: true
                    </code>{" "}
                    and{" "}
                    <code className="bg-white border border-slate-200 text-blue-600 px-1.5 py-0.5 rounded font-mono text-[11px]">
                      isPaused: true
                    </code>
                    , withdrawing the ₹35,400 tier from the public pricing surface.
                  </p>
                </div>

                {/* Capacity Burn Meter */}
                <div className="w-full md:w-72 space-y-2 shrink-0">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-mono text-xs text-slate-500 font-semibold">Capacity Burn:</span>
                    <span className="text-blue-700 font-bold">{enterpriseCapPercent}%</span>
                  </div>
                  <div className="w-64 h-2.5 bg-slate-200 rounded-full overflow-hidden mt-2 border border-slate-300/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        enterpriseCapPercent >= 90
                          ? "bg-rose-500"
                          : enterpriseCapPercent >= 60
                          ? "bg-amber-500"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600"
                      }`}
                      style={{ width: `${enterpriseCapPercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 mt-1.5 text-right block">
                    {Math.max(0, enterpriseMaxCap - enterpriseSubscribers)} slots remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Tier Inventory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const isEnterprise = plan.id === "enterprise";
                const capLabel =
                  plan.maxSubscribers !== null
                    ? `${plan.currentSubscribers} / ${plan.maxSubscribers} Nodes`
                    : `${plan.currentSubscribers} Active (Uncapped)`;

                return (
                  <div
                    key={plan.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Plan Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg font-bold text-slate-900">{plan.displayName}</h4>
                            {plan.isArchived && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                                ARCHIVED / SUNSET
                              </span>
                            )}
                            {plan.isPaused && !plan.isArchived && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                PAUSED
                              </span>
                            )}
                            {plan.isSoldOut && !plan.isArchived && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-slate-500 mt-1">
                            Base: ₹{plan.basePrice.toLocaleString()} + 18% GST (₹{plan.gstAmount.toLocaleString()}) = ₹{plan.totalPrice.toLocaleString()} total
                          </p>
                        </div>

                        {/* Tier ID Pill */}
                        <span className="font-mono text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md shrink-0">
                          ID: {plan.id}
                        </span>
                      </div>

                      {/* Capacity Counter Display */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between my-5">
                        <div>
                          <span className="font-mono text-[10px] tracking-wider text-slate-400 uppercase block">
                            Current Capacity
                          </span>
                          <span className="font-mono text-xl font-bold text-slate-900">{capLabel}</span>
                        </div>

                        {/* Stepper Buttons (- / +) */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAdjustSlots(plan.id, -1)}
                            disabled={plan.currentSubscribers <= 0}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                            title="Release 1 seat (-1)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold text-slate-800 px-2">
                            {plan.currentSubscribers}
                          </span>
                          <button
                            onClick={() => handleAdjustSlots(plan.id, 1)}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs transition-colors cursor-pointer"
                            title="Allocate 1 seat (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 mt-2">
                      <button
                        onClick={() => handleTogglePlanPause(plan.id, plan.isPaused)}
                        className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 font-mono text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                      >
                        {plan.isPaused ? (
                          <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{plan.isPaused ? "Resume Checkout" : "Pause Tier"}</span>
                      </button>

                      {isEnterprise && (
                        <button
                          onClick={() => handleArchivePlan(plan.id, !plan.isArchived)}
                          className={
                            plan.isArchived
                              ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-mono text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                              : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-mono text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                          }
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>
                            {plan.isArchived ? "Restore Enterprise Tier" : "Archive / Sunset Tier Now"}
                          </span>
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
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by email, name, or node UID..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">Role Filter:</span>
                {["ALL", "BUILDER", "ENTERPRISE", "ADMIN"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer shadow-xs ${
                      roleFilter === r
                        ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                        : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Data Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">User Identity</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">Tier / Role</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">Node UID</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">Virtual Balance</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">Status</th>
                      <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-xs">
                          No developer accounts match your filter query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === "ADMIN"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : u.plan_tier === "ENTERPRISE"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {u.plan_tier} ({u.role})
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {u.node_uid}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            ₹{Number(u.wallet_balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.is_suspended ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <Ban className="w-3 h-3 text-rose-600" />
                                <span>SUSPENDED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>ACTIVE</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* Adjust Balance Modal Trigger */}
                              <button
                                onClick={() => setSelectedUserForBalance(u)}
                                className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer text-[11px] shadow-xs"
                              >
                                Adjust Balance
                              </button>

                              {/* Kill switch / Suspend Toggle */}
                              <button
                                onClick={() => handleToggleSuspendUser(u)}
                                className={`px-2.5 py-1 rounded transition cursor-pointer text-[11px] font-semibold border shadow-xs ${
                                  u.is_suspended
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
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
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  Live Clearinghouse Telemetry &amp; Error Stream
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">Buffer: {events.length} events logged</span>
            </div>

            {/* Terminal Window */}
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 font-mono text-xs space-y-3 min-h-[380px] overflow-y-auto shadow-sm">
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
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:border-slate-700 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Adjust Developer Wallet Balance</h3>
              </div>
              <button
                onClick={() => setSelectedUserForBalance(null)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs font-mono text-slate-500 space-y-1">
              <div>
                Target: <span className="text-slate-900 font-bold">{selectedUserForBalance.email}</span>
              </div>
              <div>
                Current Balance:{" "}
                <span className="text-emerald-700 font-bold">
                  ₹{Number(selectedUserForBalance.wallet_balance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleApplyBalanceAdjustment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-600 block uppercase font-semibold">
                  Delta Amount in INR (Use negative for debit, e.g. -500 or 1000)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={balanceAdjustAmount}
                  onChange={(e) => setBalanceAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-600 block uppercase font-semibold">
                  Audit Reason / Ticket Reference
                </label>
                <input
                  type="text"
                  required
                  value={balanceAdjustReason}
                  onChange={(e) => setBalanceAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjustingBalance}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-mono font-semibold text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isAdjustingBalance ? "Applying Ledger Entry..." : "Apply Adjustment →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Verisett Sovereign Infrastructure • Administrative Clearance Level 4</span>
          <span className="text-blue-600 font-semibold">Cryptographic Ledger Sync Active</span>
        </div>
      </footer>
    </div>
  );
}
