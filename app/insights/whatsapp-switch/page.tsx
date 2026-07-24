import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "When they push you to WhatsApp — ScamScan playbook",
  description:
    "Why fake recruiters rush you off LinkedIn onto WhatsApp, Telegram, or SMS \u2014 and the warning signs that show it's happening. What to do instead.",
};

const SIGNS = [
  "Within the first few messages you're asked to continue \u201Cfor faster response\u201D on WhatsApp, Telegram, or SMS.",
  "The recruiter's profile is new, sparse, or has few mutual connections despite claiming a senior title.",
  "The conversation moves to voice notes or informal chat, and a real video call never happens.",
  "You're asked to download a separate app or open a link before \u201Conboarding\u201D can continue.",
  "No official company email domain is ever used \u2014 only a personal number or a generic address.",
  "Any hesitation about switching platforms is met with urgency: \u201Cthis offer closes today.\u201D",
];

export default function WhatsappSwitchPlaybook() {
  return (
    <main className="mx-auto w-full max-w-[var(--maxw)] flex-1 px-4 py-8 sm:px-5 sm:py-14">
      <SiteHeader />

      <article className="ss-rise">
        <p className="text-sm font-medium tracking-wide text-accent-ink">Playbook</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.85rem] font-medium leading-tight tracking-tight text-ink sm:text-3xl">
          When they push you to WhatsApp
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Moving a conversation off LinkedIn onto WhatsApp, Telegram, or plain SMS is one of the
          clearest early signals in hiring fraud. It skips platform warnings, hides the
          recruiter&rsquo;s real profile history, and makes reporting much harder if things go
          wrong.
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
              <li>Keep the conversation on the original platform for as long as you can.</li>
              <li>Ask for a company email domain and a proper video interview.</li>
              <li>Call the company&rsquo;s published switchboard and ask for the recruiter by name.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
              Don&rsquo;t
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
              <li>Don&rsquo;t hand over your personal number the moment it&rsquo;s asked for.</li>
              <li>Don&rsquo;t install an unfamiliar app to &ldquo;continue onboarding.&rdquo;</li>
              <li>Don&rsquo;t accept &ldquo;it&rsquo;s just easier&rdquo; as a reason without checking who&rsquo;s asking.</li>
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
