export type UserType =
  | "individual"
  | "business"
  | "public_entity"
  | "developer"
  | "event_planner"
  | "housing_provider"
  | "educator"
  | "medical_provider"
  | "legal_provider"
  | "travel_provider"
  | "unknown";

export type ScenarioType =
  | "housing"
  | "employment"
  | "public_accommodation"
  | "government"
  | "education"
  | "travel"
  | "digital_accessibility"
  | "document_accessibility"
  | "event_accessibility"
  | "medical_setting"
  | "legal_setting"
  | "general_planning"
  | "unknown";

export type UserIntent =
  | "understand_rights"
  | "request_accommodation"
  | "improve_accessibility"
  | "respond_to_barrier"
  | "handle_complaint"
  | "prepare_for_upcoming_situation"
  | "find_resources"
  | "general_question"
  | "unknown";

export type AccessDomain =
  | "physical"
  | "communication"
  | "digital"
  | "policy"
  | "procedural"
  | "mixed"
  | "unknown";

export type TimingType =
  | "current"
  | "upcoming"
  | "denied_or_unresolved"
  | "unknown";

export type ClassificationResult = {
  primary_user_type: string;
  primary_scenario: string;
  secondary_scenarios: string[];
  user_intent: string;
  access_domain: string;
  urgency: string;
  timing: string;
  setting_context: string;
  other_person_involved: boolean;
  other_person_roles: string[];
  possible_discrimination: boolean;
  witnesses_present: boolean;
  needs_location: boolean;
  location_provided: boolean;
  needs_clarification: boolean;
  clarification_topics: string[];
  possible_frameworks: string[];
  needs_human_escalation_consideration: boolean;
  confidence: number;
  reasoning_summary: string;
};
export type FollowupQuestion = {
  id: string;
  question: string;
  why_it_matters?: string;
};
export type GuidanceSections = {
  situation_summary: string;
  relevant_frameworks: string[];
  frameworks_note: string;
  recommended_next_steps: string[];
  request_or_documentation_guidance: string;
  barrier_denial_guidance: string;
  helpful_resources_or_support_types: string[];
  best_practices_or_additional_considerations: string[];
  important_note: string;
};

export type OptionalActionType =
  | "draft_request"
  | "draft_followup"
  | "complaint_outline"
  | "business_checklist"
  | "digital_checklist";