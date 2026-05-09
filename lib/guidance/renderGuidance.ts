import {
  ActionBlock,
  CompensationBlock,
  DirectResolutionBlock,
  ExpectationBlock,
  GuidanceFlags,
  GuidanceResponse,
  MedicalDocumentationBlock,
  SafetyBlock,
  SourceBlock,
  SummaryBlock,
} from "./types";
import { selectDeadlines } from "./deadlines";
import { selectFilingOptions } from "./filingOptions";
import { selectHelpResources, selectOmbudsOptions } from "./helpResources";
import { selectRelevantLaws } from "./lawLibrary";
import { buildModulePlan } from "./moduleBuilder";

export function renderGuidance(flags: GuidanceFlags): GuidanceResponse {
  const plan = buildModulePlan(flags);

  const summary = makeSummary(flags);
  const safety = plan.includeSafety ? makeSafety(flags) : undefined;
  const keyActions = makeKeyActions(flags);
  const directResolution = plan.includeDirectResolution
    ? makeDirectResolution(flags)
    : undefined;
  const medicalDocumentation = plan.includeMedicalDocumentation
    ? makeMedicalDocumentation()
    : undefined;
  const helpResources = selectHelpResources(flags);
  const filingOptions = selectFilingOptions(flags);
  const deadlines = plan.includeDeadlines ? selectDeadlines(flags) : [];
  const compensationNote = plan.includeCompensation
    ? makeCompensationBlock(flags)
    : undefined;
  const ombudsOptions = plan.includeOmbuds ? selectOmbudsOptions(flags) : [];
  const relevantLaw = selectRelevantLaws(flags).slice(0, 2);
  const expectationSetting = makeExpectationSetting(flags);
  const sources = buildSources(flags);

  return {
    version: "v1.1",
    summary,
    safety,
    key_actions: keyActions,
    direct_resolution: directResolution,
    medical_documentation: medicalDocumentation,
    help_resources: helpResources,
    filing_options: filingOptions,
    deadlines: deadlines.length ? deadlines : undefined,
    compensation_note: compensationNote,
    ombuds_options: ombudsOptions.length ? ombudsOptions : undefined,
    relevant_law: relevantLaw.length ? relevantLaw : undefined,
    expectation_setting: expectationSetting,
    sources,
  };
}

function makeSummary(flags: GuidanceFlags): SummaryBlock {
  const categoryText = categoryLabel(flags.category);

  if (flags.accommodationRelated) {
    return {
      title: "What matters most",
      text: `This appears to be a ${categoryText} reasonable accommodation issue. Acting soon and keeping a clear written record is important.`,
    };
  }

  if (
    flags.harmTypes.includes("property_damage") ||
    flags.harmTypes.includes("physical_injury") ||
    flags.harmTypes.includes("financial_loss")
  ) {
    return {
      title: "What matters most",
      text: `This appears to be a ${categoryText} accessibility issue involving harm or loss. Documentation and timely escalation may be important.`,
    };
  }

  return {
    title: "What matters most",
    text: `This appears to be a ${categoryText} accessibility issue. A clear, documented request and the right help path can make resolution easier.`,
  };
}

function makeSafety(flags: GuidanceFlags): SafetyBlock {
  const items: string[] = [];

  if (flags.urgency === "emergency") {
    items.push(
      "If you are in immediate danger or need urgent emergency assistance, call 911."
    );
  }

  if (flags.crisisRisk) {
    items.push(
      "If you are in emotional crisis or need urgent mental health support, call or text 988."
    );
  }

  return {
    title: "Safety",
    items,
  };
}

function makeKeyActions(flags: GuidanceFlags): ActionBlock[] {
  const actions: ActionBlock[] = [];

  if (flags.accommodationRelated) {
    actions.push({
      text: "Clearly state that you are requesting a reasonable accommodation due to a disability.",
    });
    actions.push({
      text: "Describe the barrier you are facing and the accommodation you are requesting.",
    });
    if (!flags.explicitAccommodationRequest) {
      actions.push({
        text: "If your earlier request did not clearly connect the need to your disability, restate it that way in your next communication.",
      });
    }
  }

  actions.push({
    text: "Use a format that can be documented and tracked, such as email, a portal, a written form, or another recordable process.",
  });

  actions.push({
    text: "Keep copies of your request, responses, dates, names, and any supporting documents.",
  });

  if (
    flags.harmTypes.includes("property_damage") ||
    flags.harmTypes.includes("physical_injury") ||
    flags.harmTypes.includes("financial_loss")
  ) {
    actions.push({
      text: "Document any injury, damage, or financial loss with photos, receipts, repair estimates, medical records, and a timeline if available.",
    });
  }

  if (flags.directResolutionAttempted) {
    actions.push({
      text: "If you were denied or ignored, ask for the reason in writing and whether any alternative accommodation or fix is available.",
    });
  }

  return actions.slice(0, 5);
}

