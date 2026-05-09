import { GuidanceFlags, HelpResourceBlock } from "./types";

const ALL_HELP_RESOURCES: HelpResourceBlock[] = [
  {
    name: "State Disability Rights Organization",
    kind: "legal_advocacy",
    description:
      "Protection and advocacy organizations may provide rights guidance, advocacy, and sometimes legal help.",
  },
  {
    name: "Legal Aid",
    kind: "legal_help",
    description:
      "Free or low-cost legal assistance may help when compensation, eviction, job loss, or formal legal relief is involved.",
  },
  {
    name: "Job Accommodation Network (JAN)",
    kind: "technical_guidance",
    description:
      "Provides practical guidance on workplace accommodations and ADA employment issues.",
    website: "https://askjan.org/",
  },
  {
    name: "211",
    kind: "community_navigation",
    description:
      "Connects people to local health and human services, including housing, food, caregiver support, and other community resources.",
    website: "https://www.211.org/",
    phone: "211",
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    kind: "crisis",
    description:
      "Use when there is emotional crisis, suicidal thinking, or urgent mental health distress.",
    phone: "988",
  },
  {
    name: "ADRC / Aging and Disability Resource Center",
    kind: "aging_disability_navigation",
    description:
      "Local aging and disability navigation hub for long-term supports and services.",
  },
  {
    name: "Eldercare Locator",
    kind: "aging_disability_navigation",
    description:
      "Connects older adults and caregivers to local services and support.",
    website: "https://eldercare.acl.gov/home",
    phone: "1-800-677-1116",
  },
  {
    name: "VA Patient Advocate",
    kind: "veterans_support",
    description: "Can help resolve concerns within the VA healthcare system.",
    website: "https://www.va.gov/health/patientadvocate/",
  },
  {
    name: "Long-Term Care Ombudsman",
    kind: "ombuds",
    description:
      "Can help address concerns about resident rights, quality of care, and access issues in long-term care settings.",
  },
  {
    name: "Hospital Patient Advocate",
    kind: "ombuds",
    description:
      "Can help resolve access, communication, or accommodation concerns within a healthcare setting.",
  },
  {
    name: "Education Ombudsman / Student Advocate",
    kind: "ombuds",
    description:
      "May help resolve disability services disputes or accommodation concerns in education settings.",
  },
];

export function selectHelpResources(flags: GuidanceFlags): HelpResourceBlock[] {
  const selected: HelpResourceBlock[] = [];

  selected.push(ALL_HELP_RESOURCES[0]); // Disability Rights
  selected.push(ALL_HELP_RESOURCES[1]); // Legal Aid
  selected.push(ALL_HELP_RESOURCES[3]); // 211

  if (flags.accommodationRelated && flags.category === "employment") {
    selected.push(ALL_HELP_RESOURCES[2]); // JAN
  }

  if (flags.crisisRisk) {
    selected.push(ALL_HELP_RESOURCES[4]); // 988
  }

  if (flags.olderAdultOrCaregiverContext) {
    selected.push(ALL_HELP_RESOURCES[5]); // ADRC
    selected.push(ALL_HELP_RESOURCES[6]); // Eldercare
  }

  if (flags.veteranContext) {
    selected.push(ALL_HELP_RESOURCES[7]); // VA
  }

  return dedupeByName(selected);
}

export function selectOmbudsOptions(
  flags: GuidanceFlags
): HelpResourceBlock[] {
  const selected: HelpResourceBlock[] = [];

  if (flags.category === "long_term_care") {
    selected.push(ALL_HELP_RESOURCES[8]);
  }

  if (flags.category === "healthcare") {
    selected.push(ALL_HELP_RESOURCES[9]);
  }

  if (flags.category === "education") {
    selected.push(ALL_HELP_RESOURCES[10]);
  }

  if (flags.category === "government_service") {
    selected.push({
      name: "Government Ombudsman / Public Services Complaint Office",
      kind: "ombuds",
      description:
        "May help resolve delays, access barriers, or communication problems involving public services.",
    });
  }

  if (flags.veteranContext) {
    selected.push(ALL_HELP_RESOURCES[7]);
  }

  return dedupeByName(selected);
}

function dedupeByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}