import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScanForm from "@/components/ScanForm";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw)] flex-1 px-4 py-8 sm:px-5 sm:py-14">
      <SiteHeader />

      <header className="ss-rise">
        <h1 className="font-[family-name:var(--font-display)] text-[1.45rem] font-medium leading-snug tracking-tight text-ink sm:text-[1.85rem]">
          Check a recruiter or job offer before you reply.
        </h1>
        <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-muted">
          Paste the message. Get an evidence-backed read on whether the approach looks genuine,
          suspicious, or dangerous.
        </p>
        <p className="mt-3 max-w-[34rem] text-sm leading-relaxed text-muted">
          Don&rsquo;t paste IDs, bank details, or passwords. Message text goes once to Anthropic
          (Claude); we don&rsquo;t store it.{" "}
          <a
            href="/privacy"
            className="text-accent-ink underline decoration-line underline-offset-2"
          >
            Privacy
          </a>
        </p>
      </header>

      <div className="ss-rise ss-rise-delay-1 mt-6 sm:mt-8">
        <ScanForm />
      </div>

      <div className="ss-rise ss-rise-delay-2">
        <SiteFooter />
      </div>
    </main>
  );
}
