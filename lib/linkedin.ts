import { Finding, LinkedInAnswers } from "./types";
const normalise = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");

export function scoreLinkedIn(
  s: LinkedInAnswers & { claimedHiringCompany?: string; claimsSeniorRole?: boolean }
): { strong: Finding[]; soft: Finding[]; positive: Finding[] } {
  const strong: Finding[] = [], soft: Finding[] = [], positive: Finding[] = [];
  void s.claimsSeniorRole;

  if (
    s.profileEmployer &&
    s.claimedHiringCompany &&
    !normalise(s.profileEmployer).includes(normalise(s.claimedHiringCompany))
  )
    strong.push({
      id: "li_employer_mismatch",
      explanation:
        "The recruiter's current employer on their profile doesn't match the company they claim to be hiring for.",
    });
  if (s.listedOnCompanyPage === "no")
    strong.push({
      id: "li_not_on_company_page",
      explanation: "You couldn't find this person on the company's LinkedIn People page.",
    });

  if (s.postEngagement === "no_posts")
    soft.push({
      id: "li_no_posts",
      explanation: "The profile has no visible posts — common for disposable scam accounts.",
    });
  else if (s.postEngagement === "none")
    soft.push({
      id: "li_no_engagement",
      explanation:
        "Recent posts show no likes or comments — disposable scam profiles often look active but get no real interaction.",
    });

  // POSITIVE only — raises confidence, never cancels a danger signal.
  if (s.verification === "identity" || s.verification === "workplace")
    positive.push({
      id: "li_verified",
      explanation: `LinkedIn shows ${s.verification} verification on this profile.`,
    });
  if (s.postEngagement === "few")
    positive.push({
      id: "li_some_engagement",
      explanation:
        "Recent posts have a little engagement (likes or comments), which is more consistent with a real network than a silent profile.",
    });
  if (s.postEngagement === "some" || s.postEngagement === "many")
    positive.push({
      id: "li_real_engagement",
      explanation:
        s.postEngagement === "many"
          ? "Recent posts have solid engagement (likes/comments) — harder to fake than empty activity."
          : "Recent posts have meaningful engagement (likes/comments), consistent with a real professional network.",
    });
  if (s.listedOnCompanyPage === "yes")
    positive.push({
      id: "li_on_company_page",
      explanation: "The person appears on the company's LinkedIn People page.",
    });
  if (s.mutualConnections === "yes")
    positive.push({
      id: "li_mutual_connections",
      explanation: "You share mutual connections with this profile.",
    });

  return { strong, soft, positive };
}
