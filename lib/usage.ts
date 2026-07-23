// Rate limiting + usage counters — primary Anthropic spend guard.
// Prefer Upstash Redis (shared across all Vercel isolates). Without it,
// counters are in-memory per instance and are NOT a hard budget guarantee.
//
// Never stores message content; IPs only live in rolling window keys.

const WINDOW_MS = 60_000;

function envInt(name: string, fallback: number, min = 1): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n >= min ? Math.floor(n) : fallback;
}

const ON_VERCEL = process.env.VERCEL === "1";
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
export const usingDurableLimits = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

// Tight defaults. On Vercel without Redis, go even tighter (emergency mode).
const EMERGENCY = ON_VERCEL && !usingDurableLimits;
const IP_PER_MINUTE = envInt(
  "SCAMSCAN_IP_PER_MINUTE",
  EMERGENCY ? 2 : 3
);
const GLOBAL_PER_MINUTE = envInt(
  "SCAMSCAN_GLOBAL_PER_MINUTE",
  EMERGENCY ? 3 : 5
);
const DAILY_CAP = envInt(
  "SCAMSCAN_DAILY_CAP",
  EMERGENCY ? 80 : 150
);

// When Redis is configured, never fall open to looser in-memory limits.
const FAIL_CLOSED_ON_REDIS_ERROR =
  usingDurableLimits || process.env.SCAMSCAN_FAIL_CLOSED_LIMITS === "1";

if (EMERGENCY && typeof console !== "undefined") {
  console.error(
    JSON.stringify({
      evt: "scamscan_limit_warning",
      msg: "Running on Vercel without Upstash — rate limits are per-instance only. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN immediately to protect Anthropic spend.",
      ipPerMinute: IP_PER_MINUTE,
      globalPerMinute: GLOBAL_PER_MINUTE,
      dailyCap: DAILY_CAP,
    })
  );
}

async function redisCmd(...args: (string | number)[]): Promise<unknown> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) throw new Error("redis not configured");
  const path = args.map((a) => encodeURIComponent(String(a))).join("/");
  const r = await fetch(`${UPSTASH_URL}/${path}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    cache: "no-store",
    signal: AbortSignal.timeout(2500),
  });
  if (!r.ok) throw new Error(`upstash ${r.status}`);
  const data = (await r.json()) as { result: unknown };
  return data.result;
}

// --- in-memory fallback ---
const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];
let capDay = "", capCount = 0;

function memoryIpLimited(ip: string, now: number): boolean {
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  if (ipHits.size > 10_000) ipHits.clear();
  ipHits.set(ip, recent);
  return recent.length > IP_PER_MINUTE;
}

function memoryGlobalLimited(now: number): boolean {
  globalHits = globalHits.filter((t) => now - t < WINDOW_MS);
  globalHits.push(now);
  return globalHits.length > GLOBAL_PER_MINUTE;
}

function memoryDailyCap(now: Date): boolean {
  const today = now.toDateString();
  if (today !== capDay) {
    capDay = today;
    capCount = 0;
  }
  return ++capCount > DAILY_CAP;
}

async function redisWindowLimited(key: string, max: number): Promise<boolean> {
  const n = Number(await redisCmd("INCR", key));
  if (n === 1) await redisCmd("PEXPIRE", key, WINDOW_MS);
  return n > max;
}

async function redisDailyCap(): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const key = `scamscan:day:${day}`;
  const n = Number(await redisCmd("INCR", key));
  if (n === 1) await redisCmd("EXPIRE", key, 90_000); // ~25h
  return n > DAILY_CAP;
}

export type RejectionKind = "perIp" | "global" | "dailyCap";

/** Returns which limit tripped, or null if allowed. */
export async function checkLimits(ip: string): Promise<RejectionKind | null> {
  const now = Date.now();

  if (usingDurableLimits) {
    try {
      if (await redisWindowLimited(`scamscan:ip:${ip}`, IP_PER_MINUTE)) return "perIp";
      if (await redisWindowLimited("scamscan:global", GLOBAL_PER_MINUTE)) return "global";
      if (await redisDailyCap()) return "dailyCap";
      return null;
    } catch (err) {
      console.error(
        JSON.stringify({
          evt: "scamscan_redis_limit_error",
          error: String(err).slice(0, 200),
          failClosed: FAIL_CLOSED_ON_REDIS_ERROR,
        })
      );
      // Never fall open to weaker per-instance limits when Redis was supposed
      // to be the spend guard.
      if (FAIL_CLOSED_ON_REDIS_ERROR) return "global";
    }
  }

  if (memoryIpLimited(ip, now)) return "perIp";
  if (memoryGlobalLimited(now)) return "global";
  if (memoryDailyCap(new Date(now))) return "dailyCap";
  return null;
}

/** Sync helpers kept for offline acceptance tests (memory path only). */
export function ipLimited(ip: string, now = Date.now()): boolean {
  return memoryIpLimited(ip, now);
}
export function globalLimited(now = Date.now()): boolean {
  return memoryGlobalLimited(now);
}

const stats = {
  startedAt: new Date().toISOString(),
  scans: 0,
  classifierCalls: 0,
  classifierFailures: 0,
  feedback: { up: 0, down: 0 },
  rejected: { perIp: 0, global: 0, dailyCap: 0 } as Record<RejectionKind, number>,
  byRiskLevel: {} as Record<string, number>,
  totalDurationMs: 0,
};

export function recordRejection(kind: RejectionKind) {
  stats.rejected[kind]++;
}

export function recordScan(r: {
  riskLevel: string;
  classifierUsed: boolean;
  classifierFailed: boolean;
  durationMs: number;
}) {
  stats.scans++;
  if (r.classifierUsed) stats.classifierCalls++;
  if (r.classifierFailed) stats.classifierFailures++;
  stats.byRiskLevel[r.riskLevel] = (stats.byRiskLevel[r.riskLevel] ?? 0) + 1;
  stats.totalDurationMs += r.durationMs;
}

export function recordFeedback(useful: "up" | "down") {
  stats.feedback[useful]++;
}

export function getStats() {
  return {
    startedAt: stats.startedAt,
    scans: stats.scans,
    classifierCalls: stats.classifierCalls,
    classifierFailures: stats.classifierFailures,
    feedback: { ...stats.feedback },
    rejected: { ...stats.rejected },
    byRiskLevel: { ...stats.byRiskLevel },
    avgDurationMs: stats.scans ? Math.round(stats.totalDurationMs / stats.scans) : 0,
    limits: {
      ipPerMinute: IP_PER_MINUTE,
      globalPerMinute: GLOBAL_PER_MINUTE,
      dailyCap: DAILY_CAP,
      durable: usingDurableLimits,
      emergencyNoRedis: EMERGENCY,
      onVercel: ON_VERCEL,
    },
    scansLeftToday: usingDurableLimits ? null : Math.max(0, DAILY_CAP - capCount),
    note: usingDurableLimits
      ? "Limits are backed by Upstash Redis (shared across instances)."
      : EMERGENCY
        ? "CRITICAL: Vercel without Upstash — limits are per-instance only (emergency tighter caps active). Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN."
        : "In-memory, per-instance; set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for durable limits.",
  };
}
