import { Report, Finding, Signals, UserInput, RiskLevel, Confidence } from "./types";
import { scoreLinkedIn } from "./linkedin";
import { isLikelyAgencyDomain } from "./agencies";

const normalise = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");

const TWO_PART_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "com.au", "net.au", "org.au", "co.nz",
  "co.jp", "co.in", "co.za", "com.br", "com.mx", "com.sg", "com.hk", "com.tr",
  "co.kr", "com.cn",
]);

function registrableDomain(domain: string): string {
  const parts = domain.split(".").filter(Boolean);
  if (parts.length <= 2) return domain;
  const lastTwo = parts.slice(-2).join(".");
  return TWO_PART_SUFFIXES.has(lastTwo) ? parts.slice(-3).join(".") : lastTwo;
}

function domainOf(s?: string): string | undefined {
  if (!s) return undefined;
  const t = s.trim().toLowerCase();
  const email = t.match(/@([^\s/]+)/)?.[1];
  const url = t.match(/https?:\/\/([^/\s:]+)/)?.[1];
  let host = email ?? url;
  if (!host) {
    const bare = t.split(/[/?#]/)[0].split(":")[0];
    if (/^[^\s@]+\.[^\s@]+$/.test(bare)) host = bare;
  }
  if (!host) return undefined;
  host = host.replace(/^www\./, "").replace(/\.+$/, "");
  return host || undefined;
}

function levenshtein(a: string, b: string): number {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i-1][j]+1, m[i][j-1]+1, m[i-1][j-1] + (a[i-1]===b[j-1]?0:1));
  return m[a.length][b.length];
}

function isLookalike(suspect: string, official: string): boolean {
  const sReg = registrableDomain(suspect), oReg = registrableDomain(official);
  const s = normalise(sReg.split(".")[0]), o = normalise(oReg.split(".")[0]);
  if (!s || !o || s === o) return false;
  if (s.includes(o)) return true;
  if (Math.abs(s.length - o.length) <= 3 && levenshtein(s, o) <= 2) return true;
  if (o.length >= 3) {
    const sub = suspect.slice(0, suspect.length - sReg.length);
    if (normalise(sub).includes(o)) return true;
  }
  return false;
}

async function domainAgeDays(domain: string): Promise<number|null> {
  try {
    const r = await fetch(`https://rdap.org/domain/${registrableDomain(domain)}`, {
      redirect: "follow",
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 86_400 },
    } as RequestInit);
    if (!r.ok) return null;
    const data = await r.json();
    const reg = (data.events || []).find((e: { eventAction?: string }) => e.eventAction === "registration");
    if (!reg?.eventDate) return null;
    return Math.floor((Date.now() - new Date(reg.eventDate).getTime()) / 86_400_000);
  } catch { return null; }
}

