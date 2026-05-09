import { FilingOptionBlock, GuidanceFlags } from "./types";

export const FILING_OPTIONS = {
  doj: {
    office: "U.S. Department of Justice",
    level: "federal",
    what_it_handles:
      "ADA Title II and Title III complaints involving state and local government services and public accommodations.",
    website: "https://www.ada.gov/file-a-complaint/",
    phone: "800-514-0301",
    notes:
      "Important multi-file option for many non-employment ADA matters.",
  },
  eeoc: {
    office: "Equal Employment Opportunity Commission",
    level: "federal",
    what_it_handles:
      "Employment disability discrimination and reasonable accommodation complaints.",
    website:
      "https://www.eeoc.gov/how-file-charge-employment-discrimination",
    notes: "You can begin through the EEOC Public Portal.",
  },
  hud: {
    office: "U.S. Department of Housing and Urban Development",
    level: "federal",
    what_it_handles:
      "Housing discrimination complaints, including disability-related accommodation and modification issues.",
    website: "https://www.hud.gov/reporthousingdiscrimination",
    phone: "1-800-669-9777",
  },
  ocr: {
    office: "U.S. Department of Education Office for Civil Rights",
    level: "federal",
    what_it_handles:
      "Disability discrimination complaints involving schools, colleges, and other covered educational institutions.",
    website:
      "https://www.ed.gov/laws-and-policy/civil-rights-laws/file-complaint/how-file-discrimination-complaint-ocr",
    phone: "800-421-3481",
    email: "OCR@ed.gov",
  },
  dot: {
    office: "U.S. Department of Transportation",
    level: "federal",
    what_it_handles:
      "Disability-related air travel complaints, including accessibility and mobility device issues.",
    website: "https://www.transportation.gov/airconsumer",
  },
  stateCivilRights: {
    office: "State Civil Rights / Human Rights Agency",
    level: "state",
    what_it_handles:
      "State-law disability discrimination complaints in employment, housing, public accommodations, or government settings.",
    notes: "Specific office varies by state.",
  },
  localCivilRights: {
    office: "Local Civil Rights / Human Rights Office",
    level: "local",
    what_it_handles:
      "Local rights complaints, especially where a city or county has its own human rights framework.",
    notes: "Specific office varies by locality.",
  },
  localCode: {
    office: "Local Building / Code Enforcement",
    level: "local",
    what_it_handles:
      "Physical access and code-related barriers in the built environment.",
    notes:
      "Most useful for ramps, parking, entrances, bathrooms, and similar barriers.",
  },
} satisfies Record<string, FilingOptionBlock>;

export function selectFilingOptions(
  flags: GuidanceFlags
): FilingOptionBlock[] {
  const options: FilingOptionBlock[] = [];

  switch (flags.category) {
    case "employment":
      options.push(FILING_OPTIONS.eeoc, FILING_OPTIONS.stateCivilRights);
      break;

    case "housing":
      options.push(FILING_OPTIONS.hud, FILING_OPTIONS.stateCivilRights);
      break;

    case "education":
      options.push(FILING_OPTIONS.ocr, FILING_OPTIONS.stateCivilRights);
      break;

    case "public_accommodation":
      options.push(
        FILING_OPTIONS.doj,
        FILING_OPTIONS.stateCivilRights,
        FILING_OPTIONS.localCode
      );
      break;

    case "government_service":
      options.push(
        FILING_OPTIONS.doj,
        FILING_OPTIONS.stateCivilRights,
        FILING_OPTIONS.localCivilRights
      );
      break;

    case "transportation":
      options.push(FILING_OPTIONS.dot, FILING_OPTIONS.doj);
      break;

    case "digital_access":
      options.push(FILING_OPTIONS.doj);
      break;

    default:
      options.push(FILING_OPTIONS.doj, FILING_OPTIONS.stateCivilRights);
      break;
  }

  return dedupeByOffice(options);
}

function dedupeByOffice<T extends { office: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.office)) return false;
    seen.add(item.office);
    return true;
  });
}