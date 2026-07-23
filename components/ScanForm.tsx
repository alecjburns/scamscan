"use client";

import { useRef, useState } from "react";
import { ContactSource, Report, UserInput } from "@/lib/types";
import ChannelDetails, { DeeperState, EMPTY_DEEPER } from "./DeeperCheck";
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

const CHANNEL_HEADING: Record<ContactSource, string> = {
  linkedin: "LinkedIn details",
  email: "Email details",
  whatsapp: "WhatsApp / text details",
  other: "More details",
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [thinSubmission, setThinSubmission] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  async function scan() {
    if (!message.trim()) {
      setFormError("Paste the recruiter's message to continue.");
      messageRef.current?.focus();
      return;
    }
    if (!contactSource) {
      setFormError("Choose where they contacted you.");
      return;
    }
    setFormError(null);

    const payload = buildPayload(message, contactSource, claimedCompany, deeper, linkedin);
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
        "Something went wrong on our side — we don't keep what you pasted. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function focusDetails() {
    requestAnimationFrame(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      (emailRef.current ?? linkRef.current)?.focus();
    });
  }

  function loadExample() {
    setMessage(EXAMPLE.message);
    setClaimedCompany(EXAMPLE.claimedCompany);
    setContactSource(EXAMPLE.contactSource);
    setReport(null);
    setError(null);
    setFormError(null);
    requestAnimationFrame(() => messageRef.current?.focus());
  }

  function reset() {
    setMessage("");
    setContactSource("");
    setClaimedCompany("");
    setDeeper(EMPTY_DEEPER);
    setLinkedin(EMPTY_LINKEDIN);
    setReport(null);
    setError(null);
    setFormError(null);
    requestAnimationFrame(() => {
      messageRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const showNudge = report?.confidence === "low" && thinSubmission;
  const nudgeCopy =
    contactSource === "email"
      ? "Add the sender's email or the company's website to raise confidence →"
      : contactSource === "whatsapp"
        ? "Add a link they sent or the company's website to raise confidence →"
        : contactSource === "linkedin"
          ? "Add profile answers or the company's website to raise confidence →"
          : "Add an email, link, or company website to raise confidence →";

  return (
    <div className="space-y-5 sm:space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          scan();
        }}
        className="rounded-[var(--radius-card)] border border-line bg-surface/95 p-4 backdrop-blur-[2px] sm:p-7"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor="message" className="text-sm font-medium text-ink">
              Paste the recruiter&rsquo;s message
              <span className="ml-0.5 text-accent" aria-hidden="true">
                *
              </span>
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
            onChange={(e) => {
              setMessage(e.target.value);
              if (formError) setFormError(null);
            }}
            rows={6}
            placeholder="The full message you received."
            className="mt-1.5 w-full resize-y rounded-[var(--radius-input)] border border-line bg-bg px-3 py-2.5 text-base leading-relaxed text-ink placeholder:text-muted sm:text-[15px]"
          />
        </div>

        <div className="mt-5">
          <TapSelect
            label="Where did they contact you?"
            required
            value={contactSource}
            onChange={(v) => {
              setContactSource(v);
              if (formError) setFormError(null);
            }}
            options={[
              { value: "linkedin", label: "LinkedIn" },
              { value: "email", label: "Email" },
              { value: "whatsapp", label: "WhatsApp / text" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>

        <div className="mt-5">
          <label htmlFor="claimedCompany" className="text-sm font-medium text-ink">
            Company they claim to be from
          </label>
          <input
            id="claimedCompany"
            type="text"
            value={claimedCompany}
            onChange={(e) => setClaimedCompany(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="mt-1.5 w-full rounded-[var(--radius-input)] border border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-muted sm:py-2 sm:text-[15px]"
          />
          {contactSource === "linkedin" && !claimedCompany.trim() && (
            <p className="mt-1.5 text-xs text-muted">
              Helps check whether their profile employer matches who they say they&rsquo;re hiring
              for.
            </p>
          )}
        </div>

        {contactSource && (
          <div ref={detailsRef} className="mt-6 space-y-4 border-t border-line pt-5">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-medium text-ink">
              {CHANNEL_HEADING[contactSource]}
            </h2>

            {contactSource === "linkedin" && (
              <LinkedInCheck value={linkedin} onChange={setLinkedin} />
            )}

            <ChannelDetails
              source={contactSource}
              value={deeper}
              onChange={setDeeper}
              emailRef={emailRef}
              linkRef={linkRef}
            />
          </div>
        )}

        {formError && (
          <p className="mt-4 text-sm text-[var(--r-high)]" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="mt-5 w-full rounded-[var(--radius-input)] bg-accent px-4 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
        >
          {loading ? "Scanning\u2026" : "Scan this approach"}
        </button>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          The message text is sent once to Anthropic&rsquo;s Claude API to classify wording
          patterns. ScamScan does not store what you paste, create accounts, or scrape LinkedIn.{" "}
          <a href="/privacy" className="text-accent-ink underline decoration-line underline-offset-2">
            Privacy details
          </a>
        </p>
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
            className="mt-3 min-h-10 rounded-[var(--radius-input)] border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent-ink"
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
              onClick={focusDetails}
              className="w-full rounded-[var(--radius-input)] border border-dashed border-line bg-surface px-4 py-3 text-left text-sm text-muted transition-colors hover:border-accent hover:text-accent-ink"
            >
              {nudgeCopy}
            </button>
          )}
          <div className="text-center">
            <button
              type="button"
              onClick={reset}
              className="min-h-10 text-sm text-muted underline decoration-line underline-offset-2 transition-colors hover:text-accent-ink"
            >
              Scan another message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
