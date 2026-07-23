export type RiskLevel = "insufficient_evidence"|"low_apparent_risk"|"some_concerns"|"high_risk"|"critical_risk";
export type Confidence = "low"|"medium"|"high";
export type ContactSource = "linkedin"|"email"|"whatsapp"|"other";
export type Finding = { id: string; explanation: string };
export type Report = {
  risk_level: RiskLevel; confidence: Confidence;
  findings: { concerning: Finding[]; positive: Finding[]; unverified: Finding[] };
  recommended_action: string; is_linkedin: boolean;
  /** Plain-language list of what was examined — shown when findings are sparse. */
  checks_run: string[];
  /** True when the Anthropic wording classifier was skipped or failed. */
  classifier_failed?: boolean;
};
export type Signals = {
  paymentOrEquipmentRequest?: boolean; cryptoDeposit?: boolean; taskJobMoneyTransfer?: boolean;
  credentialOrSoftwareRequest?: boolean; platformSwitchPressure?: boolean; offerWithoutInterview?: boolean;
  sensitiveInfoRequest?: boolean; vagueRoleHighPay?: boolean; genericMassMessage?: boolean;
  urgencyOrSecrecy?: boolean; claimsSeniorRole?: boolean;
  evidence?: Record<string,string>; couldNotDetermine?: string[];
  /** Set by the route when the message classifier was skipped or failed —
   * the message text is then unanalysed, so nothing can be cleared as low risk. */
  classifierFailed?: boolean;
};
export type LinkedInAnswers = {
  verification?: "none"|"identity"|"workplace"|"unknown"; accountCreatedYear?: number|null;
  linkedinWarningShown?: boolean; profileEmployer?: string; connections?: "lt50"|"50to500"|"gt500"|"unknown";
  profileLocationMatches?: "yes"|"no"|"unknown";
  activityLevel?: "none"|"some"|"regular"|"unknown";
  listedOnCompanyPage?: "yes"|"no"|"unknown";
  mutualConnections?: "yes"|"no"|"unknown";
};
export type UserInput = {
  message: string; contactSource?: ContactSource;
  claimedCompany?: string; email?: string; applicationLink?: string; companyWebsite?: string;
  linkedin?: LinkedInAnswers;
};
