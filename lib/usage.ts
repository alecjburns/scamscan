// Rate limiting + usage counters.
// Prefer Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// are set (durable across Vercel isolates). Otherwise fall back to in-memory
// per-instance counters. Never stores message content; IPs only live in a
// rolling one-minute window key that expires.

const WINDOW_MS = 60_000;
const IP_PER_MINUTE = Math.max(1, Number(process.env.SCAMSCAN_IP_PER_MINUTE) || 5);
const GLOBAL_PER_MINUTE = Math.max(1, Number(process.env.SCAMSCAN_GLOBAL_PER_MINUTE) || 10);
const DAILY_CAP = Math.max(1, Number(process.env.SCAMSCAN_DAILY_CAP) || 1000);

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
export const usingDurableLimits = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

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
  if (today !== capDay) { capDay = today; capCount = 0; }
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
  try {
    if (usingDurableLimits) {
      if (await redisWindowLimited(`scamscan:ip:${ip}`, IP_PER_MINUTE)) return "perIp";
      if (await redisWindowLimited("scamscan:global", GLOBAL_PER_MINUTE)) return "global";
      if (await redisDailyCap()) return "dailyCap";
      return null;
    }
  } catch {
    // Fall through to memory if Redis is down — better to keep serving than fail open forever.
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
    },
    scansLeftToday: usingDurableLimits ? null : Math.max(0, DAILY_CAP - capCount),
    note: usingDurableLimits
      ? "Limits are backed by Upstash Redis (shared across instances)."
      : "In-memory, per-instance; set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for durable limits. See Vercel logs and the Anthropic console for durable usage.",
  };
}
