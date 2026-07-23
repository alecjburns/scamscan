"use client";

import { TapSelect, TextField } from "./fields";

export type LinkedInState = {
  verification: "" | "none" | "identity" | "workplace" | "unknown";
  profileEmployer: string;
  connections: "" | "lt50" | "50to500" | "gt500" | "unknown";
  profileLocationMatches: "" | "yes" | "no" | "unknown";
  activityLevel: "" | "none" | "some" | "regular" | "unknown";
  postEngagement: "" | "none" | "few" | "some" | "many" | "unknown";
  listedOnCompanyPage: "" | "yes" | "no" | "unknown";
  mutualConnections: "" | "yes" | "no" | "unknown";
};

export const EMPTY_LINKEDIN: LinkedInState = {
  verification: "",
  profileEmployer: "",
  connections: "",
  profileLocationMatches: "",
  activityLevel: "",
  postEngagement: "",
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

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Open the profile and tell us what you see. Use More → &ldquo;About this profile&rdquo; for
        location. &ldquo;Not sure&rdquo; never counts against you.
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

      <TapSelect
        label="Engagement on recent posts?"
        hint="likes or comments"
        value={value.postEngagement}
        onChange={(v) => set({ postEngagement: v })}
        options={[
          { value: "none", label: "0" },
          { value: "few", label: "1–4" },
          { value: "some", label: "5–20" },
          { value: "many", label: "20+" },
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
