"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Scan" },
  { href: "/insights", label: "Insights" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-line/80 pb-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:pb-5">
      <Link href="/" className="group block min-w-0 self-start">
        <span className="font-[family-name:var(--font-display)] text-[1.5rem] font-medium tracking-tight text-ink sm:text-3xl">
          Scam<span className="text-accent">Scan</span>
        </span>
        <span className="ss-brand-underline max-w-[5.5rem] opacity-80 transition-opacity group-hover:opacity-100" />
      </Link>
      <nav
        aria-label="Primary"
        className="-mx-1 flex gap-0.5 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-[var(--radius-input)] px-2.5 py-2 text-sm transition-colors sm:px-3 sm:py-1.5 ${
                active
                  ? "bg-accent/10 font-medium text-accent-ink"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
