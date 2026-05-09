import {
  GuidanceFlags,
  GuidanceInput,
  HarmType,
  IssueCategory,
  UrgencyLevel,
  UserGoal,
} from "./types";

function includesAny(text: string, patterns: string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

export function deriveGuidanceFlags(input: GuidanceInput): GuidanceFlags {
  const raw = input.userInput ?? "";
  const text = raw.toLowerCase();

  const category = detectCategory(text);
  const goals = detectGoals(text);
  const urgency = detectUrgency(text);
  const harmTypes = detectHarmTypes(text);

  const accommodationRelated = includesAny(text, [
    "accommodation",
    "reasonable accommodation",
    "work from home",
    "remote work",
    "modification",
    "adjustment",
    "interpreter",
    "captioning",
    "accessible format",
    "screen reader",
    "service animal",
    "support animal",
    "leave",
    "modified schedule",
  ]);

  const likelyMedicalDocumentationRelevant =
    accommodationRelated &&
    (
      includesAny(text, [
        "doctor note",
        "medical documentation",
        "documentation",
        "verification",
        "medical proof",
        "they asked for proof",
        "they asked for a note",
      ]) ||
      includesAny(text, [
        "work from home",
        "remote work",
        "leave",
        "modified schedule",
        "schedule change",
        "telework",
      ])
    );

  return {
    category,
    goals,
    urgency,
    harmTypes,
    ongoingRelationship: includesAny(text, [
      "employer",
      "landlord",
      "school",
      "professor",
      "doctor",
      "hospital",
      "facility",
      "manager",
      "hr",
      "supervisor",
      "teacher",
      "housing provider",
    ]),
    directResolutionAttempted: includesAny(text, [
      "i already asked",
      "i already told them",
      "they denied",
      "they refused",
      "no response",
      "ignored me",
      "i filed internally",
      "i complained already",
    ]),
    explicitAccommodationRequest: includesAny(text, [
      "reasonable accommodation",
      "accommodation due to my disability",
      "because of my disability",
    ]),
    likelyMedicalDocumentationRelevant,
    veteranContext: includesAny(text, ["va", "veteran", "veterans affairs"]),
    olderAdultOrCaregiverContext: includesAny(text, [
      "caregiver",
      "elder",
      "older adult",
      "my parent",
      "my mother",
      "my father",
      "nursing home",
      "assisted living",
    ]),
    crisisRisk: includesAny(text, [
      "suicidal",
      "crisis",
      "i can't go on",
      "panic",
      "mental health emergency",
      "i want to die",
    ]),
    isFederalEmployerOrFederalFunding: includesAny(text, [
      "federal employer",
      "federal agency",
      "federally funded",
      "receives federal funding",
      "government grant",
    ]),
    k12SpecialEducation: includesAny(text, [
      "iep",
      "special education",
      "child find",
      "504 plan",
      "school district",
    ]),
    publicSchoolOrCollege: includesAny(text, [
      "public school",
      "college",
      "university",
      "campus",
      "professor",
      "student affairs",
      "disability services",
    ]),
    isGovernmentEntity:
      category === "government_service" ||
      includesAny(text, [
        "city",
        "county",
        "state agency",
        "dmv",
        "public office",
        "public meeting",
        "municipal",
      ]),
    accommodationRelated,
  };
}

function detectCategory(text: string): IssueCategory {
  if (
    includesAny(text, [
      "job",
      "work",
      "employer",
      "employee",
      "hr",
      "manager",
      "supervisor",
      "coworker",
      "workplace",
    ])
  ) {
    return "employment";
  }

  if (
    includesAny(text, [
      "landlord",
      "apartment",
      "housing",
      "rent",
      "hoa",
      "property manager",
      "tenant",
      "lease",
    ])
  ) {
    return "housing";
  }

  if (
    includesAny(text, [
      "college",
      "university",
      "student",
      "iep",
      "504 plan",
      "special education",
      "school district",
      "disability services",
      "professor",
      "campus",
    ])
  ) {
    return "education";
  }

  if (
    includesAny(text, ["airline", "airport", "flight", "wheelchair damaged"])
  ) {
    return "transportation";
  }

  if (
    includesAny(text, [
      "hospital",
      "doctor",
      "clinic",
      "patient",
      "medical office",
      "health system",
    ])
  ) {
    return "healthcare";
  }

  if (
    includesAny(text, [
      "nursing home",
      "assisted living",
      "long-term care",
      "resident",
    ])
  ) {
    return "long_term_care";
  }

  if (
    includesAny(text, [
      "website",
      "app",
      "digital",
      "screen reader",
      "online form",
      "portal",
      "webpage",
    ])
  ) {
    return "digital_access";
  }

  if (
    includesAny(text, [
      "city",
      "county",
      "state office",
      "dmv",
      "public program",
      "government",
      "municipal",
      "public agency",
    ])
  ) {
    return "government_service";
  }

  if (
    includesAny(text, [
      "restaurant",
      "store",
      "hotel",
      "business",
      "public accommodation",
      "gym",
      "theater",
    ])
  ) {
    return "public_accommodation";
  }

  return "other";
}

function detectGoals(text: string): UserGoal[] {
  const goals: UserGoal[] = [];

  if (includesAny(text, ["fix", "resolve", "make them", "get access"])) {
    goals.push("fix_issue");
  }
  if (includesAny(text, ["accommodation", "modification", "adjustment"])) {
    goals.push("get_accommodation");
  }
  if (includesAny(text, ["legal", "rights", "is this allowed", "is this legal"])) {
    goals.push("understand_rights");
  }
  if (includesAny(text, ["complaint", "report", "file"])) {
    goals.push("file_complaint");
  }
  if (includesAny(text, ["help", "who can help", "resource"])) {
    goals.push("get_help");
  }
  if (includesAny(text, ["compensation", "damages", "money", "reimburse", "repair"])) {
    goals.push("get_compensation");
  }
  if (includesAny(text, ["systemic", "everyone", "many people", "pattern"])) {
    goals.push("report_systemic_issue");
  }

  if (goals.length === 0) {
    goals.push("fix_issue", "understand_rights");
  }

  return [...new Set(goals)];
}

function detectUrgency(text: string): UrgencyLevel {
  if (
    includesAny(text, [
      "911",
      "emergency",
      "immediate danger",
      "trapped",
      "can't get out",
      "unsafe right now",
      "injured now",
      "blocked exit",
    ])
  ) {
    return "emergency";
  }

  if (
    includesAny(text, [
      "urgent",
      "soon",
      "deadline",
      "fired",
      "eviction",
      "suspended",
      "tomorrow",
      "immediately",
    ])
  ) {
    return "high";
  }

  if (includesAny(text, ["denied", "refused", "ongoing", "no response"])) {
    return "medium";
  }

  return "low";
}

function detectHarmTypes(text: string): HarmType[] {
  const harmTypes: HarmType[] = [];

  if (
    includesAny(text, [
      "wheelchair damaged",
      "device damaged",
      "broken chair",
      "property damage",
      "damaged scooter",
      "damaged equipment",
    ])
  ) {
    harmTypes.push("property_damage");
  }

  if (
    includesAny(text, [
      "injured",
      "hurt",
      "fell",
      "medical emergency",
      "physical injury",
    ])
  ) {
    harmTypes.push("physical_injury");
  }

  if (
    includesAny(text, [
      "lost wages",
      "money",
      "cost me",
      "financial loss",
      "out of pocket",
      "missed work",
    ])
  ) {
    harmTypes.push("financial_loss");
  }

  if (
    includesAny(text, [
      "stress",
      "distress",
      "humiliated",
      "emotional distress",
    ])
  ) {
    harmTypes.push("emotional_distress");
  }

  if (harmTypes.length === 0) {
    harmTypes.push("none");
  }

  return harmTypes;
}