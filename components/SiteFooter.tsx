import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-line pt-6 text-xs leading-relaxed text-muted">
      <p>
        ScamScan assesses the interaction you paste — it never claims a person is or isn&rsquo;t a
        scammer, and a low-risk result doesn&rsquo;t confirm an opportunity is genuine.
      </p>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <span>
          Message text goes once to Anthropic for classification; ScamScan doesn&rsquo;t store it.
        </span>
        <Link
          href="/privacy"
          className="text-accent-ink underline decoration-line underline-offset-2"
        >
          How it works
        </Link>
        <Link
          href="/insights"
          className="text-accent-ink underline decoration-line underline-offset-2"
        >
          Scam insights
        </Link>
        <Link
          href="/contact"
          className="text-accent-ink underline decoration-line underline-offset-2"
        >
          Contact
        </Link>
      </p>
    </footer>
  );
}
