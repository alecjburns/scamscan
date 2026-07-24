"use client";

import { useState } from "react";
import { Finding, Report } from "@/lib/types";
import RiskBadge, { riskLabel } from "./RiskBadge";

const CONFIDENCE_COPY: Record<Report["confidence"], string> = {
  high: "Higher confidence — your extra details backed up the message-level signals.",
  medium: "Medium confidence — consistent signals, but we never call anything definitively safe.",
  low: "Lower confidence — we had little beyond the message text.",
};

function FindingList({
  title,
  items,
  markerColor,
}: {
  title: string;
  items: Finding[];
  markerColor: string;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="font-[family-name:var(--font-display)] text-sm font-medium tracking-wide text-ink">
        {title}
      </h3>
      <ul className="mt-2 space-y-2">
        {items.map((f) => (
          <li key={f.id} className="flex gap-2.5 text-[15px] leading-relaxed text-ink">
            <span
              className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: markerColor }}
              aria-hidden="true"
            />
            {f.explanation}
          </li>
        ))}
      </ul>
    </section>
  );
}

function buildCopyText(report: Report): string {
  const lines = [
    `ScamScan result: ${riskLabel(report.risk_level)} (${report.confidence} confidence)`,
    "",
    report.recommended_action,
    "",
    "Do:",
    ...report.guidance.do.map((d) => `• ${d}`),
    "",
    "Don't:",
    ...report.guidance.dont.map((d) => `• ${d}`),
  ];
  if (report.findings.concerning.length) {
    lines.push("", "Concerns:", ...report.findings.concerning.map((f) => `• ${f.explanation}`));
  }
  lines.push("", "This is an aid, not proof a role is real or that a person is a scammer.");
  return lines.join("\n");
}

function GuidanceLists({ report }: { report: Report }) {
  const { do: dos, dont } = report.guidance;
  return (
    <div className="mt-6 border-t border-line pt-5">
      <h3 className="font-[family-name:var(--font-display)] text-sm font-medium tracking-wide text-ink">
        What to do next
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink">{report.recommended_action}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-input)] border border-line bg-bg/60 px-3.5 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-accent-ink">Do</p>
          <ul className="mt-2 space-y-2">
            {dos.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink">
                <span className="mt-0.5 shrink-0 font-medium text-accent" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[var(--radius-input)] border border-line bg-bg/60 px-3.5 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--r-high)]">
            Don&rsquo;t
          </p>
          <ul className="mt-2 space-y-2">
            {dont.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink">
                <span className="mt-0.5 shrink-0 font-medium text-[var(--r-high)]" aria-hidden="true">
                  ✕
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ResultCard({ report }: { report: Report }) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const sparseFindings =
    report.findings.concerning.length === 0 &&
    report.findings.positive.length === 0 &&
    report.findings.unverified.length <= 1;

  const concerningTitle =
    report.risk_level === "high_risk" || report.risk_level === "critical_risk"
      ? "Red flags"
      : "Concerns";

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(buildCopyText(report));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function sendFeedback() {
    if (!feedback || feedbackBusy) return;
    setFeedbackBusy(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useful: feedback,
          note: feedbackNote.trim() || undefined,
          risk_level: report.risk_level,
        }),
      });
    } catch {
      /* still thank them */
    } finally {
      setFeedbackSent(true);
      setFeedbackBusy(false);
    }
  }

  return (
    <div
      className="rounded-[var(--radius-card)] border border-line bg-surface/95 p-4 backdrop-blur-[2px] sm:p-7"
      style={{ boxShadow: "var(--shadow-card)" }}
      role="region"
      aria-label="Scan result"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <RiskBadge level={report.risk_level} />
        <button
          type="button"
          onClick={copySummary}
          className="min-h-10 shrink-0 rounded-[var(--radius-input)] border border-line px-3 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent-ink sm:min-h-0 sm:py-1.5"
        >
          {copied ? "Copied" : "Copy summary"}
        </button>
      </div>
      <p className="mt-3 text-sm text-muted">{CONFIDENCE_COPY[report.confidence]}</p>
      {report.classifier_failed && (
        <p
          className="mt-3 rounded-[var(--radius-input)] border border-dashed border-line bg-bg px-3 py-2.5 text-sm leading-relaxed text-ink"
          role="status"
        >
          The AI wording check didn&rsquo;t complete — this isn&rsquo;t about how much you filled
          in. Scan again in a moment and the message analysis should run.
        </p>
      )}

      <div className="mt-6 space-y-6">
        <FindingList
          title={concerningTitle}
          items={report.findings.concerning}
          markerColor="var(--r-high)"
        />
        <FindingList
          title="Looking okay"
          items={report.findings.positive}
          markerColor="var(--accent)"
        />
        <FindingList
          title="Gaps"
          items={report.findings.unverified}
          markerColor="var(--muted)"
        />
        {sparseFindings && report.checks_run?.length > 0 && (
          <section>
            <h3 className="font-[family-name:var(--font-display)] text-sm font-medium tracking-wide text-ink">
              What we checked
            </h3>
            <ul className="mt-2 space-y-2">
              {report.checks_run.map((c) => (
                <li key={c} className="flex gap-2.5 text-[15px] leading-relaxed text-muted">
                  <span
                    className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-line"
                    aria-hidden="true"
                  />
                  {c}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <GuidanceLists report={report} />

      <div className="mt-6 border-t border-line pt-4">
        {feedbackSent ? (
          <p className="text-sm text-muted">Thanks — that helps us improve the checks.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted">Was this assessment useful?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFeedback("up")}
                aria-pressed={feedback === "up"}
                aria-label="Yes, this was useful"
                className={`min-h-10 rounded-[var(--radius-input)] border px-3 py-2 text-sm transition-colors sm:min-h-0 sm:py-1.5 ${
                  feedback === "up"
                    ? "border-accent bg-accent/5 text-accent-ink"
                    : "border-line text-muted hover:border-accent hover:text-accent-ink"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setFeedback("down")}
                aria-pressed={feedback === "down"}
                aria-label="No, this wasn't useful"
                className={`min-h-10 rounded-[var(--radius-input)] border px-3 py-2 text-sm transition-colors sm:min-h-0 sm:py-1.5 ${
                  feedback === "down"
                    ? "border-accent bg-accent/5 text-accent-ink"
                    : "border-line text-muted hover:border-accent hover:text-accent-ink"
                }`}
              >
                No
              </button>
            </div>
          </div>
        )}
        {feedback && !feedbackSent && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="What happened?"
              className="min-h-10 flex-1 rounded-[var(--radius-input)] border border-line bg-bg px-3 py-2.5 text-base text-ink placeholder:text-muted sm:min-h-0 sm:py-2 sm:text-sm"
            />
            <button
              type="button"
              disabled={feedbackBusy}
              onClick={sendFeedback}
              className="min-h-10 rounded-[var(--radius-input)] bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-ink disabled:opacity-50 sm:min-h-0 sm:py-2"
            >
              {feedbackBusy ? "Sending…" : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
