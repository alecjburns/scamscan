"use client";

import { TapSelect, TextField } from "./fields";

export type LinkedInState = {
  verification: "" | "none" | "premium" | "verified" | "unknown";
  profileEmployer: string;
  hasPosts: "" | "yes" | "no" | "unknown";
  postEngagement: "" | "none" | "few" | "some" | "many" | "unknown";
  mutualConnections: "" | "yes" | "no" | "unknown";
};

export const EMPTY_LINKEDIN: LinkedInState = {
  verification: "",
  profileEmployer: "",
  hasPosts: "",
  postEngagement: "",
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

/** Glanceable LinkedIn checks only — skip anything unsure. */
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
        label="Profile badge?"
        value={value.verification}
        onChange={(v) => set({ verification: v })}
        options={[
          { value: "none", label: "None" },
          { value: "premium", label: "Premium" },
          { value: "verified", label: "Verified" },
          { value: "unknown", label: "Not sure" },
        ]}
      />

      <TextField
        id="profileEmployer"
        label="Employer shown on their profile"
        value={value.profileEmployer}
        onChange={(v) => set({ profileEmployer: v })}
        placeholder="Current company in headline / experience"
      />

      <TapSelect
        label="Do they have posts?"
        value={value.hasPosts}
        onChange={(v) => {
          set({
            hasPosts: v,
            // Clear engagement if they don't have posts / aren't sure.
            postEngagement: v === "yes" ? value.postEngagement : "",
          });
        }}
        options={YES_NO_UNSURE}
      />

      {value.hasPosts === "yes" && (
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
      )}

      <TapSelect
        label="Any mutual connections?"
        value={value.mutualConnections}
        onChange={(v) => set({ mutualConnections: v })}
        options={YES_NO_UNSURE}
      />
    </div>
  );
}
