import { Suspense } from "react";
import SettlementDetailView from "./SettlementDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SettlementPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center font-mono text-xs text-cyan-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            INITIALIZING_SETTLEMENT_VM_EXPLORER...
          </div>
        </div>
      }
    >
      <SettlementDetailView id={id} />
    </Suspense>
  );
}
