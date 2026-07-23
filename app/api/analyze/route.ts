import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { assess } from "@/lib/analyze";
import { CLASSIFIER_SYSTEM, parseSignals, sanitizeSignals } from "@/lib/prompt";
import { Signals, UserInput } from "@/lib/types";
import { checkLimits, recordRejection, recordScan } from "@/lib/usage";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.SCAMSCAN_MODEL ?? "claude-sonnet-5";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

const LIMIT_MESSAGES: Record<string, string> = {
  perIp: "Too many scans from your connection — please wait a minute and try again.",
  global: "ScamScan is busy right now — please try again in a minute.",
  dailyCap: "ScamScan has reached its daily scan limit — please come back tomorrow.",
};

const str = (v: unknown, max = 300) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

function sanitizeInput(raw: unknown): UserInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const message = str(r.message, 6000);
  if (!message) return null;

  const input: UserInput = { message };
  if (["linkedin", "email", "whatsapp", "other"].includes(r.contactSource as string))
    input.contactSource = r.contactSource as UserInput["contactSource"];
  input.claimedCompany = str(r.claimedCompany);
  input.email = str(r.email);
  input.applicationLink = str(r.applicationLink, 2000);
  input.companyWebsite = str(r.companyWebsite);

  if (r.linkedin && typeof r.linkedin === "object") {
    const li = r.linkedin as Record<string, unknown>;
    const linkedin: NonNullable<UserInput["linkedin"]> = {};
    if (["none", "identity", "workplace", "unknown"].includes(li.verification as string))
      linkedin.verification = li.verification as NonNullable<UserInput["linkedin"]>["verification"];
    linkedin.profileEmployer = str(li.profileEmployer);
    if (["lt50", "50to500", "gt500", "unknown"].includes(li.connections as string))
      linkedin.connections = li.connections as NonNullable<UserInput["linkedin"]>["connections"];
    const ynu = ["yes", "no", "unknown"];
    if (ynu.includes(li.profileLocationMatches as string))
      linkedin.profileLocationMatches = li.profileLocationMatches as "yes" | "no" | "unknown";
    if (["none", "some", "regular", "unknown"].includes(li.activityLevel as string))
      linkedin.activityLevel = li.activityLevel as "none" | "some" | "regular" | "unknown";
    if (["none", "few", "some", "many", "unknown"].includes(li.postEngagement as string))
      linkedin.postEngagement = li.postEngagement as NonNullable<UserInput["linkedin"]>["postEngagement"];
    if (ynu.includes(li.listedOnCompanyPage as string))
      linkedin.listedOnCompanyPage = li.listedOnCompanyPage as "yes" | "no" | "unknown";
    if (ynu.includes(li.mutualConnections as string))
      linkedin.mutualConnections = li.mutualConnections as "yes" | "no" | "unknown";
    if (Object.values(linkedin).some((v) => v !== undefined)) input.linkedin = linkedin;
  }
  return input;
}

export async function POST(req: NextRequest) {
  const started = Date.now();

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "invalid JSON body" }, { status: 400 }); }

  const input = sanitizeInput(body);
  if (!input) return NextResponse.json({ error: "message required" }, { status: 400 });

  // Rate-limit only after validation so junk POSTs don't burn the budget.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limited = await checkLimits(ip);
  if (limited) {
    recordRejection(limited);
    return NextResponse.json({ error: LIMIT_MESSAGES[limited] }, { status: 429 });
  }

  let signals: Signals = { classifierFailed: true };
  const classifierUsed = Boolean(process.env.ANTHROPIC_API_KEY);
  let classifierError: string | null = null;

  if (classifierUsed) {
    const attempt = async () => {
      const msg = await anthropic.messages.create(
        {
          model: MODEL,
          max_tokens: 700,
          system: CLASSIFIER_SYSTEM,
          messages: [{ role: "user", content: input.message }],
        },
        { timeout: 18_000, maxRetries: 0 }
      );
      const text = msg.content
        .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
        .map((b) => b.text)
        .join("");
      return sanitizeSignals(parseSignals(text));
    };

    // One manual retry for transient Anthropic/network failures.
    for (let i = 0; i < 2; i++) {
      try {
        signals = await attempt();
        classifierError = null;
        break;
      } catch (err) {
        const e = err as {
          status?: number;
          message?: string;
          error?: { type?: string; error?: { type?: string } };
        };
        classifierError = [
          e.status ? `status=${e.status}` : null,
          e.error?.error?.type || e.error?.type || null,
          (e.message || "classifier_error").slice(0, 160),
        ]
          .filter(Boolean)
          .join(" ");
        signals = { classifierFailed: true };
        if (i === 0) await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  const report = await assess(input, signals);
  const durationMs = Date.now() - started;
  const classifierFailed = Boolean(signals.classifierFailed);
  recordScan({ riskLevel: report.risk_level, classifierUsed, classifierFailed, durationMs });
  console.log(
    JSON.stringify({
      evt: "scamscan_scan",
      ts: new Date().toISOString(),
      risk: report.risk_level,
      confidence: report.confidence,
      linkedin: report.is_linkedin,
      source: input.contactSource ?? null,
      classifierUsed,
      classifierFailed,
      classifierError,
      model: classifierUsed ? MODEL : null,
      durationMs,
    })
  );

  return NextResponse.json(report);
}
