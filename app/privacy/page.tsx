import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "How ScamScan works & privacy",
  description:
    "What ScamScan checks, what Claude sees, and what we never store. No accounts, no scraping, no message retention.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw)] flex-1 px-4 py-8 sm:px-5 sm:py-14">
      <SiteHeader />

      <article className="ss-rise">
        <p className="text-sm font-medium tracking-wide text-accent-ink">Privacy</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.85rem] font-medium tracking-tight text-ink sm:text-3xl">
          How it works &amp; privacy
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          ScamScan is a trust tool for checking a recruiter approach before you reply. This page
          explains what we do with what you paste — including that the message text is processed by
          Anthropic&rsquo;s Claude API.
        </p>

        <section className="mt-10 space-y-3 rounded-[var(--radius-card)] border border-line bg-surface/90 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            Short version
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
            <li>
              <strong className="font-medium">Your message text is sent to Anthropic</strong> (Claude)
              once per scan so we can classify scam wording patterns.
            </li>
            <li>
              <strong className="font-medium">ScamScan does not store</strong> the message, create
              accounts, or keep a history.
            </li>
            <li>
              <strong className="font-medium">We never scrape LinkedIn</strong> or open links you
              paste — you report what you see on your own screen.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            What happens when you scan
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
            <li>
              Your pasted message is sent once to Anthropic&rsquo;s Claude API, which classifies
              wording patterns only (payment asks, crypto, platform-switching, etc.). Claude is not
              asked to invent facts about companies or people.
            </li>
            <li>
              Deterministic checks run in our code: domain match / lookalike detection, public domain
              age via RDAP, and — if you answer them — LinkedIn profile questions.
            </li>
            <li>
              The verdict is computed in code from those signals. A result below high risk never gets
              more than medium confidence, and we never call an approach &ldquo;definitely safe.&rdquo;
            </li>
          </ol>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            What we never do
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
            <li>We don&rsquo;t create accounts, save history, or keep a database of messages.</li>
            <li>We don&rsquo;t scrape LinkedIn or open links you paste.</li>
            <li>
              We don&rsquo;t assert that a person &ldquo;is a scammer&rdquo; — we assess the interaction
              you showed us.
            </li>
            <li>
              If you leave feedback (yes/no + a short note), we log a count and a structured log line
              only — never with the original message.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            What is retained briefly
          </h2>
          <p className="text-[15px] leading-relaxed text-ink">
            Rate-limit counters (per IP and global) live for about a minute so the Anthropic budget
            can&rsquo;t be drained. When Upstash Redis is configured in production, those counters are
            shared across servers and expire automatically. Aggregate scan counts and verdict
            breakdowns may appear in operator logs and a token-gated stats endpoint — still without
            message content.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink">
            Anthropic processes the message under their API terms for the duration of that single
            request. We don&rsquo;t ask them to store it for training of this product.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            LinkedIn checks
          </h2>
          <p className="text-[15px] leading-relaxed text-ink">
            When the approach arrived on LinkedIn, we ask you to read{" "}
            <em>About this profile</em> and report what you see. That keeps legal and technical risk
            low — LinkedIn blocks scraping, and we never need credentials or automated access to your
            account.
          </p>
        </section>

        <p className="mt-12 text-sm text-muted">
          Questions about this page? Treat ScamScan as an aid, not legal advice — and verify any role
          through channels you find yourself.
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}
