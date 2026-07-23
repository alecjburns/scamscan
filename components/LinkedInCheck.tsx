"use client";

import { TapSelect, TextField } from "./fields";

export type LinkedInState = {
  verification: "" | "none" | "identity" | "workplace" | "unknown";
  profileEmployer: string;
  postEngagement: "" | "no_posts" | "none" | "few" | "some" | "many" | "unknown";
  listedOnCompanyPage: "" | "yes" | "no" | "unknown";
  mutualConnections: "" | "yes" | "no" | "unknown";
};

export const EMPTY_LINKEDIN: LinkedInState = {
  verification: "",
  profileEmployer: "",
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

/** Lean LinkedIn profile checks — glanceable signals only. */
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

      <TextField
        id="profileEmployer"
        label="Employer on their profile"
        value={value.profileEmployer}
        onChange={(v) => set({ profileEmployer: v })}
        placeholder="Headline or current role"
      />

      <TapSelect
        label="Recent posts?"
        hint="likes / comments"
        value={value.postEngagement}
        onChange={(v) => set({ postEngagement: v })}
        options={[
          { value: "no_posts", label: "No posts" },
          { value: "none", label: "0" },
          { value: "few", label: "1–4" },
          { value: "some", label: "5–20" },
          { value: "many", label: "20+" },
          { value: "unknown", label: "Not sure" },
        ]}
      />

      <TapSelect
        label="Any mutual connections?"
        value={value.mutualConnections}
        onChange={(v) => set({ mutualConnections: v })}
        options={YES_NO_UNSURE}
      />

      <TapSelect
        label="On the company's LinkedIn People page?"
        value={value.listedOnCompanyPage}
        onChange={(v) => set({ listedOnCompanyPage: v })}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "unknown", label: "Couldn't check" },
        ]}
      />
    </div>
  );
}