function makeDirectResolution(flags: GuidanceFlags): DirectResolutionBlock {
  const items: string[] = [];

  if (flags.category === "employment") {
    items.push(
      "Contact HR, your supervisor, or the employer's accommodation process and ask how to continue the interactive process."
    );
  } else if (flags.category === "housing") {
    items.push(
      "Contact the landlord, property manager, or housing provider and clearly restate the request and why it is needed."
    );
  } else if (flags.category === "education") {
    items.push(
      "Contact disability services, the school administrator, or the appropriate coordinator and restate the concern in a trackable format."
    );
  } else if (flags.category === "healthcare") {
    items.push(
      "Contact the patient relations, accessibility, or patient advocate office and restate the concern in a trackable format."
    );
  } else {
    items.push(
      "Contact the entity directly and ask for the appropriate accessibility, ADA, or complaint contact."
    );
  }

  items.push("Ask for a written explanation if the request is denied.");
  items.push("Ask whether there is a formal grievance, appeal, or review process.");

  return {
    title: "Try to resolve directly",
    items,
  };
}

function makeMedicalDocumentation(): MedicalDocumentationBlock {
  return {
    title: "Medical documentation",
    items: [
      "Medical documentation may be requested when the disability or the need for the accommodation is not obvious.",
      "The documentation should be limited to showing that you have a disability and that the accommodation is needed because of that disability.",
      "Medical documentation is not necessary in every case and should only be requested when relevant.",
    ],
  };
}

function makeCompensationBlock(flags: GuidanceFlags): CompensationBlock {
  const items: string[] = [
    "Agencies may help investigate, mediate, or push for corrective action.",
    "If you are seeking compensation, repair, reimbursement, or other monetary relief, legal aid or a private attorney may also be important.",
  ];

  if (flags.harmTypes.includes("property_damage")) {
    items.push(
      "Property damage claims often require strong documentation such as photos, receipts, repair estimates, and the date of loss."
    );
  }

  if (flags.harmTypes.includes("physical_injury")) {
    items.push(
      "If there was physical injury, preserve medical records, incident reports, and witness information if available."
    );
  }

  return {
    title: "If you want compensation or damages",
    items,
  };
}

function makeExpectationSetting(flags: GuidanceFlags): ExpectationBlock {
  const items = [
    "Direct resolution can sometimes be the fastest path if the entity is responsive.",
    "A complaint process may lead to investigation, mediation, voluntary correction, or other compliance steps.",
    "Some outcomes, especially compensation or certain court-enforceable remedies, may require legal assistance.",
  ];

  if (flags.goals.includes("report_systemic_issue")) {
    items.push(
      "If the issue appears systemic or affects many people, a government enforcement agency or disability rights organization may be especially useful."
    );
  }

  return {
    title: "What to expect",
    items,
  };
}

function buildSources(flags: GuidanceFlags): SourceBlock[] {
  const base: SourceBlock[] = [
    { name: "ADA.gov", website: "https://www.ada.gov/" },
    { name: "ADA National Network", website: "https://adata.org/" },
  ];

  if (flags.category === "employment") {
    base.push({ name: "EEOC", website: "https://www.eeoc.gov/" });
  }
  if (flags.category === "housing") {
    base.push({ name: "HUD", website: "https://www.hud.gov/" });
  }
  if (flags.category === "education") {
    base.push({
      name: "U.S. Department of Education OCR",
      website: "https://www.ed.gov/",
    });
  }
  if (flags.category === "transportation") {
    base.push({
      name: "U.S. Department of Transportation",
      website: "https://www.transportation.gov/",
    });
  }

  return base;
}

function categoryLabel(category: GuidanceFlags["category"]): string {
  switch (category) {
    case "employment":
      return "employment-related";
    case "housing":
      return "housing-related";
    case "education":
      return "education-related";
    case "public_accommodation":
      return "public access";
    case "government_service":
      return "government service";
    case "transportation":
      return "transportation-related";
    case "healthcare":
      return "healthcare-related";
    case "long_term_care":
      return "long-term care";
    case "digital_access":
      return "digital accessibility";
    default:
      return "accessibility-related";
  }
}