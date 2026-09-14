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

export function proxy(request: NextRequest) {
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
      // Reject any non-relative URLs or protocol-relative URLs (e.g. //evil.com, https://attacker.com)
      if (!nextParam.startsWith("/") || nextParam.startsWith("//") || nextParam.startsWith("/\\") || nextParam.includes(":")) {
        const sanitizedUrl = request.nextUrl.clone();
        sanitizedUrl.searchParams.set("next", "/");
        return NextResponse.redirect(sanitizedUrl);
      }
    }
  }

  // 3. API Rate Limiting
  if (pathname.startsWith("/api/")) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // Strict rate limit on contact submission (5 per minute per IP)
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

    // Rate limit on auth endpoints (25 per minute per IP)
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

    // General API rate limit (60 requests per minute per IP)
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

  // 4. Inject runtime security headers into downstream responses
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

// Default export for maximum compatibility
export default proxy;

// Configure proxy matching: apply to all requests except static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4)).*)",
  ],
};
