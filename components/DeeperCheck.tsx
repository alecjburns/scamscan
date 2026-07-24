"use client";

import { ContactSource } from "@/lib/types";
import { TextField, TapSelect } from "./fields";

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
  extractedChips,
  leftPlatform,
  onLeftPlatformChange,
}: {
  source: ContactSource;
  value: DeeperState;
  onChange: (next: DeeperState) => void;
  claimedCompany: string;
  onClaimedCompanyChange: (v: string) => void;
  emailRef?: React.Ref<HTMLInputElement>;
  linkRef?: React.Ref<HTMLInputElement>;
  extractedChips?: { email?: string; link?: string };
  leftPlatform?: "" | "yes" | "no" | "unknown";
  onLeftPlatformChange?: (v: "" | "yes" | "no" | "unknown") => void;
}) {
  const set = (patch: Partial<DeeperState>) => onChange({ ...value, ...patch });

  const chips =
    extractedChips && (extractedChips.email || extractedChips.link) ? (
      <div className="flex flex-wrap gap-1.5">
        {extractedChips.email && (
          <span className="rounded-[var(--radius-pill)] border border-line bg-bg px-2.5 py-1 text-xs text-ink">
            Email found: {extractedChips.email}
          </span>
        )}
        {extractedChips.link && (
          <span className="max-w-full truncate rounded-[var(--radius-pill)] border border-line bg-bg px-2.5 py-1 text-xs text-ink">
            Link found: {extractedChips.link}
          </span>
        )}
      </div>
    ) : null;

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
        {chips}
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
        {chips}
        <TextField
          id="applicationLink"
          label="Any link in the email"
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

  if (source === "whatsapp") {
    return (
      <div className="space-y-4">
        {onLeftPlatformChange && (
          <TapSelect
            label="Did they ask you to leave LinkedIn (or email) for this chat?"
            value={leftPlatform ?? ""}
            onChange={onLeftPlatformChange}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "unknown", label: "Not sure" },
            ]}
          />
        )}
        {chips}
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
      {chips}
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
