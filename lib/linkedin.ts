import { Finding, LinkedInAnswers } from "./types";
const normalise = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");

export function scoreLinkedIn(
  s: LinkedInAnswers & { claimedHiringCompany?: string; claimsSeniorRole?: boolean },
  currentYear: number
): { strong: Finding[]; soft: Finding[]; positive: Finding[] } {
  const strong: Finding[] = [], soft: Finding[] = [], positive: Finding[] = [];
  const isNewAccount = Boolean(s.accountCreatedYear && currentYear - s.accountCreatedYear < 1);

  // Tier 1 — facts LinkedIn itself asserts (warnings, "About this profile").
  if (s.linkedinWarningShown)
    strong.push({ id:"li_platform_warning", explanation:"LinkedIn itself flagged this message (often an off-platform-move warning)." });
  if (isNewAccount && s.claimsSeniorRole)
    strong.push({ id:"li_new_account_senior", explanation:"The profile was created very recently but the approach implies an established, senior recruiter." });

  // Tier 2 — objective things the user observed on the profile.
  if (s.profileEmployer && s.claimedHiringCompany && !normalise(s.profileEmployer).includes(normalise(s.claimedHiringCompany)))
    strong.push({ id:"li_employer_mismatch", explanation:"The recruiter's current employer on their profile doesn't match the company they claim to be hiring for." });
  if (s.listedOnCompanyPage === "no")
    strong.push({ id:"li_not_on_company_page", explanation:"You couldn't find this person on the company's LinkedIn People page." });
  if (s.activityLevel === "none" && isNewAccount)
    strong.push({ id:"li_new_silent_account", explanation:"The profile was created very recently and has no posts or activity — a common pattern for disposable scam accounts." });
  else if (s.activityLevel === "none")
    soft.push({ id:"li_no_activity", explanation:"The profile has no visible posts or activity." });
  if (s.profileLocationMatches === "no")
    soft.push({ id:"li_location_mismatch", explanation:"The profile's location (from \u201CAbout this profile\u201D) doesn't match where they claim to be based or hiring." });
  if (s.connections === "lt50")
    soft.push({ id:"li_few_connections", explanation:"The profile has very few connections." });

  // POSITIVE only — raises confidence, never cancels a danger signal.
  if (s.verification === "identity" || s.verification === "workplace")
    positive.push({ id:"li_verified", explanation:`LinkedIn shows ${s.verification} verification on this profile.` });
  if (s.accountCreatedYear && currentYear - s.accountCreatedYear >= 3)
    positive.push({ id:"li_established", explanation:"The account has existed for several years, consistent with a real professional history." });
  if (s.activityLevel === "regular")
    positive.push({ id:"li_active_history", explanation:"The profile shows a regular posting history, consistent with a long-standing professional presence." });
  if (s.listedOnCompanyPage === "yes")
    positive.push({ id:"li_on_company_page", explanation:"The person appears on the company's LinkedIn People page." });
  if (s.mutualConnections === "yes")
    positive.push({ id:"li_mutual_connections", explanation:"You share mutual connections with this profile." });

  // Absence of a badge, activity, or mutuals is never treated as a hard red flag on its
  // own, and no positive here can make the interaction "safe" (accounts get stolen).
  return { strong, soft, positive };
}
