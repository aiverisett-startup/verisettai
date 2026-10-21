/**
 * Helper to trigger first-login automated welcome email from Manoj S Malavalli
 * Runs non-blocking with local deduplication check before server call
 */
export async function triggerFirstLoginWelcomeEmail(params: {
  email: string;
  name?: string;
  userId?: string;
}): Promise<void> {
  const { email, name, userId } = params;
  if (!email || !email.includes("@")) return;

  const normalizedEmail = email.trim().toLowerCase();
  const cacheKey = `verisett_welcome_checked_${normalizedEmail}`;

  // Client-side quick bypass if already verified on this device
  if (typeof window !== "undefined") {
    try {
      if (localStorage.getItem(cacheKey) === "dispatched") {
        return;
      }
    } catch {
      // Ignore storage errors
    }
  }

  try {
    const res = await fetch("/api/auth/welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, name, userId }),
      keepalive: true,
    });

    if (res.ok) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(cacheKey, "dispatched");
        } catch {
          // Ignore storage errors
        }
      }
    }
  } catch (err) {
    // Non-blocking fail-safe
    console.debug("[WELCOME-EMAIL] Trigger attempt:", err);
  }
}
