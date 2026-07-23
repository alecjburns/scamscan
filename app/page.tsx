import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScanForm from "@/components/ScanForm";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw)] flex-1 px-5 py-10 sm:py-14">
      <SiteHeader />

      <header className="ss-rise">
        <h1 className="font-[family-name:var(--font-display)] text-[1.65rem] font-medium leading-snug tracking-tight text-ink sm:text-[1.85rem]">
          Check a recruiter or job offer before you reply.
        </h1>
        <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-muted">
          Paste the message. Get an evidence-backed read on whether the approach looks genuine,
          suspicious, or dangerous — without storing anything you share.
        </p>
        <p className="mt-4 border-l-2 border-accent/40 pl-3 text-sm text-muted">
          Don&rsquo;t paste ID documents, bank details, or passwords — just the recruiter&rsquo;s
          message and any links.
        </p>
      </header>

      <div className="ss-rise ss-rise-delay-1 mt-8">
        <ScanForm />
      </div>

      <div className="ss-rise ss-rise-delay-2">
        <SiteFooter />
      </div>
    </main>
  );
}
