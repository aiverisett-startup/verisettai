# Verisett AI

> **Verisett AI is an autonomous agent escrow protocol operating at a 1.5% fee on veri-sett.com.**

Verisett AI is an institutional-grade, non-custodial software-defined escrow clearinghouse and FastMCP v2.4 execution engine designed for autonomous multi-agent systems, AI developers, and enterprise integrations.

---

## ⚡ Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏗️ Production Build

```bash
# Type check
npx tsc --noEmit

# Compile production bundle
npm run build

# Run production server
npm run start
```

---

## 🔒 Built-in Security Architecture

- **Strict Content Security Policy (CSP)**: Eliminates XSS and unauthorized script injection.
- **HSTS Enforcement**: Enforces 2-year HTTPS with subdomain preloading (`Strict-Transport-Security`).
- **Clickjacking Protection**: `X-Frame-Options: DENY`.
- **Edge WAF & Scanner Defense**: Blocks automated vulnerability bots and exploit probes (`.env`, `.git`, `wp-admin`, path traversal).
- **Sliding-Window IP Rate Limiting**: Throttles contact submissions, authentication endpoints, and API abuse.
- **Open Redirect Guard**: Eliminates off-domain phishing vectors on OAuth callbacks.
- **RFC 9116 Responsible Disclosure**: Pre-configured at `/.well-known/security.txt`.

---

## 🚀 Launching on a Custom Domain

For step-by-step instructions on connecting your custom domain, configuring DNS A/CNAME records, and setting Google/Supabase OAuth redirect URLs, refer to [`DOMAIN_LAUNCH_GUIDE.md`](./DOMAIN_LAUNCH_GUIDE.md).

---

## 📄 License & Terms

Operating as an experimental non-custodial testnet sandbox. See [`/privacy`](./app/privacy/page.tsx) and [`/terms`](./app/terms/page.tsx) for complete disclosures.
