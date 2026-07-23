"use client";

import { ContactSource } from "@/lib/types";
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

/** Channel-specific fields — only what people usually have to hand. */
export default function ChannelDetails({
  source,
  value,
  onChange,
  claimedCompany,
  onClaimedCompanyChange,
  emailRef,
  linkRef,
  extractedHint,
}: {
  source: ContactSource;
  value: DeeperState;
  onChange: (next: DeeperState) => void;
  claimedCompany: string;
  onClaimedCompanyChange: (v: string) => void;
  emailRef?: React.Ref<HTMLInputElement>;
  linkRef?: React.Ref<HTMLInputElement>;
  /** Shown when we pulled a link/email out of the pasted message. */
  extractedHint?: string | null;
}) {
  const set = (patch: Partial<DeeperState>) => onChange({ ...value, ...patch });

  const companyName = (
    <TextField
      id="claimedCompany"
      label="Company they claim to be from"
      value={claimedCompany}
      onChange={onClaimedCompanyChange}
      placeholder="e.g. Acme Corp"
    />
  );

  const website = (
    <TextField
      id="companyWebsite"
      label="Company website"
      hint="only if you already know it"
      value={value.companyWebsite}
      onChange={(v) => set({ companyWebsite: v })}
      placeholder="Skip if unsure"
    />
  );

  if (source === "linkedin") {
    return (
      <div className="space-y-4">
        {companyName}
        {extractedHint && <p className="text-xs text-muted">{extractedHint}</p>}
        {website}
      </div>
    );
  }

  if (source === "email") {
    return (
      <div className="space-y-4">
        <TextField
          id="email"
          label="Sender's email"
          hint="From: line — often not in the body"
          value={value.email}
          onChange={(v) => set({ email: v })}
          placeholder="e.g. anna@company.com"
          inputRef={emailRef}
          type="email"
          autoComplete="email"
        />
        {extractedHint && <p className="text-xs text-muted">{extractedHint}</p>}
        {value.applicationLink ? (
          <TextField
            id="applicationLink"
            label="Link found in the message"
            hint="we won't open it — edit if wrong"
            value={value.applicationLink}
            onChange={(v) => set({ applicationLink: v })}
            inputRef={linkRef}
          />
        ) : (
          <TextField
            id="applicationLink"
            label="Any link in the email"
            hint="we won't open it"
            value={value.applicationLink}
            onChange={(v) => set({ applicationLink: v })}
            placeholder="Auto-filled if present in the paste"
            inputRef={linkRef}
          />
        )}
        {companyName}
        {website}
      </div>
    );
  }

  if (source === "whatsapp") {
    return (
      <div className="space-y-4">
        {extractedHint && <p className="text-xs text-muted">{extractedHint}</p>}
        <TextField
          id="applicationLink"
          label="Any link they sent"
          hint="don't tap it — paste or we pick it up from the message"
          value={value.applicationLink}
          onChange={(v) => set({ applicationLink: v })}
          placeholder="Paste from the chat"
          inputRef={linkRef}
        />
        <TextField
          id="email"
          label="Any email they gave you"
          value={value.email}
          onChange={(v) => set({ email: v })}
          placeholder="Only if they sent one"
          inputRef={emailRef}
          type="email"
        />
        {companyName}
        {website}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {extractedHint && <p className="text-xs text-muted">{extractedHint}</p>}
      <TextField
        id="email"
        label="Sender's email"
        value={value.email}
        onChange={(v) => set({ email: v })}
        placeholder="If you have it"
        inputRef={emailRef}
        type="email"
      />
      <TextField
        id="applicationLink"
        label="Any link they sent"
        hint="we won't open it"
        value={value.applicationLink}
        onChange={(v) => set({ applicationLink: v })}
        placeholder="Auto-filled if present in the paste"
        inputRef={linkRef}
      />
      {companyName}
      {website}
    </div>
  );
}
