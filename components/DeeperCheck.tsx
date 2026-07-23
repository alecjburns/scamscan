"use client";

import { TextField } from "./fields";

export type DeeperState = {
  email: string;
  applicationLink: string;
  companyWebsite: string;
};

export const EMPTY_DEEPER: DeeperState = {
  email: "",
  applicationLink: "",
  companyWebsite: "",
};

export default function DeeperCheck({
  value,
  onChange,
  emailRef,
  hideCompanyWebsite = false,
}: {
  value: DeeperState;
  onChange: (next: DeeperState) => void;
  emailRef?: React.Ref<HTMLInputElement>;
  hideCompanyWebsite?: boolean;
}) {
  const set = (patch: Partial<DeeperState>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <TextField
        id="email"
        label="Sender's email"
        value={value.email}
        onChange={(v) => set({ email: v })}
        placeholder="e.g. anna.recruiter@example.com"
        inputRef={emailRef}
        type="email"
      />
      <TextField
        id="applicationLink"
        label="Application or interview link"
        value={value.applicationLink}
        onChange={(v) => set({ applicationLink: v })}
        placeholder="Paste the link they sent — we won't open it"
      />
      {!hideCompanyWebsite && (
        <TextField
          id="companyWebsite"
          label="Company's official website"
          hint="if you know it — big accuracy boost"
          value={value.companyWebsite}
          onChange={(v) => set({ companyWebsite: v })}
          placeholder="e.g. company.com"
        />
      )}
    </div>
  );
}
