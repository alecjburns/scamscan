"use client";

import { TapSelect, TextField } from "./fields";

export type LinkedInState = {
  verification: "" | "none" | "identity" | "workplace" | "unknown";
  accountCreatedYear: string;
  linkedinWarningShown: "" | "yes" | "no";
  profileEmployer: string;
  connections: "" | "lt50" | "50to500" | "gt500" | "unknown";
  profileLocationMatches: "" | "yes" | "no" | "unknown";
  activityLevel: "" | "none" | "some" | "regular" | "unknown";
  listedOnCompanyPage: "" | "yes" | "no" | "unknown";
  mutualConnections: "" | "yes" | "no" | "unknown";
};

export const EMPTY_LINKEDIN: LinkedInState = {
  verification: "",
  accountCreatedYear: "",
  linkedinWarningShown: "",
  profileEmployer: "",
  connections: "",
  profileLocationMatches: "",
  activityLevel: "",
  listedOnCompanyPage: "",
  mutualConnections: "",
};

export function linkedInTouched(li: LinkedInState): boolean {
  return Object.entries(li).some(([k, v]) =>
    k === "profileEmployer" ? (v as string).trim() !== "" : v !== ""
  );
}

const YES_NO_UNSURE = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
  { value: "unknown" as const, label: "Not sure" },
];

/** Flat LinkedIn profile questions — no nested expanders. */
export default function LinkedInCheck({
  value,
  onChange,
}: {
  value: LinkedInState;
  onChange: (next: LinkedInState) => void;
}) {
  const set = (patch: Partial<LinkedInState>) => onChange({ ...value, ...patch });
  const yearIsNotShown = value.accountCreatedYear === "not_shown";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Open the profile → More → &ldquo;About this profile&rdquo; and tell us what you see.
        &ldquo;Not sure&rdquo; never counts against you.
      </p>

      <TapSelect
        label="Verification badge?"
        value={value.verification}
        onChange={(v) => set({ verification: v })}
        options={[
          { value: "none", label: "None" },
          { value: "identity", label: "Identity" },
          { value: "workplace", label: "Workplace" },
          { value: "unknown", label: "Not sure" },
        ]}
      />

      <fieldset>
        <legend className="text-sm font-medium text-ink">Account created year?</legend>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            min={2003}
            max={new Date().getFullYear()}
            value={yearIsNotShown ? "" : value.accountCreatedYear}
            onChange={(e) => set({ accountCreatedYear: e.target.value })}
            placeholder="e.g. 2019"
            aria-label="Account created year"
            className="min-h-10 w-28 rounded-[var(--radius-input)] border border-line bg-surface px-3 py-2 text-base text-ink placeholder:text-muted sm:min-h-0 sm:py-1.5 sm:text-sm"
          />
          <button
            type="button"
            role="radio"
            aria-checked={yearIsNotShown}
            onClick={() => set({ accountCreatedYear: yearIsNotShown ? "" : "not_shown" })}
            className={`min-h-10 rounded-[var(--radius-pill)] border px-3 py-2 text-sm transition-colors sm:min-h-0 sm:py-1.5 ${
              yearIsNotShown
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink hover:border-accent"
            }`}
          >
            Not shown
          </button>
        </div>
      </fieldset>

      <TapSelect
        label="Did LinkedIn warn on this message?"
        value={value.linkedinWarningShown}
        onChange={(v) => set({ linkedinWarningShown: v })}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />

      <p className="border-t border-line pt-3 text-xs font-medium uppercase tracking-wide text-muted">
        More about the profile
      </p>

      <TapSelect
        label="Does the profile's location match where they claim to be based or hiring?"
        hint={"shown in \u201CAbout this profile\u201D"}
        value={value.profileLocationMatches}
        onChange={(v) => set({ profileLocationMatches: v })}
        options={YES_NO_UNSURE}
      />
      <TapSelect
        label="Posts and activity on the profile?"
        value={value.activityLevel}
        onChange={(v) => set({ activityLevel: v })}
        options={[
          { value: "none", label: "None" },
          { value: "some", label: "A little" },
          { value: "regular", label: "Regular, going back years" },
          { value: "unknown", label: "Not sure" },
        ]}
      />
      <TextField
        id="profileEmployer"
        label="Recruiter's employer on their profile"
        value={value.profileEmployer}
        onChange={(v) => set({ profileEmployer: v })}
        placeholder="As shown in their headline or experience"
      />
      <TapSelect
        label="Are they listed on the company's LinkedIn page?"
        hint="People tab"
        value={value.listedOnCompanyPage}
        onChange={(v) => set({ listedOnCompanyPage: v })}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "unknown", label: "Couldn't check" },
        ]}
      />
      <TapSelect
        label="Any mutual connections?"
        value={value.mutualConnections}
        onChange={(v) => set({ mutualConnections: v })}
        options={YES_NO_UNSURE}
      />
      <TapSelect
        label="Connections"
        value={value.connections}
        onChange={(v) => set({ connections: v })}
        options={[
          { value: "lt50", label: "<50" },
          { value: "50to500", label: "50–500" },
          { value: "gt500", label: "500+" },
          { value: "unknown", label: "Not sure" },
        ]}
      />
    </div>
  );
}
