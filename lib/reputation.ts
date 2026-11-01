export interface AgentTelemetryMetrics {
  totalTasks?: number;
  successfulTasks?: number;
  avgLatencyMs?: number;
  policyViolations?: number;
  uptimePercent?: number;
}

export interface ReputationResult {
  score: number;
  grade: string;
  badgeColor: string;
  strokeColor: string;
  escrowCap: string;
  components: {
    success: number;
    latency: number;
    policy: number;
    uptime: number;
  };
}

export function computeReputation(metrics?: AgentTelemetryMetrics): ReputationResult {
  // If no metrics or empty, return default sovereign runtime state (99.4)
  if (!metrics || (metrics.totalTasks === undefined && metrics.avgLatencyMs === undefined && metrics.uptimePercent === undefined)) {
    return {
      score: 99.4,
      grade: "Grade AAA Sovereign Runtime",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      strokeColor: "#10B981",
      escrowCap: "₹35,400 Verified Escrow",
      components: {
        success: 100,
        latency: 98,
        policy: 100,
        uptime: 99.9,
      },
    };
  }

  const totalTasks = metrics.totalTasks ?? 0;
  const successfulTasks = metrics.successfulTasks ?? 0;
  const avgLatencyMs = metrics.avgLatencyMs ?? 20;
  const policyViolations = metrics.policyViolations ?? 0;
  const uptimePercent = metrics.uptimePercent ?? 100;

  // 1. Success Rate Component (0 - 100)
  const sSuccess = totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 100;

  // 2. Latency Component (<= 20ms -> 100, >= 500ms -> 0)
  let sLatency = 100;
  if (avgLatencyMs > 20) {
    sLatency = Math.max(0, Math.min(100, 100 - ((avgLatencyMs - 20) / (500 - 20)) * 100));
  }

  // 3. Policy Adherence Component (100 minus 25 per violation)
  const sPolicy = Math.max(0, 100 - policyViolations * 25);

  // 4. Uptime Component (0 - 100)
  const sUptime = Math.max(0, Math.min(100, uptimePercent));

  // Weighted Score S = (0.40 * S_success) + (0.25 * S_latency) + (0.20 * S_policy) + (0.15 * S_uptime)
  const weighted = 0.4 * sSuccess + 0.25 * sLatency + 0.2 * sPolicy + 0.15 * sUptime;
  const score = Math.round(weighted * 10) / 10;

  if (score < 50) {
    return {
      score,
      grade: "Grade F Suspended",
      badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      strokeColor: "#F43F5E",
      escrowCap: "₹0 Cap (Frozen)",
      components: { success: sSuccess, latency: sLatency, policy: sPolicy, uptime: sUptime },
    };
  }

  if (score < 70) {
    return {
      score,
      grade: "Grade B Probationary",
      badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      strokeColor: "#F59E0B",
      escrowCap: "₹2,500 Limited Cap",
      components: { success: sSuccess, latency: sLatency, policy: sPolicy, uptime: sUptime },
    };
  }

  if (score < 85) {
    return {
      score,
      grade: "Grade A Standard Operational",
      badgeColor: "text-slate-300 border-slate-500/30 bg-slate-500/10",
      strokeColor: "#94A3B8",
      escrowCap: "₹10,000 Standard Cap",
      components: { success: sSuccess, latency: sLatency, policy: sPolicy, uptime: sUptime },
    };
  }

  if (score < 95) {
    return {
      score,
      grade: "Grade AA Verified High-Trust",
      badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      strokeColor: "#3B82F6",
      escrowCap: "₹25,000 High-Trust Cap",
      components: { success: sSuccess, latency: sLatency, policy: sPolicy, uptime: sUptime },
    };
  }

  return {
    score,
    grade: "Grade AAA Sovereign Runtime",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    strokeColor: "#10B981",
    escrowCap: "₹35,400 Verified Escrow",
    components: { success: sSuccess, latency: sLatency, policy: sPolicy, uptime: sUptime },
  };
}
