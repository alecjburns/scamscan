/** Known staffing / recruiting firm domains. Contact from these against a
 * different company site is often a legitimate third-party recruiter — treat
 * as soft context, not a strong domain mismatch. Lookalike domains still escalate. */
const AGENCY_DOMAINS = new Set([
  "michaelpage.com", "michaelpage.co.uk", "pagepersonnel.com", "pagegroup.com",
  "robertwalters.com", "robertwalters.co.uk",
  "hays.com", "hays.co.uk",
  "reed.co.uk", "reedglobal.com",
  "adecco.com", "adecco.co.uk",
  "randstad.com", "randstad.co.uk",
  "manpower.com", "manpowergroup.com",
  "kforce.com", "roberthalf.com", "roberthalf.co.uk",
  "spencerstuart.com", "egonzehnder.com", "heidrick.com", "kornferry.com",
  "allegisgroup.com", "tekwsystems.com", "teksystems.com", "aerotek.com",
  "insightglobal.com", "modis.com", "jeffersonfrank.com", "harveynash.com",
  "hudson.com", "hudson.co.uk", "sthree.com", "computerfutures.com",
  "search.co.uk", "totaljobs.com", "cwjobs.com", "monster.com", "monster.co.uk",
  "indeed.com", "linkedin.com",
  "greenhouse.io", "lever.co", "workable.com", "ashbyhq.com", "smartrecruiters.com",
  "bamboohr.com", "icims.com", "jobvite.com",
]);

const AGENCY_HINTS = [
  "recruit", "staffing", "talent", "careers", "jobs", "hiring", "search",
  "personnel", "consulting", "consultancy", "placement", "workforce",
];

export function isLikelyAgencyDomain(domain: string): boolean {
  const reg = domain.toLowerCase().replace(/^www\./, "");
  if (AGENCY_DOMAINS.has(reg)) return true;
  // Also match subdomains of known agencies, e.g. uk.michaelpage.com
  for (const a of AGENCY_DOMAINS) {
    if (reg.endsWith(`.${a}`)) return true;
  }
  const brand = reg.split(".")[0] ?? "";
  return AGENCY_HINTS.some((h) => brand.includes(h));
}
