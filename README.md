# ScamScan

Check a recruiter or job offer before you reply. Paste the message, get an evidence-backed verdict on whether the approach looks genuine, suspicious, or dangerous.

## How it works

- One server-side Claude call classifies the pasted message text for scam signals — it never asserts facts about the world.
- Keyless deterministic checks run in code: contact-domain vs official-site match (with agency-aware softening), lookalike-domain detection, and domain age via RDAP (`rdap.org`).
- The verdict is computed deterministically in `lib/analyze.ts`. A verdict below HIGH never gets more than MEDIUM confidence.
- Nothing is stored: no database, no accounts, in-request only. No scraping — LinkedIn checks are guided questions the user answers from their own screen.
- LinkedIn-first: selecting LinkedIn as the contact source surfaces the profile questions (and company website) in the main flow.
- See [/privacy](./app/privacy/page.tsx) for the public “How it works & privacy” copy.

## Setup

```bash
npm install
```

Add your Anthropic key to `.env.local` (never exposed to the client):

```
ANTHROPIC_API_KEY=sk-...
SCAMSCAN_MODEL=claude-haiku-4-5   # structured signal JSON — Haiku is ~3× cheaper than Sonnet; override if needed
SCAMSCAN_IP_PER_MINUTE=5
SCAMSCAN_GLOBAL_PER_MINUTE=10
SCAMSCAN_DAILY_CAP=1000
NEXT_PUBLIC_SITE_URL=https://your-domain.com
SCAMSCAN_STATS_TOKEN=long-random-secret

# Recommended on Vercel for durable rate limits:
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

If the key is missing or the classifier call fails, deterministic checks still run and the verdict honestly degrades to "insufficient evidence" instead of a false "low risk".

```bash
npm run dev      # local server
npm run check    # offline acceptance suite
```

## Deploy

1. Push to GitHub and import into Vercel (CI runs `check` + `build` on PRs).
2. Set `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_URL`, and ideally Upstash Redis REST credentials.
3. Optionally set `SCAMSCAN_STATS_TOKEN`, model, and rate-limit env vars.
4. Deploy. Keep the API route on the Node runtime (default).

## Budget guards & usage tracking

- **Per IP:** 5/min · **Global:** 10/min · **Daily:** 1000/day (all configurable)
- With Upstash configured, limits are shared across Vercel instances; otherwise they fall back to in-memory per isolate
- Message capped at 6,000 characters; classifier response at 700 tokens
- `GET /api/stats?token=...` for live counters; structured `scamscan_scan` / `scamscan_feedback` log lines in Vercel; Anthropic console for exact spend

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · `@anthropic-ai/sdk` · optional Upstash Redis
