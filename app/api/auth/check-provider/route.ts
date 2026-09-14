import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawProvider = (searchParams.get("provider") || "github").toLowerCase().trim();
  
  // Strict allowlist validation to prevent parameter injection & SSRF
  const ALLOWED_PROVIDERS = ["github", "google", "gitlab", "bitbucket", "discord", "apple", "azure"];
  if (!ALLOWED_PROVIDERS.includes(rawProvider)) {
    return NextResponse.json(
      { enabled: false, reason: "invalid_provider", message: "Invalid authentication provider requested." },
      { status: 400 }
    );
  }
  const provider = rawProvider;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lpoconfurcrrkndguycr.supabase.co";

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=${encodeURIComponent(provider)}`, {
      method: "GET",
      redirect: "manual",
    });

    if (res.status === 400) {
      const data = await res.json().catch(() => ({}));
      if (
        data.error_code === "validation_failed" ||
        data.msg?.includes("provider is not enabled")
      ) {
        return NextResponse.json({
          enabled: false,
          reason: "provider_not_enabled",
          message: data.msg || "Unsupported provider: provider is not enabled",
        });
      }
    }

    // 302/303 or 200 means Supabase has this provider enabled and ready to redirect to GitHub
    if (res.status === 302 || res.status === 303 || res.status === 200) {
      return NextResponse.json({ enabled: true });
    }

    return NextResponse.json({
      enabled: false,
      reason: "unexpected_status",
      status: res.status,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      enabled: false,
      reason: "network_error",
      message: errorMsg,
    });
  }
}
