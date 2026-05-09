import { GuidanceFlags } from "./types";

export type ModulePlan = {
  includeSafety: boolean;
  includeDirectResolution: boolean;
  includeMedicalDocumentation: boolean;
  includeCompensation: boolean;
  includeOmbuds: boolean;
  includeDeadlines: boolean;
};

export function buildModulePlan(flags: GuidanceFlags): ModulePlan {
  const hasMajorHarm =
    flags.harmTypes.includes("physical_injury") ||
    flags.harmTypes.includes("property_damage") ||
    flags.harmTypes.includes("financial_loss");

  return {
    includeSafety: flags.urgency === "emergency" || flags.crisisRisk,
    includeDirectResolution:
      ["low", "medium"].includes(flags.urgency) &&
      !flags.directResolutionAttempted &&
      !flags.harmTypes.includes("physical_injury"),
    includeMedicalDocumentation: flags.likelyMedicalDocumentationRelevant,
    includeCompensation:
      flags.goals.includes("get_compensation") || hasMajorHarm,
    includeOmbuds: [
      "healthcare",
      "long_term_care",
      "education",
      "government_service",
    ].includes(flags.category),
    includeDeadlines: [
      "employment",
      "housing",
      "education",
      "transportation",
    ].includes(flags.category),
  };
}