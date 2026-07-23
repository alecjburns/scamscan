import type { ReactElement } from "react";
import { RiskLevel } from "@/lib/types";

type BadgeConfig = { label: string; cssVar: string; icon: ReactElement };

const icon = (path: ReactElement) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 shrink-0"
    aria-hidden="true"
  >
    {path}
  </svg>
);

const CONFIG: Record<RiskLevel, BadgeConfig> = {
  insufficient_evidence: {
    label: "Insufficient evidence",
    cssVar: "--r-insufficient",
    icon: icon(
      <>
        <circle cx="10" cy="10" r="7.25" />
        <path d="M7.8 7.6a2.2 2.2 0 1 1 3.1 2.3c-.7.3-.9.8-.9 1.5" />
        <path d="M10 14.2h.01" />
      </>
    ),
  },
  low_apparent_risk: {
    label: "Low apparent risk",
    cssVar: "--r-low",
    icon: icon(
      <>
        <path d="M10 2.75 16.25 5v4.5c0 4-2.6 6.7-6.25 7.75C6.35 16.2 3.75 13.5 3.75 9.5V5L10 2.75Z" />
        <path d="M7 10h6" />
      </>
    ),
  },
  some_concerns: {
    label: "Some concerns",
    cssVar: "--r-concern",
    icon: icon(
      <>
        <path d="M10 3 18 16.5H2L10 3Z" />
        <path d="M10 8.5v3.5" />
        <path d="M10 14.5h.01" />
      </>
    ),
  },
  high_risk: {
    label: "High risk",
    cssVar: "--r-high",
    icon: icon(
      <>
        <path d="M6.9 2.75h6.2l4.15 4.15v6.2l-4.15 4.15H6.9l-4.15-4.15v-6.2L6.9 2.75Z" />
        <path d="M10 6.5v4" />
        <path d="M10 13.5h.01" />
      </>
    ),
  },
  critical_risk: {
    label: "Critical risk",
    cssVar: "--r-critical",
    icon: icon(
      <>
        <path
          d="M6.9 2.75h6.2l4.15 4.15v6.2l-4.15 4.15H6.9l-4.15-4.15v-6.2L6.9 2.75Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <path d="M10 6.5v4" strokeWidth="2.2" />
        <path d="M10 13.5h.01" strokeWidth="2.2" />
      </>
    ),
  },
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const { label, cssVar, icon } = CONFIG[level];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-sm font-medium"
      style={{
        color: `var(${cssVar})`,
        borderColor: `color-mix(in srgb, var(${cssVar}) 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, var(${cssVar}) 7%, var(--surface))`,
      }}
    >
      {icon}
      {label}
    </span>
  );
}
