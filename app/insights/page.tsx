import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Job scam insights — why hiring fraud is getting harder to spot",
  description:
    "Half a billion dollars in reported job-scam losses. Industry-standard advice: never pay to get paid, always verify independently. Figures from FTC, FBI, and LinkedIn.",
};

const STATS = [
  {
    figure: "$501M",
    label: "Lost to job & employment scams in 2024",
    detail: "FTC Consumer Sentinel — up from about $90M in 2020.",
    source: "FTC Top scams of 2024",
  },
  {
    figure: "$12.5B",
    label: "Total reported fraud losses in the US, 2024",
    detail: "Job scams are one slice of a much larger fraud economy.",
    source: "FTC Consumer Sentinel Network Data Book 2024",
  },
  {
    figure: "$2,250",
    label: "Median loss per job-opportunity victim",
    detail: "Second-highest median among top FTC fraud categories — after investment scams.",
    source: "FTC Consumer Sentinel Network Data Book 2024",
  },
  {
    figure: "3×",
    label: "Jump in job-scam reports, 2020–2024",
    detail: "Reports nearly tripled while losses grew more than fivefold.",
    source: "FTC Consumer Sentinel, 2020–2024",
  },
] as const;

const RULES = [
  {
    title: "Never pay to get a job",
    body: "Real employers do not ask you to buy equipment, pay training fees, or deposit crypto to “unlock” earnings. If money is supposed to flow to you, you should never send any first.",
  },
  {
    title: "Always verify on channels you find yourself",
    body: "Look up the company on its official website or careers page — not a link, number, or email from the message. Call a published switchboard and ask for the recruiter by name.",
  },
  {
    title: "Stay on the platform when you can",
    body: "LinkedIn and the FBI both flag pressure to move to WhatsApp, Telegram, or SMS as a core red flag. Off-platform chats skip warnings and make reporting harder.",
  },
  {
    title: "Don’t share ID, bank details, or passwords early",
    body: "A legitimate hiring process does not need your Social Security / National Insurance number, bank login, or ID scans before an offer is real and verified.",
  },
  {
    title: "Treat urgency as a warning, not a deadline",
    body: "“Reply in 2 hours,” “slots filling,” and same-day starts without a real interview are designed to short-circuit your judgment. Slow down.",
  },
  {
    title: "Report without engaging",
    body: "On LinkedIn: More → Report (you can report without notifying the sender). Also file at IC3.gov and ReportFraud.ftc.gov if money or data was involved.",
  },
] as const;

