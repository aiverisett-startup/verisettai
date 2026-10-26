import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// In-memory token-bucket rate limiter for edge API requests
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const tokenBucketStore = new Map<string, TokenBucket>();
const TOKEN_BUCKET_CAPACITY = 60;
const REPLENISHMENT_RATE_PER_SEC = 2; // 2 tokens per second

// Periodic cleanup of idle token bucket entries (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of tokenBucketStore.entries()) {
      if (now - bucket.lastRefill > 5 * 60 * 1000) {
        tokenBucketStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

function checkTokenBucketRateLimit(clientKey: string): boolean {
  const now = Date.now();
  let bucket = tokenBucketStore.get(clientKey);

  if (!bucket) {
    bucket = { tokens: TOKEN_BUCKET_CAPACITY - 1, lastRefill: now };
    tokenBucketStore.set(clientKey, bucket);
    return true;
  }

  // Replenish tokens proportional to elapsed time: 2 tokens/sec up to capacity of 60
  const elapsedSec = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(
    TOKEN_BUCKET_CAPACITY,
    bucket.tokens + elapsedSec * REPLENISHMENT_RATE_PER_SEC
  );
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

// Blocklist of common exploit scanner targets
const MALICIOUS_PATH_PATTERNS = [
  /\/\.env/i,
  /\/\.git/i,
  /\/\.svn/i,
  /\/\.aws/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/phpmyadmin/i,
  /\/pma/i,
  /\/xmlrpc\.php/i,
  /\/cgi-bin/i,
  /\/etc\/passwd/i,
  /\x00/, // Null byte injection
  /\.\./,  // Path traversal
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const rawPath = `${pathname}${search}`;

  // 1. Web Application Firewall (WAF): Block malicious scanner probes
  for (const pattern of MALICIOUS_PATH_PATTERNS) {
    if (pattern.test(rawPath)) {
      return applySecurityHeaders(
        new NextResponse(
          JSON.stringify({
            error: "Forbidden: Malicious request signature detected.",
            timestamp: new Date().toISOString(),
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }
  }

  // 2. Open Redirect Defense on Auth Callback
  if (pathname.startsWith("/auth/callback")) {
    const nextParam = request.nextUrl.searchParams.get("next");
    if (nextParam) {
      if (
        !nextParam.startsWith("/") ||
        nextParam.startsWith("//") ||
        nextParam.startsWith("/\\") ||
        nextParam.includes(":")
      ) {
        const sanitizedUrl = request.nextUrl.clone();
        sanitizedUrl.searchParams.set("next", "/dashboard");
        return applySecurityHeaders(NextResponse.redirect(sanitizedUrl));
      }
    }
  }

  // 3. API Edge Token-Bucket Rate Limiting (Capacity: 60, Replenishment: 2 tokens/sec)
  if (pathname.startsWith("/api/")) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "127.0.0.1";

    const allowed = checkTokenBucketRateLimit(clientIp);
    if (!allowed) {
      return applySecurityHeaders(
        new NextResponse(
          JSON.stringify({ error: "RATE_LIMIT_EXCEEDED" }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "1",
              "X-RateLimit-Capacity": "60",
              "X-RateLimit-Replenishment": "2/sec",
            },
          }
        )
      );
    }
  }


  // 4. Supabase Session Validation & Cookie Sync via @supabase/ssr updateSession
  return await updateSession(request);
}

/**
 * Refreshes user session cookies on every request and enforces route access controls.
 */
async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lpoconfurcrrkndguycr.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb2NvbmZ1cmNycmtuZGd1eWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTIzNDIsImV4cCI6MjEwNDc4ODM0Mn0.3yyJUB6duad7COImmhU8afbMoDtOOi7NaaWzL8jHiTA";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Use getUser() instead of getSession() to securely revalidate
  // the Auth token with the Supabase Auth server and refresh cookies via setAll.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  // 5. Route Protection Rules
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // If unauthenticated user requests /dashboard, redirect to /login
  if (isDashboardRoute && !user) {
    const redirectPath = `${pathname}${search}`;
    const loginUrl = new URL(`/login?redirect=${encodeURIComponent(redirectPath)}`, request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // If authenticated user hits /login or /signup, redirect immediately to /dashboard
  if (isAuthRoute && user) {
    const redirectTarget = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    const dashboardUrl = new URL(redirectTarget, request.url);
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // 6. Inject enterprise-grade security response headers
  return applySecurityHeaders(supabaseResponse);
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
}


export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)).*)",
  ],
};
