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

/** Channel-specific detail fields — flat, no expanders. */
export default function ChannelDetails({
  source,
  value,
  onChange,
  emailRef,
  linkRef,
}: {
  source: ContactSource;
  value: DeeperState;
  onChange: (next: DeeperState) => void;
  emailRef?: React.Ref<HTMLInputElement>;
  linkRef?: React.Ref<HTMLInputElement>;
}) {
  const set = (patch: Partial<DeeperState>) => onChange({ ...value, ...patch });

  if (source === "email") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          For email approaches, the sender address and any links are the strongest checks.
        </p>
        <TextField
          id="email"
          label="Sender's email address"
          value={value.email}
          onChange={(v) => set({ email: v })}
          placeholder="e.g. anna.recruiter@example.com"
          inputRef={emailRef}
          type="email"
          autoComplete="email"
        />
        <TextField
          id="applicationLink"
          label="Any application or interview link in the email"
          hint="we won't open it"
          value={value.applicationLink}
          onChange={(v) => set({ applicationLink: v })}
          placeholder="Paste the link — don't click it"
          inputRef={linkRef}
        />
        <TextField
          id="companyWebsite"
          label="Company's official website"
          hint="big accuracy boost if you know it"
          value={value.companyWebsite}
          onChange={(v) => set({ companyWebsite: v })}
          placeholder="e.g. company.com"
        />
      </div>
    );
  }

  if (source === "whatsapp") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          For WhatsApp or text, don&rsquo;t tap links they send. Paste them here instead — we only
          check the domain, we never open the link.
        </p>
        <TextField
          id="applicationLink"
          label="Any link they sent"
          hint="we won't open it"
          value={value.applicationLink}
          onChange={(v) => set({ applicationLink: v })}
          placeholder="Paste the link from the chat"
          inputRef={linkRef}
        />
        <TextField
          id="email"
          label="Any email address they gave you"
          value={value.email}
          onChange={(v) => set({ email: v })}
          placeholder="e.g. hr@example.com"
          inputRef={emailRef}
          type="email"
        />
        <TextField
          id="companyWebsite"
          label="Company's official website"
          hint="if you can find it yourself"
          value={value.companyWebsite}
          onChange={(v) => set({ companyWebsite: v })}
          placeholder="e.g. company.com"
        />
      </div>
    );
  }

  if (source === "linkedin") {
    return (
      <div className="space-y-4 border-t border-line pt-4">
        <p className="text-sm font-medium text-ink">From the message itself</p>
        <p className="text-sm text-muted">
          Only fill these if they shared an email, link, or company site in the LinkedIn message.
        </p>
        <TextField
          id="companyWebsite"
          label="Company's official website"
          hint="big accuracy boost"
          value={value.companyWebsite}
          onChange={(v) => set({ companyWebsite: v })}
          placeholder="e.g. company.com"
        />
        <TextField
          id="email"
          label="Any email they shared"
          value={value.email}
          onChange={(v) => set({ email: v })}
          placeholder="e.g. anna@example.com"
          inputRef={emailRef}
          type="email"
        />
        <TextField
          id="applicationLink"
          label="Any application or calendar link"
          hint="we won't open it"
          value={value.applicationLink}
          onChange={(v) => set({ applicationLink: v })}
          placeholder="Paste the link — don't click it"
          inputRef={linkRef}
        />
      </div>
    );
  }

  // other
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Anything that helps verify the approach — we never open links or scrape profiles.
      </p>
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
        label="Any application or interview link"
        hint="we won't open it"
        value={value.applicationLink}
        onChange={(v) => set({ applicationLink: v })}
        placeholder="Paste the link"
        inputRef={linkRef}
      />
      <TextField
        id="companyWebsite"
        label="Company's official website"
        value={value.companyWebsite}
        onChange={(v) => set({ companyWebsite: v })}
        placeholder="e.g. company.com"
      />
    </div>
  );
}
