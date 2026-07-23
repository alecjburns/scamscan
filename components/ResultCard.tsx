"use client";

import { useState } from "react";
import { Finding, Report } from "@/lib/types";
import RiskBadge from "./RiskBadge";

const CONFIDENCE_COPY: Record<Report["confidence"], string> = {
  high: "High confidence — the extra details you provided corroborate the message-level evidence.",
  medium:
    "Medium confidence — the evidence is consistent, but we never call anything definitively safe.",
  low: "Low confidence — we had little beyond the message text to work with.",
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

export default function ResultCard({ report }: { report: Report }) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackBusy, setFeedbackBusy] = useState(false);

  const showLinkedInReportLine =
    report.is_linkedin &&
    (report.risk_level === "high_risk" || report.risk_level === "critical_risk");

  const sparseFindings =
    report.findings.concerning.length === 0 &&
    report.findings.positive.length === 0 &&
    report.findings.unverified.length <= 1;

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
      /* still thank them — feedback is best-effort */
    } finally {
      setFeedbackSent(true);
      setFeedbackBusy(false);
    }
  }

  return (
    <div
      className="rounded-[var(--radius-card)] border border-line bg-surface/95 p-6 backdrop-blur-[2px] sm:p-7"
      style={{ boxShadow: "var(--shadow-card)" }}
      role="region"
      aria-label="Scan result"
    >
      <RiskBadge level={report.risk_level} />
      <p className="mt-3 text-sm text-muted">{CONFIDENCE_COPY[report.confidence]}</p>

      <div className="mt-6 space-y-6">
        <FindingList
          title="Why this was flagged"
          items={report.findings.concerning}
          markerColor="var(--r-high)"
        />
        <FindingList
          title="In its favour"
          items={report.findings.positive}
          markerColor="var(--accent)"
        />
        <FindingList
          title="Couldn't verify"
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

      <div className="mt-6 border-t border-line pt-5">
        <h3 className="font-[family-name:var(--font-display)] text-sm font-medium tracking-wide text-ink">
          What to do
        </h3>
        <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink">
          {report.recommended_action}
        </p>
        {showLinkedInReportLine && (
          <p className="mt-3 text-sm text-muted">
            On the LinkedIn message, open <strong className="text-ink">More → Report</strong> — you
            can report it without notifying the sender.
          </p>
        )}
      </div>

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
                className={`rounded-[var(--radius-input)] border px-3 py-1.5 text-sm transition-colors ${
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
                className={`rounded-[var(--radius-input)] border px-3 py-1.5 text-sm transition-colors ${
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
              placeholder="Optional — what happened?"
              className="flex-1 rounded-[var(--radius-input)] border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted"
            />
            <button
              type="button"
              disabled={feedbackBusy}
              onClick={sendFeedback}
              className="rounded-[var(--radius-input)] bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-ink disabled:opacity-50"
            >
              {feedbackBusy ? "Sending…" : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
