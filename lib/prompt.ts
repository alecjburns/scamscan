import { Signals } from "./types";

export const CLASSIFIER_SYSTEM = `You classify a recruitment message for scam indicators.
You are given ONLY the text of a message a jobseeker received. Analyse that text and nothing else.

Rules:
- Do NOT assert facts about the outside world. Do NOT guess a company's real domain, whether a person exists, or whether a link is malicious. Only report what the message text shows.
- Do NOT output a risk level, score, or verdict. Only report the signals below.
- If you cannot tell, set the field false and add a short note to couldNotDetermine.
- Reply with STRICT JSON only. No prose, no markdown, no code fences.

Return this JSON shape:
{
  "paymentOrEquipmentRequest": boolean,
  "cryptoDeposit": boolean,
  "taskJobMoneyTransfer": boolean,
  "credentialOrSoftwareRequest": boolean,
  "platformSwitchPressure": boolean,
  "offerWithoutInterview": boolean,
  "sensitiveInfoRequest": boolean,
  "vagueRoleHighPay": boolean,
  "genericMassMessage": boolean,
  "urgencyOrSecrecy": boolean,
  "claimsSeniorRole": boolean,
  "evidence": { "<signalKey>": "<short quote or paraphrase, <15 words>" },
  "couldNotDetermine": [ "<short note>" ]
}`;

export function parseSignals(raw: string): unknown {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall back to the outermost {...} block in case the model added prose.
    const start = cleaned.indexOf("{"), end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("no JSON object in classifier output");
  }
}

const BOOL_KEYS = [
  "paymentOrEquipmentRequest", "cryptoDeposit", "taskJobMoneyTransfer",
  "credentialOrSoftwareRequest", "platformSwitchPressure", "offerWithoutInterview",
  "sensitiveInfoRequest", "vagueRoleHighPay", "genericMassMessage",
  "urgencyOrSecrecy", "claimsSeniorRole",
] as const;

const cleanText = (s: string) => s.replace(/[\r\n\t]+/g, " ").trim().slice(0, 140);

/** Whitelist and clamp whatever the classifier returned — its output is
 * derived from untrusted message text, so nothing passes through unchecked. */
export function sanitizeSignals(raw: unknown): Signals {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const out: Signals = {};
  for (const k of BOOL_KEYS) if (r[k] === true) out[k] = true;
  if (r.evidence && typeof r.evidence === "object" && !Array.isArray(r.evidence)) {
    const evidence: Record<string, string> = {};
    for (const [k, v] of Object.entries(r.evidence as Record<string, unknown>).slice(0, 20))
      if (typeof v === "string" && v.trim()) evidence[k] = cleanText(v);
    out.evidence = evidence;
  }
  if (Array.isArray(r.couldNotDetermine))
    out.couldNotDetermine = r.couldNotDetermine
      .filter((x): x is string => typeof x === "string" && Boolean(x.trim()))
      .slice(0, 5)
      .map(cleanText);
  return out;
}
