"use client";

import { useRef, useState } from "react";
import { ContactSource, Report, UserInput } from "@/lib/types";
import DeeperCheck, { DeeperState, EMPTY_DEEPER } from "./DeeperCheck";
import LinkedInCheck, {
  EMPTY_LINKEDIN,
  LinkedInState,
  linkedInTouched,
} from "./LinkedInCheck";
import ResultCard from "./ResultCard";
import { TapSelect } from "./fields";

const EXAMPLE = {
  message:
    "Hello! I'm a senior talent partner at Novatech Solutions. Your profile stood out and we'd love to offer you a remote Data Annotation role at $42/hr — no interview needed, you can start this week. To secure your spot, message me on WhatsApp at +1 (555) 013-4477 within 24 hours and we'll send your onboarding kit.",
  claimedCompany: "Novatech Solutions",
  contactSource: "linkedin" as const,
};

function buildPayload(
  message: string,
  contactSource: ContactSource | "",
  claimedCompany: string,
  deeper: DeeperState,
  li: LinkedInState
): UserInput {
  const payload: UserInput = { message: message.trim() };
  if (contactSource) payload.contactSource = contactSource;
  if (claimedCompany.trim()) payload.claimedCompany = claimedCompany.trim();
  if (deeper.email.trim()) payload.email = deeper.email.trim();
  if (deeper.applicationLink.trim()) payload.applicationLink = deeper.applicationLink.trim();
  if (deeper.companyWebsite.trim()) payload.companyWebsite = deeper.companyWebsite.trim();

  if (linkedInTouched(li)) {
    payload.linkedin = {};
    if (li.verification) payload.linkedin.verification = li.verification;
    if (li.accountCreatedYear === "not_shown") payload.linkedin.accountCreatedYear = null;
    else if (/^\d{4}$/.test(li.accountCreatedYear))
      payload.linkedin.accountCreatedYear = Number(li.accountCreatedYear);
    if (li.linkedinWarningShown)
      payload.linkedin.linkedinWarningShown = li.linkedinWarningShown === "yes";
    if (li.profileEmployer.trim()) payload.linkedin.profileEmployer = li.profileEmployer.trim();
    if (li.connections) payload.linkedin.connections = li.connections;
    if (li.profileLocationMatches)
      payload.linkedin.profileLocationMatches = li.profileLocationMatches;
    if (li.activityLevel) payload.linkedin.activityLevel = li.activityLevel;
    if (li.listedOnCompanyPage) payload.linkedin.listedOnCompanyPage = li.listedOnCompanyPage;
    if (li.mutualConnections) payload.linkedin.mutualConnections = li.mutualConnections;
  }
  return payload;
}

