/** Pull emails/URLs out of pasted recruiter text so users don't re-type them. */

const EMAIL_RE =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

// http(s) links and bare domains that look intentional (www. or path).
const URL_RE =
  /\b(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`[\]]+/gi;

function cleanUrl(raw: string): string {
  let u = raw.replace(/[),.;:!?'"]+$/g, "");
  if (u.toLowerCase().startsWith("www.")) u = `https://${u}`;
  return u.slice(0, 2000);
}

export function extractContactsFromMessage(message: string): {
  emails: string[];
  links: string[];
} {
  const emails = [...new Set((message.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()))].slice(
    0,
    5
  );
  const links = [
    ...new Set((message.match(URL_RE) ?? []).map(cleanUrl).filter(Boolean)),
  ].slice(0, 5);
  return { emails, links };
}

/** Fill missing email/link on the input from the pasted message body. */
export function applyExtractedContacts<T extends {
  message: string;
  email?: string;
  applicationLink?: string;
}>(input: T): T {
  const { emails, links } = extractContactsFromMessage(input.message);
  const next = { ...input };
  if (!next.email && emails[0]) next.email = emails[0];
  if (!next.applicationLink && links[0]) next.applicationLink = links[0];
  return next;
}