export default function InsightsPage() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw-wide)] flex-1 px-4 py-8 sm:px-5 sm:py-14">
      <SiteHeader />

      <article>
        <header className="ss-rise max-w-[38rem]">
          <p className="text-sm font-medium tracking-wide text-accent-ink">Insights</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.85rem] font-medium leading-tight tracking-tight text-ink sm:text-4xl">
            Hiring fraud is scaling — and sounding more like the real thing.
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Fake recruiters borrow real company names, steal LinkedIn profiles, and push you
            off-platform before you can report them. The rule that still holds:{" "}
            <strong className="font-medium text-ink">never trust the approach — always verify independently.</strong>
          </p>
        </header>

        <section
          className="ss-rise ss-rise-delay-1 mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2"
          aria-label="Key figures"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {STATS.map((s) => (
            <div key={s.figure} className="bg-surface px-5 py-8 sm:px-7 sm:py-10">
              <p className="font-[family-name:var(--font-display)] text-5xl font-medium tracking-tight text-accent sm:text-6xl lg:text-7xl">
                {s.figure}
              </p>
              <p className="mt-4 text-[15px] font-medium leading-snug text-ink sm:text-base">
                {s.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.detail}</p>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-muted/70">{s.source}</p>
            </div>
          ))}
        </section>

        <section className="ss-rise ss-rise-delay-2 mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-ink sm:text-2xl">
            Never trust. Always verify.
          </h2>
          <p className="mt-3 max-w-[36rem] text-[15px] leading-relaxed text-muted">
            Industry guidance from the FTC, FBI, and LinkedIn Trust converges on the same idea:
            assume an unsolicited approach could be fraud until you prove otherwise — through
            channels you opened yourself.
          </p>
          <ol className="mt-8 space-y-0 border-t border-line">
            {RULES.map((rule, i) => (
              <li
                key={rule.title}
                className="grid gap-2 border-b border-line py-5 sm:grid-cols-[2.5rem_1fr] sm:gap-5"
              >
                <span className="font-[family-name:var(--font-display)] text-2xl font-medium text-accent tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[16px] font-medium text-ink">{rule.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{rule.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="ss-rise ss-rise-delay-3 mt-14 max-w-[36rem]">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-ink">
            How the approaches got smarter
          </h2>
          <div className="mt-5 space-y-5 text-[15px] leading-relaxed text-ink">
            <p>
              <strong className="font-medium">They look like professionals.</strong> Stolen or
              freshly built LinkedIn profiles claim senior recruiter titles, list known employers,
              and sometimes carry verification badges — or sit on a real account that was
              compromised.
            </p>
            <p>
              <strong className="font-medium">They move you off LinkedIn fast.</strong> Pressure to
              continue on WhatsApp, Telegram, or SMS bypasses platform warnings and reporting tools.
              That off-platform push is one of the clearest early signals.
            </p>
            <p>
              <strong className="font-medium">Task scams gamify the loss.</strong> Tiny “payments”
              for trivial clicks, a fake balance that grows, then a demand to deposit crypto to
              unlock the next tier. Once crypto moves, recovery is rare.
            </p>
            <p>
              <strong className="font-medium">Urgency does the rest.</strong> Limited slots and
              same-day starts without a real interview exploit how scarce good remote roles feel —
              LinkedIn research found nearly a third of Gen Z seekers admitted ignoring warning
              signs because opportunities feel scarce.
            </p>
          </div>
        </section>

        <section className="ss-rise ss-rise-delay-3 mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-ink sm:text-2xl">
            Playbooks
          </h2>
          <p className="mt-3 max-w-[36rem] text-[15px] leading-relaxed text-muted">
            Deeper breakdowns of specific tactics — warning signs, and what to do if you spot
            them.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Link
              href="/insights/task-scam"
              className="group rounded-[var(--radius-card)] border border-line bg-surface/90 p-5 transition-colors hover:border-accent"
            >
              <h3 className="text-[15px] font-medium text-ink group-hover:text-accent-ink">
                Task &amp; &ldquo;training fee&rdquo; job scams
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A growing in-app balance that only pays out once you deposit money first.
              </p>
            </Link>
            <Link
              href="/insights/whatsapp-switch"
              className="group rounded-[var(--radius-card)] border border-line bg-surface/90 p-5 transition-colors hover:border-accent"
            >
              <h3 className="text-[15px] font-medium text-ink group-hover:text-accent-ink">
                When they push you to WhatsApp
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Why moving off-platform fast is one of the clearest early warning signs.
              </p>
            </Link>
            <Link
              href="/insights/fake-careers"
              className="group rounded-[var(--radius-card)] border border-line bg-surface/90 p-5 transition-colors hover:border-accent"
            >
              <h3 className="text-[15px] font-medium text-ink group-hover:text-accent-ink">
                Fake careers pages &amp; lookalike domains
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                How cloned branding on an almost-right domain is built to earn your trust.
              </p>
            </Link>
          </div>
        </section>

        <aside
          className="mt-12 rounded-[var(--radius-card)] border border-line bg-surface/95 p-6 sm:p-7"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            Check an approach before you reply
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Paste the recruiter message into ScamScan. Optional LinkedIn profile answers and domain
            checks deepen the verdict — nothing you paste is stored.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-[var(--radius-input)] bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink"
            >
              Open ScamScan
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-[var(--radius-input)] border border-line bg-bg px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent-ink"
            >
              Contact
            </Link>
          </div>
        </aside>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Figures are as reported by the cited agencies; they undercount real harm because most
          victims never file a report. ScamScan is an aid, not legal advice.
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}
