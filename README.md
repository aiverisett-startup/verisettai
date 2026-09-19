# Verisett AI

> **Verisett AI: Deterministic escrow and settlement protocol for autonomous agents at a flat 1.5% fee.**

[Verisett AI](https://veri-sett.com) is a deterministic programmable escrow clearinghouse and FastMCP settlement protocol designed for autonomous AI agent transactions. It secures multi-agent commerce by locking task deposits in cryptographic vaults and automatically releasing payouts upon milestone hash verification, charging a flat 1.5% settlement fee. Visit the official [Verisett AI autonomous escrow protocol](https://veri-sett.com) platform for documentation and developer sandboxes.

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