export async function assess(input: UserInput, signals: Signals): Promise<Report> {
  const concerning: Finding[] = [], positive: Finding[] = [], unverified: Finding[] = [];
  const softExtra: Finding[] = [];
  const isLinkedIn = input.contactSource === "linkedin" || Boolean(input.linkedin);
  const checks_run: string[] = ["The text of the message you pasted"];
  if (!signals.classifierFailed) checks_run[0] = "Message text for recruitment-scam wording patterns";
  else checks_run.push("Message-content classifier (unavailable this time)");

  const ev = signals.evidence ?? {};
  const quote = (key: keyof Signals) => {
    const q = ev[key as string];
    return q ? ` (\u201C${q}\u201D)` : "";
  };
  const say = (id: string, key: keyof Signals, fb: string): Finding =>
    ({ id, explanation: `${fb}${quote(key)}` });

  // STEP 1: HARD OVERRIDES
  const overrides: Array<[boolean|undefined, string, keyof Signals, string]> = [
    [signals.paymentOrEquipmentRequest,"override_payment","paymentOrEquipmentRequest","You were asked to pay for equipment or fees up front — a hallmark of recruitment fraud."],
    [signals.cryptoDeposit,"override_crypto","cryptoDeposit","You were asked to deposit or transfer cryptocurrency."],
    [signals.taskJobMoneyTransfer,"override_task","taskJobMoneyTransfer","The role involves moving money or topping up an account to earn — a classic task-scam structure."],
    [signals.credentialOrSoftwareRequest,"override_cred","credentialOrSoftwareRequest","You were asked to install software, open a protected file, or hand over login details."],
  ];
  for (const [hit,id,key,msg] of overrides) if (hit) concerning.push({ id, explanation: `${msg}${quote(key)}` });

  const officialDom = domainOf(input.companyWebsite);
  const emailDom = domainOf(input.email);
  const linkDom = domainOf(input.applicationLink);
  const contactDoms = [...new Set([emailDom, linkDom].filter((d): d is string => Boolean(d)))];

  if (officialDom || contactDoms.length) {
    checks_run.push(
      officialDom
        ? `Contact domains against the official site (${officialDom})`
        : "Contact email/link domains (no official site provided)"
    );
  }

  if (officialDom && contactDoms.length) {
    let anyMatch = false;
    for (const contactDom of contactDoms) {
      if (isLookalike(contactDom, officialDom)) {
        concerning.push({
          id: `override_lookalike_${contactDom}`,
          explanation: `The contact domain "${contactDom}" imitates the company's site "${officialDom}".`,
        });
      } else if (normalise(registrableDomain(contactDom)) === normalise(registrableDomain(officialDom))) {
        anyMatch = true;
      } else if (isLikelyAgencyDomain(contactDom)) {
        softExtra.push({
          id: `agency_contact_${contactDom}`,
          explanation:
            `The contact domain "${contactDom}" looks like a third-party recruiter or jobs platform, not the hiring company "${officialDom}". That can be legitimate — still verify the assignment through the company's official channels, not any link in the message.`,
        });
      } else {
        concerning.push({
          id: `strong_domain_mismatch_${contactDom}`,
          explanation: `The email/link domain "${contactDom}" doesn't match the company's site "${officialDom}".`,
        });
      }
    }
    if (anyMatch && !concerning.some((c) => c.id.startsWith("override_lookalike")))
      positive.push({ id: "domain_match", explanation: "At least one contact domain matches the company's official site." });
  } else if (!officialDom && contactDoms.length) {
    unverified.push({
      id: "no_official_domain",
      explanation: "You didn't provide the company's official website, so we couldn't confirm the email/link domain.",
    });
  }

  // Email and application-link domains disagree with each other
  if (emailDom && linkDom && normalise(registrableDomain(emailDom)) !== normalise(registrableDomain(linkDom))) {
    if (!isLookalike(emailDom, linkDom)) {
      softExtra.push({
        id: "contact_domains_disagree",
        explanation: `The sender's email domain ("${emailDom}") and the application link domain ("${linkDom}") don't match each other.`,
      });
    }
  }

  const hasHardOverride = concerning.some((c) => c.id.startsWith("override_"));

  // STEP 2: STRONG SIGNALS
  const strong: Finding[] = [];
  if (signals.platformSwitchPressure) strong.push(say("platform_switch","platformSwitchPressure","You were pushed to move to WhatsApp/Telegram quickly."));
  if (signals.offerWithoutInterview) strong.push(say("no_interview","offerWithoutInterview","An offer or next step came with no real interview."));
  if (signals.sensitiveInfoRequest) strong.push(say("sensitive_info","sensitiveInfoRequest","You were asked for bank or identity details early on."));
  for (const c of concerning.filter((x) => x.id.startsWith("strong_domain_mismatch"))) strong.push(c);

  const ageDomains = [...new Set(contactDoms.map(registrableDomain))];
  if (ageDomains.length) checks_run.push("Domain registration age (via public RDAP records)");
  const ages = await Promise.all(ageDomains.map(domainAgeDays));
  ageDomains.forEach((d, i) => {
    const age = ages[i];
    if (age !== null && age < 30)
      strong.push({ id: `new_domain_${d}`, explanation: `The domain "${d}" was registered ${age} days ago.` });
  });

  let liSoft: Finding[] = [];
  const hasLinkedInAnswers = Boolean(
    input.linkedin && Object.values(input.linkedin).some((v) => v !== undefined && v !== "")
  );
  if (hasLinkedInAnswers) {
    checks_run.push("LinkedIn profile answers you reported");
    const li = scoreLinkedIn(
      { ...input.linkedin, claimedHiringCompany: input.claimedCompany, claimsSeniorRole: signals.claimsSeniorRole }
    );
    strong.push(...li.strong);
    positive.push(...li.positive);
    liSoft = li.soft;
  } else if (isLinkedIn) {
    checks_run.push("LinkedIn as the contact channel (no profile answers filled in)");
  }
  for (const s of strong) if (!concerning.some((c) => c.id === s.id)) concerning.push(s);
  const strongCount = strong.length;

  // STEP 3: SOFT / BLEND
  const softHits =
    [signals.vagueRoleHighPay, signals.genericMassMessage, signals.urgencyOrSecrecy].filter(Boolean).length +
    liSoft.length +
    softExtra.length;
  for (const s of [...liSoft, ...softExtra])
    if (!concerning.some((c) => c.id === s.id)) concerning.push(s);
  for (const [flag, id, key, msg] of [
    [signals.vagueRoleHighPay, "soft_vague_pay", "vagueRoleHighPay", "High pay for a vaguely described role."],
    [signals.genericMassMessage, "soft_generic", "genericMassMessage", "The message reads like a generic mass send, not tailored to you."],
    [signals.urgencyOrSecrecy, "soft_urgency", "urgencyOrSecrecy", "There's unusual urgency or secrecy."],
  ] as Array<[boolean | undefined, string, keyof Signals, string]>)
    if (flag) concerning.push({ id, explanation: `${msg}${quote(key)}` });
  (signals.couldNotDetermine ?? []).forEach((c, i) =>
    unverified.push({ id: `llm_unverified_${i}`, explanation: c })
  );
  if (signals.classifierFailed)
    unverified.push({
      id: "classifier_unavailable",
      explanation:
        "The AI wording check couldn't run this time (temporary service issue). Try scanning again — domain and profile checks below still apply.",
    });

  let risk_level: RiskLevel;
  if (hasHardOverride)
    risk_level =
      signals.cryptoDeposit ||
      signals.credentialOrSoftwareRequest ||
      concerning.some((c) => c.id.startsWith("override_lookalike"))
        ? "critical_risk"
        : "high_risk";
  else if (strongCount >= 2) risk_level = "high_risk";
  else if (strongCount === 1) risk_level = "some_concerns";
  else {
    const cov = [input.email, input.applicationLink, input.companyWebsite, input.linkedin].filter(Boolean).length;
    if (!input.message?.trim() || (cov === 0 && concerning.length === 0 && input.message.trim().length < 40))
      risk_level = "insufficient_evidence";
    else if (softHits >= 2) risk_level = "some_concerns";
    else risk_level = signals.classifierFailed ? "insufficient_evidence" : "low_apparent_risk";
  }

  const coverage = [
    input.email,
    input.applicationLink,
    input.companyWebsite,
    input.linkedin,
    input.claimedCompany,
  ].filter(Boolean).length;
  let confidence: Confidence;
  if (risk_level === "high_risk" || risk_level === "critical_risk")
    confidence = coverage >= 2 ? "high" : "medium";
  else if (risk_level === "insufficient_evidence") confidence = "low";
  else confidence = coverage >= 2 ? "medium" : "low";

  const advice = buildGuidance(risk_level, isLinkedIn, {
    classifierFailed: Boolean(signals.classifierFailed),
    coverage,
  });

  return {
    risk_level,
    confidence,
    is_linkedin: isLinkedIn,
    findings: { concerning, positive, unverified },
    recommended_action: advice.summary,
    guidance: { do: advice.do, dont: advice.dont },
    checks_run,
    classifier_failed: Boolean(signals.classifierFailed) || undefined,
  };
}

