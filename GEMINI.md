# Verisett AI — Architecture & Protocol Context

## 1. System Overview
**Verisett AI** is an Autonomous Machine-to-Machine (M2M) Clearinghouse & Agent Identity Protocol. It provides cryptographic agent authentication, deterministic escrow, multi-agent settlement vaults, and autonomous dispute resolution for sovereign AI agents interacting across networks.

---

## 2. Technology Stack & Topology

### 2.1 Frontend & Application Layer
- **Framework**: Next.js 16 (App Router) / React 19 / TypeScript 5.
- **Styling**: Tailwind CSS with custom glassmorphism and high-density dark UI primitives.
- **Hosting & Edge**: Vercel Serverless & Edge Runtime.
- **State Management**: Reactive server store (`lib/serverStore.ts`) & Supabase SSR client hooks.

### 2.2 Data & Identity Layer
- **Database**: Supabase PostgreSQL 15+.
- **Authentication**: Supabase Auth (JWT tokens, OAuth2, service-role administrative bypass).
- **Security**: Row Level Security (RLS) policies enforced on `agents` and `transactions` tables.
- **Client Access**:
  - `lib/supabaseClient.ts`: Singleton browser & server client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `lib/supabaseAdmin.ts`: Elevated service-role client for background clearinghouse operations and state updates.

### 2.3 Compute & Worker Bridge Layer
- **AWS Free Tier Worker Bridge**:
  - Serverless dispatch endpoint: `app/api/clearinghouse/dispatch/route.ts`.
  - Background Execution Worker: AWS Lambda (1M free requests/month tier) or `t2.micro`/`t3.micro` EC2 daemon (`backend/aws-worker/handler.js`).
  - Worker Authentication: Protected by shared secret `AWS_WORKER_SECRET_KEY` and cryptographic signature validation.
  - Resilience: Automatic fallback to asynchronous mock settlement verification if `AWS_WORKER_URL` is omitted in development/sandbox modes.

---

## 3. Data Model & Cryptographic Identity

### `agents` Table
- `id` (`uuid`, Primary Key): Unique agent identifier.
- `owner_id` (`uuid`, references `auth.users`): Owning human operator or developer organization.
- `name` (`text`): Descriptive name for the autonomous agent.
- `public_key` (`text`, Unique): Public key (e.g., Ed25519, Secp256k1, or RSA) used to sign transactions and payload proofs.
- `status` (`text`, check constraint: `'active'`, `'suspended'`, `'pending'`): Operational lifecycle status.
- `created_at` (`timestamptz`): Registration timestamp.

### `transactions` Table
- `id` (`uuid`, Primary Key): Unique clearinghouse transaction UUID.
- `sender_agent_id` (`uuid`, references `agents`): The initiating/paying agent.
- `receiver_agent_id` (`uuid`, references `agents`): The receiving/fulfilling agent.
- `amount` (`numeric`): Value transferred or held in escrow.
- `currency` (`text`, default `'M2M_TOKEN'`): Settlement token or unit of account.
- `status` (`text`, check constraint: `'settled'`, `'queued'`, `'failed'`): Clearing state.
- `metadata` (`jsonb`): Arbitrary task payload, cryptographic execution proofs, and receipt hashes.
- `created_at` (`timestamptz`): Initiation timestamp.

---

## 4. Key Directory Structure
```
├── app/
│   ├── api/
│   │   ├── clearinghouse/
│   │   │   └── dispatch/route.ts    # Vercel serverless clearinghouse dispatch
│   │   ├── transfer/route.ts        # Direct transfer & vault deposit endpoints
│   │   └── vault/route.ts           # Vault query and management
│   ├── dashboard/                   # Operator dashboard & telemetry
│   └── layout.tsx                   # Main root layout
├── backend/
│   └── aws-worker/
│       ├── handler.js               # Dual AWS Lambda & EC2 HTTP worker listener
│       └── README.md                # Deployment and verification guide
├── components/                      # Modular UI components & design system
├── lib/
│   ├── supabaseClient.ts            # Singleton browser & server Supabase client
│   ├── supabaseAdmin.ts             # Elevated administrative Supabase client
│   └── serverStore.ts               # In-memory fast cache & agent detector
├── supabase/
│   ├── schema.sql                   # Canonical PostgreSQL DDL & RLS security policies
│   └── migrations/                  # Versioned database migration history
└── .env.example                     # Environment configuration reference
```

---

## 5. Security & Operational Rules
1. **Zero Secret Leakage**: `SUPABASE_SERVICE_ROLE_KEY` and `AWS_WORKER_SECRET_KEY` must never be exposed to browser bundles.
2. **Deterministic Settlement**: Every dispatched transaction must contain cryptographic verification or valid proof hash before state transitions to `'settled'`.
3. **Graceful Fallback**: If remote worker infrastructure is unreachable or unconfigured in local dev, operations cleanly fall back to local validation.
