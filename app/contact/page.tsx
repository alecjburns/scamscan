import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Contact — ScamScan",
  description:
    "ScamScan is built by Dr Alec Burns at Metis Point. Get in touch about the tool or related work.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw)] flex-1 px-4 py-8 sm:px-5 sm:py-14">
      <SiteHeader />

      <article className="ss-rise">
        <p className="text-sm font-medium tracking-wide text-accent-ink">Contact</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.85rem] font-medium tracking-tight text-ink sm:text-3xl">
          Built by Metis Point
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          ScamScan is a small, privacy-minded tool from{" "}
          <strong className="font-medium text-ink">Dr Alec Burns</strong> at Metis Point — an
          independent AI and emerging-technology practice. If you want to talk about the product,
          a related build, or something else entirely, start here.
        </p>

        <div
          className="mt-8 space-y-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface/95"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <a
            href="https://metispoint.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 border-b border-line px-5 py-5 transition-colors hover:bg-bg"
          >
            <div>
              <p className="text-sm font-medium text-ink">Metis Point</p>
              <p className="mt-0.5 text-sm text-muted">metispoint.com — strategy, prototypes, delivery</p>
            </div>
            <span className="shrink-0 text-accent" aria-hidden="true">
              →
            </span>
          </a>
          <a
            href="https://www.linkedin.com/in/alecjohnburns"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-bg"
          >
            <div>
              <p className="text-sm font-medium text-ink">Alec on LinkedIn</p>
              <p className="mt-0.5 text-sm text-muted">linkedin.com/in/alecjohnburns</p>
            </div>
            <span className="shrink-0 text-accent" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-muted">
          ScamScan itself doesn&rsquo;t take accounts or store messages — for product feedback on a
          scan you just ran, use the Yes / No prompt on the result card.
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}
