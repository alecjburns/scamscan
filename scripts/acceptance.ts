import { assess } from "../lib/analyze";
import { parseSignals, sanitizeSignals } from "../lib/prompt";
import { globalLimited, ipLimited } from "../lib/usage";

// Stub RDAP so tests are deterministic and offline. Domains containing
// "fresh" report a 10-day-old registration; everything else is 900 days old.
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
  const u = String(url);
  if (u.startsWith("https://rdap.org/domain/")) {
    const domain = u.split("/").pop() ?? "";
    const daysAgo = domain.includes("fresh") ? 10 : 900;
    return new Response(
      JSON.stringify({
        events: [{ eventAction: "registration", eventDate: new Date(Date.now() - daysAgo * 86_400_000).toISOString() }],
      }),
      { status: 200 }
    );
  }
  return realFetch(url, init);
}) as typeof fetch;

let failures = 0;
function check(name: string, cond: boolean, detail?: string) {
  if (cond) console.log(`PASS  ${name}`);
  else {
    failures++;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const BENIGN =
  "We saw your profile and think you would be a great fit for our open data analyst role at our firm.";

async function main() {
  // 1. Message-only submission returns a verdict; no errors on missing optional fields
  const r1 = await assess({ message: BENIGN }, {});
  check("message-only submission returns a verdict", Boolean(r1.risk_level && r1.confidence));

  // 2. Up-front equipment-payment -> high/critical regardless of positive signals
  const r2 = await assess(
    {
      message: "Please pay $300 for your laptop and we will reimburse you after onboarding.",
      claimedCompany: "Acme",
      linkedin: { verification: "verified", hasPosts: "yes", postEngagement: "many" },
    },
    { paymentOrEquipmentRequest: true }
  );
  check(
    "equipment-payment -> high/critical despite positives",
    r2.risk_level === "high_risk" || r2.risk_level === "critical_risk",
    `got ${r2.risk_level}`
  );

  // 3. Verified LinkedIn + crypto-deposit -> still critical
  const r3 = await assess(
    {
      message: "Deposit 0.1 BTC to activate your work account.",
      linkedin: { verification: "verified", hasPosts: "yes", postEngagement: "many" },
    },
    { cryptoDeposit: true }
  );
  check("verified LinkedIn + crypto -> critical", r3.risk_level === "critical_risk", `got ${r3.risk_level}`);

  // 4. Never low_apparent_risk with high confidence
  const probes = [
    await assess({ message: BENIGN }, {}),
    await assess(
      {
        message: BENIGN,
        claimedCompany: "Acme",
        companyWebsite: "acme.com",
        email: "recruiter@acme.com",
        linkedin: { verification: "premium", hasPosts: "yes", postEngagement: "some" },
      },
      {}
    ),
  ];
  check(
    "no low_apparent_risk with confidence high",
    probes.every((p) => !(p.risk_level === "low_apparent_risk" && p.confidence === "high")),
    probes.map((p) => `${p.risk_level}/${p.confidence}`).join(", ")
  );

  // 5. Absence of a LinkedIn verification badge never adds a concerning finding on its own
  const r5 = await assess({ message: BENIGN, linkedin: { verification: "none" } }, {});
  check(
    "no-badge adds no concerning finding",
    r5.findings.concerning.length === 0,
    JSON.stringify(r5.findings.concerning)
  );

  // 6. Thin input -> insufficient_evidence, confidence low
  const r6 = await assess({ message: "Hi, job for you" }, {});
  check(
    "thin input -> insufficient_evidence/low",
    r6.risk_level === "insufficient_evidence" && r6.confidence === "low",
    `got ${r6.risk_level}/${r6.confidence}`
  );

  // 7. Domain mismatch alone counts as one strong signal -> some_concerns
  const r7 = await assess(
    { message: BENIGN, companyWebsite: "acme.com", email: "hr@totally-different-agency.net" },
    {}
  );
  check(
    "domain mismatch alone -> some_concerns",
    r7.risk_level === "some_concerns" &&
      r7.findings.concerning.some((c) => c.id.startsWith("strong_domain_mismatch")),
    `got ${r7.risk_level}`
  );

  // 8. Domain mismatch + one more strong signal -> high_risk
  const r8 = await assess(
    { message: BENIGN, companyWebsite: "acme.com", email: "hr@totally-different-agency.net" },
    { platformSwitchPressure: true }
  );
  check("mismatch + platform switch -> high_risk", r8.risk_level === "high_risk", `got ${r8.risk_level}`);

  // 9. A single freshly registered domain counts once, not twice
  const r9 = await assess({ message: BENIGN, applicationLink: "https://apply.fresh-hire-portal.com/form" }, {});
  const newDomainFindings = r9.findings.concerning.filter((c) => c.id.startsWith("new_domain"));
  check(
    "single new domain counts once -> some_concerns",
    r9.risk_level === "some_concerns" && newDomainFindings.length === 1,
    `got ${r9.risk_level}, ${newDomainFindings.length} new_domain finding(s)`
  );

  // 10. Brand-as-subdomain lookalike -> critical
  const r10 = await assess(
    { message: BENIGN, companyWebsite: "acme.com", email: "recruiter@acme.evil-corp.com" },
    {}
  );
  check(
    "brand-as-subdomain lookalike -> critical",
    r10.risk_level === "critical_risk" &&
      r10.findings.concerning.some((c) => c.id.startsWith("override_lookalike")),
    `got ${r10.risk_level}`
  );

  // 11. Two-part public suffix: scam.co.uk vs acme.co.uk is a mismatch, not a match
  const r11 = await assess(
    { message: BENIGN, companyWebsite: "acme.co.uk", email: "hr@unrelated-agency.co.uk" },
    {}
  );
  check(
    "co.uk domains don't falsely match",
    r11.findings.concerning.some((c) => c.id.startsWith("strong_domain_mismatch")) &&
      !r11.findings.positive.some((p) => p.id === "domain_match"),
    JSON.stringify(r11.findings)
  );

  // 12. Classifier evidence quotes surface in explanations
  const r12 = await assess(
    { message: BENIGN },
    { platformSwitchPressure: true, evidence: { platformSwitchPressure: "add me on WhatsApp now" } }
  );
  check(
    "evidence quote surfaces in finding",
    r12.findings.concerning.some((c) => c.explanation.includes("add me on WhatsApp now")),
    JSON.stringify(r12.findings.concerning)
  );

  // 13. parseSignals handles fences and prose; sanitizeSignals drops junk
  const parsed = sanitizeSignals(
    parseSignals('Here you go:\n```json\n{"cryptoDeposit": true, "bogusKey": true, "evidence": {"cryptoDeposit": "send BTC"}, "couldNotDetermine": [42, "note"]}\n```')
  );
  check(
    "parse + sanitize classifier output",
    parsed.cryptoDeposit === true &&
      !("bogusKey" in parsed) &&
      parsed.evidence?.cryptoDeposit === "send BTC" &&
      parsed.couldNotDetermine?.length === 1,
    JSON.stringify(parsed)
  );

  // 14. Failed/skipped classifier can never produce a low-risk verdict
  const r14 = await assess({ message: BENIGN }, { classifierFailed: true });
  check(
    "classifier failure -> insufficient_evidence with a note",
    r14.risk_level === "insufficient_evidence" &&
      r14.findings.unverified.some((u) => u.id === "classifier_unavailable"),
    `got ${r14.risk_level}`
  );

  // 15. Classifier failure never blocks a deterministic escalation
  const r15 = await assess(
    { message: BENIGN, companyWebsite: "acme.com", email: "recruiter@acme.evil-corp.com" },
    { classifierFailed: true }
  );
  check("classifier failure still allows critical", r15.risk_level === "critical_risk", `got ${r15.risk_level}`);

  // 16. Employer mismatch alone is one strong signal -> some_concerns
  const r16 = await assess(
    {
      message: BENIGN,
      contactSource: "linkedin",
      claimedCompany: "Acme",
      linkedin: { profileEmployer: "OtherCorp Staffing" },
    },
    {}
  );
  check(
    "employer mismatch -> some_concerns",
    r16.risk_level === "some_concerns" &&
      r16.findings.concerning.some((c) => c.id === "li_employer_mismatch"),
    `got ${r16.risk_level}`
  );

  // 17. No posts is a soft concern
  const r17 = await assess(
    {
      message: BENIGN,
      contactSource: "linkedin",
      linkedin: { hasPosts: "no" },
    },
    {}
  );
  check(
    "no posts -> soft finding",
    r17.findings.concerning.some((c) => c.id === "li_no_posts"),
    `got ${r17.risk_level} ${JSON.stringify(r17.findings.concerning.map((c) => c.id))}`
  );

  // 18. Zero engagement (with posts) is soft; with employer mismatch → high_risk
  const r18a = await assess(
    {
      message: BENIGN,
      contactSource: "linkedin",
      linkedin: { hasPosts: "yes", postEngagement: "none" },
    },
    {}
  );
  check(
    "zero engagement -> soft finding",
    r18a.findings.concerning.some((c) => c.id === "li_no_engagement"),
    JSON.stringify(r18a.findings.concerning.map((c) => c.id))
  );

  const r18 = await assess(
    {
      message: BENIGN,
      contactSource: "linkedin",
      claimedCompany: "Acme",
      linkedin: {
        profileEmployer: "OtherCorp Staffing",
        hasPosts: "yes",
        postEngagement: "none",
        mutualConnections: "no",
      },
    },
    {}
  );
  // one strong (employer) + soft engagement → some_concerns (strongCount 1)
  check(
    "employer mismatch + zero engagement -> some_concerns",
    r18.risk_level === "some_concerns" &&
      r18.findings.concerning.some((c) => c.id === "li_employer_mismatch") &&
      r18.findings.concerning.some((c) => c.id === "li_no_engagement"),
    `got ${r18.risk_level}`
  );

  // 19. "Not sure" answers contribute nothing
  const r19 = await assess(
    {
      message: BENIGN,
      contactSource: "linkedin",
      linkedin: {
        verification: "unknown",
        hasPosts: "unknown",
        postEngagement: "unknown",
        mutualConnections: "unknown",
      },
    },
    {}
  );
  check(
    "all not-sure answers add no concerning findings",
    r19.findings.concerning.length === 0,
    JSON.stringify(r19.findings.concerning)
  );

  // 20. contactSource=linkedin alone marks the report as LinkedIn
  const r20 = await assess({ message: BENIGN, contactSource: "linkedin" }, {});
  check("contactSource linkedin -> is_linkedin", r20.is_linkedin === true);

  // 21. Full positive profile never cancels a crypto override
  const r21 = await assess(
    {
      message: "Deposit 0.1 BTC to activate your work account.",
      contactSource: "linkedin",
      linkedin: {
        verification: "verified",
        hasPosts: "yes",
        postEngagement: "many",
        mutualConnections: "yes",
      },
    },
    { cryptoDeposit: true }
  );
  check("fully positive profile + crypto -> still critical", r21.risk_level === "critical_risk", `got ${r21.risk_level}`);

  // 22. Per-IP limiter: 5/minute allowed, 6th rejected, window ages out
  const t0 = Date.now();
  const ipResults = Array.from({ length: 6 }, () => ipLimited("test-ip", t0));
  check(
    "per-IP limit allows 5/min then rejects",
    ipResults.slice(0, 5).every((r) => !r) && ipResults[5] === true,
    JSON.stringify(ipResults)
  );
  check("per-IP window ages out after a minute", ipLimited("test-ip", t0 + 61_000) === false);

  // 23. Global limiter: 10/minute allowed, 11th rejected
  const globalResults = Array.from({ length: 11 }, () => globalLimited(t0));
  check(
    "global limit allows 10/min then rejects",
    globalResults.slice(0, 10).every((r) => !r) && globalResults[10] === true,
    JSON.stringify(globalResults)
  );

  // 24. Known staffing agency domain vs company site is soft, not strong mismatch
  const r24 = await assess(
    {
      message: BENIGN,
      companyWebsite: "acme.com",
      email: "anna@michaelpage.com",
    },
    {}
  );
  check(
    "agency domain is soft, not strong mismatch",
    r24.findings.concerning.some((c) => c.id.startsWith("agency_contact")) &&
      !r24.findings.concerning.some((c) => c.id.startsWith("strong_domain_mismatch")) &&
      r24.risk_level !== "high_risk" &&
      r24.risk_level !== "critical_risk",
    `got ${r24.risk_level} ${JSON.stringify(r24.findings.concerning)}`
  );

  // 25. Email + application link domains that disagree add a soft signal
  const r25 = await assess(
    {
      message: BENIGN,
      email: "recruiter@one-firm.com",
      applicationLink: "https://apply.other-portal.net/job/1",
      companyWebsite: "acme.com",
    },
    {}
  );
  check(
    "disagreeing contact domains surface",
    r25.findings.concerning.some((c) => c.id === "contact_domains_disagree") ||
      r25.findings.concerning.filter((c) => c.id.startsWith("strong_domain_mismatch")).length >= 2,
    JSON.stringify(r25.findings.concerning.map((c) => c.id))
  );

  // 26. Report always includes checks_run
  const r26 = await assess({ message: BENIGN }, {});
  check("checks_run present", Array.isArray(r26.checks_run) && r26.checks_run.length > 0);

  // 27. LinkedIn contact source alone does not claim profile answers were reported
  const r27 = await assess({ message: BENIGN, contactSource: "linkedin" }, { classifierFailed: true });
  check(
    "linkedin source without answers is labelled honestly",
    r27.checks_run.some((c) => c.includes("no profile answers")) &&
      !r27.checks_run.some((c) => c === "LinkedIn profile answers you reported"),
    JSON.stringify(r27.checks_run)
  );

  // 28. Classifier failure with coverage tells the user to retry, not to add more fields
  const r28 = await assess(
    {
      message: BENIGN,
      contactSource: "linkedin",
      claimedCompany: "Acme",
      linkedin: { verification: "verified", mutualConnections: "yes" },
    },
    { classifierFailed: true }
  );
  check(
    "classifier fail + coverage nudges retry",
    r28.risk_level === "insufficient_evidence" &&
      /scan again/i.test(r28.recommended_action) &&
      r28.classifier_failed === true &&
      r28.guidance.do.length > 0 &&
      r28.guidance.dont.length > 0,
    r28.recommended_action
  );

  // 29. High-risk guidance always includes hard don'ts
  const r29 = await assess(
    { message: BENIGN },
    { cryptoDeposit: true }
  );
  check(
    "critical guidance has do/dont lists",
    r29.risk_level === "critical_risk" &&
      r29.guidance.dont.some((d) => /money|crypto|password/i.test(d)) &&
      r29.guidance.do.length >= 1,
    JSON.stringify(r29.guidance)
  );

  // 30. Links/emails in the pasted message are used without separate fields
  const { applyExtractedContacts } = await import("../lib/extract");
  const extracted = applyExtractedContacts({
    message: "Apply here https://apply.fresh-hire-portal.com/x and email hr@evil.example",
    email: undefined,
    applicationLink: undefined,
  });
  check(
    "extract fills email and link from message",
    extracted.email === "hr@evil.example" &&
      (extracted.applicationLink ?? "").includes("fresh-hire-portal.com"),
    JSON.stringify(extracted)
  );
  const r30 = await assess(extracted, {});
  check(
    "extracted fresh domain still scores",
    r30.findings.concerning.some((c) => c.id.startsWith("new_domain")),
    JSON.stringify(r30.findings.concerning.map((c) => c.id))
  );

  console.log(failures ? `\n${failures} failure(s)` : "\nAll acceptance checks passed");
  process.exit(failures ? 1 : 0);
}

main();
