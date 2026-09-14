# Verisett AI — Custom Domain & Production Launch Guide

This guide details the exact steps to connect your custom domain, configure DNS records, update OAuth redirect URIs, and activate production SSL.

---

## 1. Buying Your Domain
You can purchase your domain (e.g., `verisett.com`, `verisett.ai`, `verisett.io`) from any registrar:
- **Recommended Registrars**: Cloudflare Registrar, Namecheap, Porkbun, or GoDaddy.

---

## 2. Deploying & Pointing DNS Records

### Option A: Deploying on Vercel (Recommended for Next.js)
1. Push this repository to GitHub or run `npx vercel` in this folder.
2. In the Vercel Dashboard, navigate to **Project Settings → Domains**.
3. Enter your purchased domain (e.g., `verisett.com`).
4. Vercel will provide the exact DNS records to add at your domain registrar:
   - **Type A Record**:
     - **Name / Host**: `@`
     - **Value / IP**: `76.76.21.21`
   - **CNAME Record**:
     - **Name / Host**: `www`
     - **Value**: `cname.vercel-dns.com`
5. Once added, Vercel automatically provisions a free, auto-renewing Let's Encrypt TLS/SSL certificate.

---

## 3. Production Environment Variables

Set these environment variables in your hosting dashboard (e.g. Vercel Project Settings → Environment Variables):

| Variable | Recommended Production Value |
| :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| `NEXTAUTH_URL` | `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lpoconfurcrrkndguycr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Your public Supabase anon key)* |
| `GOOGLE_CLIENT_ID` | `11208389629-2r35q7a9luheces1hsdlv40bpmg2to7l.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | *(Your Google OAuth Client Secret)* |
| `NODE_ENV` | `production` |

---

## 4. Supabase Auth Configuration (Crucial Step!)

Since OAuth redirects back to your domain after authentication:
1. Log in to [Supabase Console](https://supabase.com/dashboard/project/lpoconfurcrrkndguycr).
2. Navigate to **Authentication → URL Configuration**.
3. Set **Site URL** to:
   ```
   https://yourdomain.com
   ```
4. In **Redirect URLs**, add:
   ```
   https://yourdomain.com/**
   https://yourdomain.com/auth/callback
   ```
5. Click **Save Changes**.

---

## 5. Google Cloud Console Configuration

To allow Google Sign-In on your custom domain:
1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select your OAuth 2.0 Client ID (`11208389629-...`).
3. Under **Authorized JavaScript origins**, add:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
4. Under **Authorized redirect URIs**, add:
   ```
   https://yourdomain.com/auth/callback
   https://lpoconfurcrrkndguycr.supabase.co/auth/v1/callback
   ```
5. Click **Save**.

---

## 6. Built-in Security Protections Active in Verisett AI
Your codebase is pre-configured with:
- **Strict Content Security Policy (CSP)** preventing XSS and malicious script injections.
- **HSTS (HTTP Strict Transport Security)** enforcing 2-year HTTPS with subdomain preloading.
- **X-Frame-Options: DENY** preventing Clickjacking / unauthorized iframe framing.
- **Edge WAF & Scanner Defense** blocking automated bot probes (`.env`, `.git`, `wp-admin`, path traversal).
- **IP-Based API Rate Limiting** on `/api/contact` and `/api/auth/*` against spam and brute-force.
- **Open Redirect Sanitization** on `/auth/callback` ensuring users cannot be redirected off-domain.
- **RFC 9116 `security.txt`** at `/.well-known/security.txt`.
