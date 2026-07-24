import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Fake careers pages & lookalike domains — ScamScan playbook",
  description:
    "How scammers clone company branding onto lookalike domains and fake careers pages to look legitimate. Warning signs, and how to verify a domain independently.",
};

const SIGNS = [
  "The domain is slightly off \u2014 a misspelling, an extra word, a different ending (.net/.info instead of .com), or an added hyphen.",
  "The domain was registered only days or weeks ago, despite the company claiming to be well-established.",
  "The application form asks for sensitive details \u2014 National Insurance / Social Security number, bank account, ID scans \u2014 before any interview.",
  "You can't reach the \u201Ccareers\u201D page by navigating from the company's real, main website.",
  "The listing has a generic description, inflated pay for minimal experience, and pressure to apply immediately.",
  "Contact only happens via a personal email address rather than one on the company's domain.",
];

export default function FakeCareersPlaybook() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw)] flex-1 px-4 py-8 sm:px-5 sm:py-14">
      <SiteHeader />

      <article className="ss-rise">
        <p className="text-sm font-medium tracking-wide text-accent-ink">Playbook</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.85rem] font-medium leading-tight tracking-tight text-ink sm:text-3xl">
          Fake careers pages &amp; lookalike domains
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Scammers can clone a real company&rsquo;s logo, colours, and job listings onto a
          domain that looks right at a glance. The tell is rarely the design &mdash; it&rsquo;s the
          web address and how recently it appeared.
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
              <li>Type the company&rsquo;s main domain in yourself and navigate to careers from there.</li>
              <li>Compare the URL character by character against the real one.</li>
              <li>Check how recently the domain was registered before you trust it with your details.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
              Don&rsquo;t
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
              <li>Don&rsquo;t click the link straight from the message that started it.</li>
              <li>Don&rsquo;t submit bank details or ID scans through an unfamiliar application form.</li>
              <li>Don&rsquo;t trust a badge or certification shown on the page itself &mdash; it proves nothing.</li>
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
