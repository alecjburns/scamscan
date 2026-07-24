import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Task & 'training fee' job scams — ScamScan playbook",
  description:
    "How gamified task scams work: tiny payouts, a fake balance that grows, then a 'training fee' or crypto deposit to unlock your own earnings. Warning signs and what to do.",
};

const SIGNS = [
  "You're asked to pay a fee, buy equipment, or send crypto to \u201Cunlock\u201D earnings or continue training.",
  "The work is repetitive \u2014 liking videos, writing reviews, \u201Coptimizing\u201D app rankings, combining orders \u2014 paid into an in-app dashboard, not a real payroll system.",
  "Your balance grows fast, but withdrawing it suddenly needs a deposit first (a \u201Cnegative balance\u201D or \u201Ccommission threshold\u201D).",
  "Recruitment started from an unsolicited text or WhatsApp message, and the company can't be found or verified independently.",
  "You're rushed \u2014 told a bonus round or slot is about to expire if you don't pay or act right now.",
  "Payment is requested in cryptocurrency, gift cards, or wire transfer instead of normal payroll.",
];

export default function TaskScamPlaybook() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw)] flex-1 px-4 py-8 sm:px-5 sm:py-14">
      <SiteHeader />

      <article className="ss-rise">
        <p className="text-sm font-medium tracking-wide text-accent-ink">Playbook</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.85rem] font-medium leading-tight tracking-tight text-ink sm:text-3xl">
          Task &amp; &ldquo;training fee&rdquo; job scams
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          These scams gamify the loss: simple tasks pay out small amounts at first, a balance
          climbs inside an app or spreadsheet, then unlocking the &ldquo;real&rdquo; money needs a
          training fee or crypto deposit. Once that payment moves, recovery is rare.
        </p>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            Warning signs
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
            {SIGNS.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
              Do
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
              <li>Stop replying as soon as any payment is requested.</li>
              <li>Verify the company independently, through its own website or switchboard.</li>
              <li>
                Report it to the platform, and to IC3.gov / ReportFraud.ftc.gov (US) or Action
                Fraud (UK) if money or data was involved.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
              Don&rsquo;t
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
              <li>Don&rsquo;t pay any fee, however small, &ldquo;to prove you&rsquo;re serious.&rdquo;</li>
              <li>Don&rsquo;t send ID, bank details, or crypto to unlock your own balance.</li>
              <li>Don&rsquo;t treat a growing in-app number as real money until it&rsquo;s withdrawn.</li>
            </ul>
          </div>
        </section>

        <aside
          className="mt-12 rounded-[var(--radius-card)] border border-line bg-surface/95 p-6 sm:p-7"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            Not sure about a message you got?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Paste it into ScamScan for an evidence-backed read before you reply or send anything.
          </p>
          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex rounded-[var(--radius-input)] bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink"
            >
              Check an approach
            </Link>
          </div>
        </aside>

        <p className="mt-8 text-sm">
          <Link
            href="/insights"
            className="text-accent-ink underline decoration-line underline-offset-2"
          >
            ← Back to Insights
          </Link>
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}
