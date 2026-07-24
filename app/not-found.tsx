import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Page not found — ScamScan",
  description: "This page doesn't exist. Head back to ScamScan to check a recruiter approach.",
};

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw)] flex-1 px-4 py-8 sm:px-5 sm:py-14">
      <SiteHeader />

      <article className="ss-rise">
        <p className="text-sm font-medium tracking-wide text-accent-ink">404</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.85rem] font-medium tracking-tight text-ink sm:text-3xl">
          That page went off-platform.
        </h1>
        <p className="mt-3 max-w-[36rem] text-[15px] leading-relaxed text-muted">
          We couldn&rsquo;t find what you were looking for — the link may be old, or the address
          was mistyped. Unlike a suspicious recruiter, this is one redirect worth trusting.
        </p>

        <div
          className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface/95 p-6 sm:p-7"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            Where to go instead
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Check a recruiter message before you reply, or read up on the tactics behind today&rsquo;s
            hiring scams.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-[var(--radius-input)] bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink"
            >
              Open ScamScan
            </Link>
            <Link
              href="/insights"
              className="inline-flex rounded-[var(--radius-input)] border border-line bg-bg px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent-ink"
            >
              Read the insights
            </Link>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
