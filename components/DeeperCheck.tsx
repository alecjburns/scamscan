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

function CompanyFields({
  claimedCompany,
  onClaimedCompanyChange,
  website,
  onWebsiteChange,
}: {
  claimedCompany: string;
  onClaimedCompanyChange: (v: string) => void;
  website: string;
  onWebsiteChange: (v: string) => void;
}) {
  return (
    <>
      <TextField
        id="claimedCompany"
        label="Company they claim to be from"
        value={claimedCompany}
        onChange={onClaimedCompanyChange}
        placeholder="e.g. Acme Corp"
      />
      <TextField
        id="companyWebsite"
        label="Their official website"
        value={website}
        onChange={onWebsiteChange}
        placeholder="e.g. company.com"
      />
    </>
  );
}

/** Channel-specific contact/domain fields — flat, lean. */
export default function ChannelDetails({
  source,
  value,
  onChange,
  claimedCompany,
  onClaimedCompanyChange,
  emailRef,
  linkRef,
  linkedinPart,
}: {
  source: ContactSource;
  value: DeeperState;
  onChange: (next: DeeperState) => void;
  claimedCompany: string;
  onClaimedCompanyChange: (v: string) => void;
  emailRef?: React.Ref<HTMLInputElement>;
  linkRef?: React.Ref<HTMLInputElement>;
  /** LinkedIn is split: company first, message extras after profile checks. */
  linkedinPart?: "company" | "message";
}) {
  const set = (patch: Partial<DeeperState>) => onChange({ ...value, ...patch });

  if (source === "linkedin") {
    if (linkedinPart === "message") {
      return (
        <div className="space-y-4">
          <TextField
            id="email"
            label="Email they shared in the message"
            value={value.email}
            onChange={(v) => set({ email: v })}
            placeholder="Only if they sent one"
            inputRef={emailRef}
            type="email"
          />
          <TextField
            id="applicationLink"
            label="Link they shared in the message"
            hint="we won't open it"
            value={value.applicationLink}
            onChange={(v) => set({ applicationLink: v })}
            placeholder="Only if they sent one"
            inputRef={linkRef}
          />
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <CompanyFields
          claimedCompany={claimedCompany}
          onClaimedCompanyChange={onClaimedCompanyChange}
          website={value.companyWebsite}
          onWebsiteChange={(v) => set({ companyWebsite: v })}
        />
      </div>
    );
  }

  if (source === "email") {
    return (
      <div className="space-y-4">
        <TextField
          id="email"
          label="Sender's email"
          value={value.email}
          onChange={(v) => set({ email: v })}
          placeholder="e.g. anna@company.com"
          inputRef={emailRef}
          type="email"
          autoComplete="email"
        />
        <TextField
          id="applicationLink"
          label="Any link in the email"
          hint="we won't open it"
          value={value.applicationLink}
          onChange={(v) => set({ applicationLink: v })}
          placeholder="Paste the link"
          inputRef={linkRef}
        />
        <CompanyFields
          claimedCompany={claimedCompany}
          onClaimedCompanyChange={onClaimedCompanyChange}
          website={value.companyWebsite}
          onWebsiteChange={(v) => set({ companyWebsite: v })}
        />
      </div>
    );
  }

  if (source === "whatsapp") {
    return (
      <div className="space-y-4">
        <TextField
          id="applicationLink"
          label="Any link they sent"
          hint="don't tap it — paste here"
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
          placeholder="e.g. hr@company.com"
          inputRef={emailRef}
          type="email"
        />
        <CompanyFields
          claimedCompany={claimedCompany}
          onClaimedCompanyChange={onClaimedCompanyChange}
          website={value.companyWebsite}
          onWebsiteChange={(v) => set({ companyWebsite: v })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TextField
        id="email"
        label="Sender's email"
        value={value.email}
        onChange={(v) => set({ email: v })}
        placeholder="e.g. anna@company.com"
        inputRef={emailRef}
        type="email"
      />
      <TextField
        id="applicationLink"
        label="Any link they sent"
        hint="we won't open it"
        value={value.applicationLink}
        onChange={(v) => set({ applicationLink: v })}
        placeholder="Paste the link"
        inputRef={linkRef}
      />
      <CompanyFields
        claimedCompany={claimedCompany}
        onClaimedCompanyChange={onClaimedCompanyChange}
        website={value.companyWebsite}
        onWebsiteChange={(v) => set({ companyWebsite: v })}
      />
    </div>
  );
}
