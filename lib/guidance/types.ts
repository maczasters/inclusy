export type IssueCategory =
  | "employment"
  | "housing"
  | "education"
  | "public_accommodation"
  | "government_service"
  | "transportation"
  | "healthcare"
  | "long_term_care"
  | "digital_access"
  | "other";

export type UserGoal =
  | "fix_issue"
  | "get_accommodation"
  | "understand_rights"
  | "file_complaint"
  | "get_help"
  | "get_compensation"
  | "report_systemic_issue";

export type HarmType =
  | "none"
  | "property_damage"
  | "physical_injury"
  | "financial_loss"
  | "emotional_distress";

export type UrgencyLevel = "low" | "medium" | "high" | "emergency";

export type GuidanceFlags = {
  category: IssueCategory;
  goals: UserGoal[];
  urgency: UrgencyLevel;
  harmTypes: HarmType[];
  ongoingRelationship: boolean;
  directResolutionAttempted: boolean;
  explicitAccommodationRequest: boolean;
  likelyMedicalDocumentationRelevant: boolean;
  veteranContext: boolean;
  olderAdultOrCaregiverContext: boolean;
  crisisRisk: boolean;
  isFederalEmployerOrFederalFunding: boolean;
  k12SpecialEducation: boolean;
  publicSchoolOrCollege: boolean;
  isGovernmentEntity: boolean;
  accommodationRelated: boolean;
};

export type GuidanceInput = {
  userInput: string;
};

export type SummaryBlock = {
  title: string;
  text: string;
};

export type SafetyBlock = {
  title: string;
  items: string[];
};

export type ActionBlock = {
  text: string;
};

export type DirectResolutionBlock = {
  title: string;
  items: string[];
};

export type MedicalDocumentationBlock = {
  title: string;
  items: string[];
};

export type HelpResourceKind =
  | "legal_advocacy"
  | "legal_help"
  | "technical_guidance"
  | "community_navigation"
  | "crisis"
  | "aging_disability_navigation"
  | "veterans_support"
  | "ombuds";

export type HelpResourceBlock = {
  name: string;
  kind: HelpResourceKind;
  description: string;
  website?: string;
  phone?: string;
  email?: string;
};

export type FilingOptionBlock = {
  office: string;
  level: "federal" | "state" | "local" | "internal";
  what_it_handles: string;
  website?: string;
  phone?: string;
  email?: string;
  notes?: string;
};

export type DeadlineBlock = {
  title?: string;
  text: string;
};

export type CompensationBlock = {
  title: string;
  items: string[];
};

export type ExpectationBlock = {
  title: string;
  items: string[];
};

export type LawBlock = {
  law_name: string;
  title_or_section: string;
  description: string;
  citation: string;
};

export type SourceBlock = {
  name: string;
  website?: string;
};

export type GuidanceResponse = {
  version: "v1.1";
  summary: SummaryBlock;
  safety?: SafetyBlock;
  key_actions: ActionBlock[];
  direct_resolution?: DirectResolutionBlock;
  medical_documentation?: MedicalDocumentationBlock;
  help_resources: HelpResourceBlock[];
  filing_options: FilingOptionBlock[];
  deadlines?: DeadlineBlock[];
  compensation_note?: CompensationBlock;
  ombuds_options?: HelpResourceBlock[];
  relevant_law?: LawBlock[];
  expectation_setting?: ExpectationBlock;
  sources?: SourceBlock[];
};