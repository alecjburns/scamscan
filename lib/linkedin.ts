import { Finding, LinkedInAnswers } from "./types";
const normalise = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");

export function scoreLinkedIn(
  s: LinkedInAnswers & { claimedHiringCompany?: string; claimsSeniorRole?: boolean }
): { strong: Finding[]; soft: Finding[]; positive: Finding[] } {
  const strong: Finding[] = [], soft: Finding[] = [], positive: Finding[] = [];
  // claimsSeniorRole is reserved for future profile-tenure signals; unused after
  // account-created-year was removed (LinkedIn no longer shows it reliably).
  void s.claimsSeniorRole;

  // Objective things the user observed on the profile.
  if (s.profileEmployer && s.claimedHiringCompany && !normalise(s.profileEmployer).includes(normalise(s.claimedHiringCompany)))
    strong.push({ id:"li_employer_mismatch", explanation:"The recruiter's current employer on their profile doesn't match the company they claim to be hiring for." });
  if (s.listedOnCompanyPage === "no")
    strong.push({ id:"li_not_on_company_page", explanation:"You couldn't find this person on the company's LinkedIn People page." });
  if (s.activityLevel === "none")
    soft.push({ id:"li_no_activity", explanation:"The profile has no visible posts or activity." });
  if (s.postEngagement === "none")
    soft.push({ id:"li_no_engagement", explanation:"Recent posts show no likes or comments — disposable scam profiles often look active but get no real interaction." });
  if (s.profileLocationMatches === "no")
    soft.push({ id:"li_location_mismatch", explanation:"The profile's location (from \u201CAbout this profile\u201D) doesn't match where they claim to be based or hiring." });
  if (s.connections === "lt50")
    soft.push({ id:"li_few_connections", explanation:"The profile has very few connections." });

  // POSITIVE only — raises confidence, never cancels a danger signal.
  if (s.verification === "identity" || s.verification === "workplace")
    positive.push({ id:"li_verified", explanation:`LinkedIn shows ${s.verification} verification on this profile.` });
  if (s.activityLevel === "regular")
    positive.push({ id:"li_active_history", explanation:"The profile shows a regular posting history, consistent with a long-standing professional presence." });
  if (s.postEngagement === "few")
    positive.push({ id:"li_some_engagement", explanation:"Recent posts have a little engagement (likes or comments), which is more consistent with a real network than a silent profile." });
  if (s.postEngagement === "some" || s.postEngagement === "many")
    positive.push({
      id: "li_real_engagement",
      explanation:
        s.postEngagement === "many"
          ? "Recent posts have solid engagement (likes/comments) — harder to fake than empty activity."
          : "Recent posts have meaningful engagement (likes/comments), consistent with a real professional network.",
    });
  if (s.listedOnCompanyPage === "yes")
    positive.push({ id:"li_on_company_page", explanation:"The person appears on the company's LinkedIn People page." });
  if (s.mutualConnections === "yes")
    positive.push({ id:"li_mutual_connections", explanation:"You share mutual connections with this profile." });

  // Absence of a badge, activity, or mutuals is never treated as a hard red flag on its
  // own, and no positive here can make the interaction "safe" (accounts get stolen).
  return { strong, soft, positive };
}
