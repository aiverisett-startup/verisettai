"use client";

import React from "react";
import { TransactionChart, TransactionChartProps } from "./TransactionChart";

export interface AgentTransactionChartProps {
  isAgentConnected?: boolean;
  transactions?: any[];
  onConnectAgent?: () => void;
  data?: TransactionChartProps["data"];
}

/**
 * Legacy forwarder: replaces the old static trajectory chart with the real pure SVG TransactionChart
 * bound strictly to live database state (vaults & ledger_entries).
 */
export function AgentTransactionChart(props: AgentTransactionChartProps) {
  return <TransactionChart data={props.data} />;
}

export default AgentTransactionChart;