export default function ScanForm() {
  const [message, setMessage] = useState("");
  const [contactSource, setContactSource] = useState<ContactSource | "">("");
  const [claimedCompany, setClaimedCompany] = useState("");
  const [deeper, setDeeper] = useState<DeeperState>(EMPTY_DEEPER);
  const [linkedin, setLinkedin] = useState<LinkedInState>(EMPTY_LINKEDIN);
  const [deeperOpen, setDeeperOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [thinSubmission, setThinSubmission] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);

  const isLinkedInSource = contactSource === "linkedin";

  async function scan() {
    const payload = buildPayload(message, contactSource, claimedCompany, deeper, linkedin);
    if (!payload.message) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setThinSubmission(
      !payload.email && !payload.applicationLink && !payload.companyWebsite && !payload.linkedin
    );
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(45_000),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => null);
        setError(
          data?.error ?? "Too many scans in a short time — please wait a minute and try again."
        );
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as Report;
      setReport(data);
      requestAnimationFrame(() => {
        resultRef.current?.focus({ preventScroll: true });
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch {
      setError(
        "Something went wrong on our side — nothing you pasted was stored. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function openDeeperFromNudge() {
    setDeeperOpen(true);
    requestAnimationFrame(() => emailRef.current?.focus());
  }

  function loadExample() {
    setMessage(EXAMPLE.message);
    setClaimedCompany(EXAMPLE.claimedCompany);
    setContactSource(EXAMPLE.contactSource);
    setReport(null);
    setError(null);
    requestAnimationFrame(() => messageRef.current?.focus());
  }

  function reset() {
    setMessage("");
    setContactSource("");
    setClaimedCompany("");
    setDeeper(EMPTY_DEEPER);
    setLinkedin(EMPTY_LINKEDIN);
    setDeeperOpen(false);
    setReport(null);
    setError(null);
    requestAnimationFrame(() => {
      messageRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const showNudge = report?.confidence === "low" && thinSubmission;
  const showCompanyNudge = isLinkedInSource && !claimedCompany.trim();

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          scan();
        }}
        className="rounded-[var(--radius-card)] border border-line bg-surface/95 p-6 backdrop-blur-[2px] sm:p-7"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="message" className="text-sm font-medium text-ink">
              Paste the recruiter&rsquo;s message
            </label>
            <button
              type="button"
              onClick={loadExample}
              className="text-xs text-muted underline decoration-line underline-offset-2 transition-colors hover:text-accent-ink"
            >
              Try an example
            </button>
          </div>
          <textarea
            id="message"
            ref={messageRef}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={7}
            placeholder="The full message you received — email, LinkedIn DM, WhatsApp, or text."
            className="mt-1.5 w-full resize-y rounded-[var(--radius-input)] border border-line bg-bg px-3 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-muted"
          />
        </div>

        <div className="mt-4">
          <TapSelect
            label="Where did they contact you?"
            hint="(optional)"
            value={contactSource}
            onChange={setContactSource}
            options={[
              { value: "linkedin", label: "LinkedIn" },
              { value: "email", label: "Email" },
              { value: "whatsapp", label: "WhatsApp / text" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="claimedCompany" className="text-sm font-medium text-ink">
            Company they claim to be from{" "}
            <span className="font-normal text-muted">
              {isLinkedInSource ? "(helps a lot for LinkedIn checks)" : "(optional)"}
            </span>
          </label>
          <input
            id="claimedCompany"
            ref={companyRef}
            type="text"
            value={claimedCompany}
            onChange={(e) => setClaimedCompany(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="mt-1.5 w-full rounded-[var(--radius-input)] border border-line bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-muted"
          />
          {showCompanyNudge && (
            <p className="mt-1.5 text-xs text-muted">
              Adding the claimed company unlocks employer-mismatch and People-tab checks.
            </p>
          )}
        </div>

        {isLinkedInSource && (
          <div className="mt-4">
            <label htmlFor="companyWebsiteFast" className="text-sm font-medium text-ink">
              Company&rsquo;s official website{" "}
              <span className="font-normal text-muted">(optional — big accuracy boost)</span>
            </label>
            <input
              id="companyWebsiteFast"
              type="text"
              value={deeper.companyWebsite}
              onChange={(e) => setDeeper({ ...deeper, companyWebsite: e.target.value })}
              placeholder="e.g. company.com"
              className="mt-1.5 w-full rounded-[var(--radius-input)] border border-line bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-muted"
            />
          </div>
        )}

        {isLinkedInSource && (
          <div className="mt-4">
            <LinkedInCheck value={linkedin} onChange={setLinkedin} />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="mt-5 w-full rounded-[var(--radius-input)] bg-accent px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Scanning\u2026" : "Scan this approach"}
        </button>

        <div className="mt-4 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setDeeperOpen((o) => !o)}
            aria-expanded={deeperOpen}
            className="text-sm text-muted transition-colors hover:text-accent-ink"
          >
            Add more for a deeper check{" "}
            <span aria-hidden="true">{deeperOpen ? "▴" : "▾"}</span>
          </button>
          {deeperOpen && (
            <div className="mt-4 space-y-5">
              <DeeperCheck
                value={deeper}
                onChange={setDeeper}
                emailRef={emailRef}
                hideCompanyWebsite={isLinkedInSource}
              />
              {!isLinkedInSource && (
                <LinkedInCheck value={linkedin} onChange={setLinkedin} />
              )}
            </div>
          )}
        </div>
      </form>

      {loading && (
        <p className="text-center text-sm text-muted" role="status" aria-live="polite">
          Scanning…
        </p>
      )}

      {error && (
        <div
          className="rounded-[var(--radius-card)] border border-line bg-surface p-5 text-center"
          role="alert"
        >
          <p className="text-[15px] text-ink">{error}</p>
          <button
            type="button"
            onClick={scan}
            className="mt-3 rounded-[var(--radius-input)] border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent-ink"
          >
            Try again
          </button>
        </div>
      )}

      {report && (
        <div ref={resultRef} tabIndex={-1} className="space-y-3 outline-none">
          <ResultCard report={report} />
          {showNudge && (
            <button
              type="button"
              onClick={openDeeperFromNudge}
              className="w-full rounded-[var(--radius-input)] border border-dashed border-line bg-surface px-4 py-3 text-left text-sm text-muted transition-colors hover:border-accent hover:text-accent-ink"
            >
              Add the sender&rsquo;s email or the application link to raise confidence →
            </button>
          )}
          <div className="text-center">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-muted underline decoration-line underline-offset-2 transition-colors hover:text-accent-ink"
            >
              Scan another message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
