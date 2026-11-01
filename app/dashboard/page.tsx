import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?redirect=/dashboard");
    }

    return (
      <DashboardClient
        initialUser={{
          id: user.id,
          email: user.email || "operator@verisett.ai",
        }}
      />
    );
  } catch (err: any) {
    // If it's a Next.js navigation redirect, re-throw so redirect works normally
    if (err?.digest?.startsWith("NEXT_REDIRECT") || err?.message === "NEXT_REDIRECT") {
      throw err;
    }

    console.warn("[DASHBOARD_SSR_AUTH_FALLBACK]:", err?.message || err);
    return (
      <DashboardClient
        initialUser={{
          id: "guest-operator",
          email: "operator@verisett.ai",
        }}
      />
    );
  }
}
