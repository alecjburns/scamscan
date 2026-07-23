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
    <header className="mb-10 flex items-end justify-between gap-4 border-b border-line/80 pb-5">
      <Link href="/" className="group block min-w-0">
        <span className="font-[family-name:var(--font-display)] text-[1.65rem] font-medium tracking-tight text-ink sm:text-3xl">
          Scam<span className="text-accent">Scan</span>
        </span>
        <span className="ss-brand-underline max-w-[5.5rem] opacity-80 transition-opacity group-hover:opacity-100" />
      </Link>
      <nav aria-label="Primary" className="flex shrink-0 items-center gap-1 sm:gap-2">
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
              className={`rounded-[var(--radius-input)] px-2.5 py-1.5 text-sm transition-colors sm:px-3 ${
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
