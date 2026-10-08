import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// In-memory rate limiting store for edge requests
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired rate limit entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(ip: string, category: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const key = `${category}:${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
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
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden: Malicious request signature detected.",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
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
        return NextResponse.redirect(sanitizedUrl);
      }
    }
  }

  // 3. API Rate Limiting
  if (pathname.startsWith("/api/")) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (pathname === "/api/contact") {
      const allowed = checkRateLimit(ip, "contact", 5, 60 * 1000);
      if (!allowed) {
        return new NextResponse(
          JSON.stringify({
            error: "Too many requests. Please wait a minute before submitting again.",
            retryAfterSeconds: 60,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
            },
          }
        );
      }
    }

    if (pathname.startsWith("/api/auth/")) {
      const allowed = checkRateLimit(ip, "auth", 25, 60 * 1000);
      if (!allowed) {
        return new NextResponse(
          JSON.stringify({
            error: "Too many authentication requests. Rate limit exceeded.",
            retryAfterSeconds: 60,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
            },
          }
        );
      }
    }

    const generalAllowed = checkRateLimit(ip, "general_api", 60, 60 * 1000);
    if (!generalAllowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Rate limit exceeded. Please slow down.",
          retryAfterSeconds: 60,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // 4. Supabase Session Validation & Cookie Sync via @supabase/ssr
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

  // Read current session from cookies
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 5. Route Protection Rules
  // Any unauthenticated request to /dashboard/* or /checkout/* must redirect to /login?redirect=<path>
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isCheckoutRoute = pathname === "/checkout" || pathname.startsWith("/checkout/");

  // If session does not exist (session === null), redirect to /login. If session exists, DO NOT redirect. Allow pass-through to /dashboard.
  if ((isDashboardRoute || isCheckoutRoute) && session === null) {
    const redirectPath = `${pathname}${search}`;
    const loginUrl = new URL(`/login?redirect=${encodeURIComponent(redirectPath)}`, request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // On /login and /signup: If data.session !== null, redirect immediately to /dashboard
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  if (isAuthRoute && session !== null) {
    const dashboardUrl = new URL("/dashboard", request.url);
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // Inject security headers
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)).*)",
  ],
};
