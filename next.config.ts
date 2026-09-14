import type { NextConfig } from "next";

const securityHeaders = [
  // 1. Enforce HTTPS across all subdomains and preload in browser HSTS lists
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 2. Prevent Clickjacking: deny framing from all external origins
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // 3. Prevent MIME-type confusion / sniffing attacks
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // 4. Strict referrer: never leak sensitive query parameters across origins
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 5. Restrict device hardware and browser tracking APIs (FLoC, camera, mic)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()",
  },
  // 6. Cross-Origin Opener Policy allowing OAuth authentication popups while isolating context
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
  // 7. Legacy XSS filter protection
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // 8. Content Security Policy (CSP) tailored for Next.js, Supabase, Google SSO, and Fonts
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com https://avatars.githubusercontent.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://api.github.com",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com https://github.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Hide Next.js technology stack fingerprint from vulnerability scanners
  poweredByHeader: false,
  
  // Enable gzip/brotli compression for performance & bandwidth
  compress: true,

  // Apply enterprise security headers across all routes
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
