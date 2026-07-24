import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of use — ScamScan",
  description:
    "Plain-English terms for ScamScan: it's an aid, not legal advice, comes with no warranties, and you shouldn't paste passwords or bank details into it.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw)] flex-1 px-4 py-8 sm:px-5 sm:py-14">
      <SiteHeader />

      <article className="ss-rise">
        <p className="text-sm font-medium tracking-wide text-accent-ink">Terms</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.85rem] font-medium tracking-tight text-ink sm:text-3xl">
          Terms of use
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Kept short and in plain English. By using ScamScan you&rsquo;re agreeing to the points
          below — if anything is unclear, treat that as a reason to be more cautious, not less.
        </p>

        <section className="mt-10 space-y-3 rounded-[var(--radius-card)] border border-line bg-surface/90 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            An aid, not legal advice
          </h2>
          <p className="text-[15px] leading-relaxed text-ink">
            ScamScan gives you a second opinion on a recruiter message or job offer. It is not
            legal, financial, or professional advice, and it doesn&rsquo;t replace your own
            judgement or checks. Always verify a role or company through channels you find
            yourself before you act on it.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            No warranties
          </h2>
          <p className="text-[15px] leading-relaxed text-ink">
            ScamScan is provided &ldquo;as is,&rdquo; with no guarantee that a verdict is correct
            or complete. A low-risk result doesn&rsquo;t confirm an opportunity is genuine, and a
            high-risk result doesn&rsquo;t prove someone is a scammer — it only reflects patterns in
            what you pasted. We accept no liability for decisions made using ScamScan, to the
            fullest extent permitted by law.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            Don&rsquo;t paste secrets
          </h2>
          <p className="text-[15px] leading-relaxed text-ink">
            Only paste the recruiter&rsquo;s message and public details about the approach.
            Please don&rsquo;t paste passwords, bank or card details, National Insurance / Social
            Security numbers, ID scans, or other secrets — ScamScan doesn&rsquo;t need them to
            assess an approach, and a legitimate employer wouldn&rsquo;t need them from you this
            early either.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            How your message is processed
          </h2>
          <p className="text-[15px] leading-relaxed text-ink">
            The text you paste is sent once to Anthropic&rsquo;s Claude API to classify wording
            patterns, then discarded by ScamScan — we don&rsquo;t store it or build a history. See{" "}
            <Link
              href="/privacy"
              className="text-accent-ink underline decoration-line underline-offset-2"
            >
              how it works &amp; privacy
            </Link>{" "}
            for the full picture.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            Fair use &amp; rate limits
          </h2>
          <p className="text-[15px] leading-relaxed text-ink">
            ScamScan is a free tool run on a limited budget, so scans are rate-limited per visitor
            and overall, with a daily cap on top. If you&rsquo;re told to slow down, that&rsquo;s
            the limit working as intended — please try again shortly rather than scripting around
            it.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            Who runs this
          </h2>
          <p className="text-[15px] leading-relaxed text-ink">
            ScamScan is built and maintained by Dr Alec Burns at{" "}
            <a
              href="https://metispoint.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-ink underline decoration-line underline-offset-2"
            >
              Metis Point
            </a>
            . Questions, concerns, or a takedown request? Use the{" "}
            <Link
              href="/contact"
              className="text-accent-ink underline decoration-line underline-offset-2"
            >
              contact page
            </Link>
            . We may update these terms as the tool changes; continued use means you accept the
            current version.
          </p>
        </section>

        <p className="mt-12 text-sm text-muted">
          Nothing here overrides your statutory rights under UK or other applicable consumer law.
          When in doubt: don&rsquo;t send money, don&rsquo;t share secrets, and verify
          independently.
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}