function buildGuidance(
  level: RiskLevel,
  isLinkedIn: boolean,
  opts: { classifierFailed: boolean; coverage: number }
): { summary: string; do: string[]; dont: string[] } {
  const reportOnLinkedIn = isLinkedIn
    ? "On LinkedIn: More → Report (you can report without notifying them)"
    : null;

  switch (level) {
    case "critical_risk":
    case "high_risk":
      return {
        summary:
          "Stop engaging with this approach. Verify anything that still looks real only through channels you find yourself.",
        do: [
          "Find the company yourself (search / official site) and contact careers or HR that way",
          reportOnLinkedIn,
          "Keep a copy of the message if you may report it later",
        ].filter((x): x is string => Boolean(x)),
        dont: [
          "Don't reply, click links, or open attachments from the message",
          "Don't send money, crypto, ID documents, passwords, or one-time codes",
          "Don't move the chat to WhatsApp, Telegram, or SMS because they asked",
        ],
      };
    case "some_concerns":
      return {
        summary:
          "Treat this carefully — verify independently before you share anything or click links.",
        do: [
          "Check the company on its official website (not a link they sent)",
          "Prefer a corporate email domain or a video call you set up",
          reportOnLinkedIn && "If it still feels wrong, report the LinkedIn message (More → Report)",
        ].filter((x): x is string => Boolean(x)),
        dont: [
          "Don't click application or calendar links from the message yet",
          "Don't share bank details, ID, or login credentials",
          "Don't pay for equipment, training, or 'onboarding' fees",
        ],
      };
    case "low_apparent_risk":
      return {
        summary:
          "No major red flags in what you provided — that still isn't proof the role is real.",
        do: [
          "Confirm the recruiter and role via the company's official careers page or phone",
          "Use contact details you find yourself, not only what was in the message",
        ],
        dont: [
          "Don't treat this result as confirmation the opportunity is genuine",
          "Don't skip checks because nothing looked suspicious",
          "Don't share sensitive personal info until you've verified independently",
        ],
      };
    default:
      if (opts.classifierFailed) {
        return {
          summary:
            opts.coverage > 0
              ? "The AI wording check failed this time, so we can't clear or escalate based on the message text. Hit Scan again in a moment — your other details are already filled in."
              : "The AI wording check failed this time. Try scanning again in a moment. Adding an email, link, or company website also helps if the wording check is unavailable.",
          do: [
            "Scan again in a moment",
            opts.coverage === 0 ? "Add a sender email, link, or company website if you have one" : null,
          ].filter((x): x is string => Boolean(x)),
          dont: [
            "Don't assume the approach is safe just because this scan couldn't finish",
            "Don't click links or send documents while you're waiting",
          ],
        };
      }
      return {
        summary:
          "There wasn't enough here to assess. Paste the full message and add the sender's email or the application link for a useful check.",
        do: [
          "Paste the full message (not a short snippet)",
          "Add the sender's email, a link they sent, or the company website",
        ],
        dont: [
          "Don't assume no result means low risk",
          "Don't reply or click links until you've got a clearer scan",
        ],
      };
  }
}
