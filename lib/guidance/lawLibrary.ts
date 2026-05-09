import { GuidanceFlags, LawBlock } from "./types";

export const LAW_LIBRARY = {
  ada_title_i: {
    law_name: "Americans with Disabilities Act",
    title_or_section: "Title I – Employment",
    description:
      "Prohibits disability discrimination in employment and requires reasonable accommodations for qualified employees and applicants.",
    citation: "42 U.S.C. § 12112",
  },
  ada_title_ii: {
    law_name: "Americans with Disabilities Act",
    title_or_section: "Title II – State and Local Government",
    description:
      "Requires state and local government programs, services, and activities to be accessible to people with disabilities.",
    citation: "42 U.S.C. § 12132",
  },
  ada_title_iii: {
    law_name: "Americans with Disabilities Act",
    title_or_section: "Title III – Public Accommodations",
    description:
      "Prohibits disability discrimination by businesses and nonprofits that serve the public and requires accessible goods, services, and facilities.",
    citation: "42 U.S.C. § 12182",
  },
  rehab_501: {
    law_name: "Rehabilitation Act of 1973",
    title_or_section: "Section 501 – Federal Employment",
    description:
      "Prohibits disability discrimination in federal employment and supports reasonable accommodation obligations in that context.",
    citation: "29 U.S.C. § 791",
  },
  rehab_504: {
    law_name: "Rehabilitation Act of 1973",
    title_or_section: "Section 504 – Federally Funded Programs",
    description:
      "Prohibits disability discrimination by programs or activities receiving federal financial assistance.",
    citation: "29 U.S.C. § 794",
  },
  fha_disability: {
    law_name: "Fair Housing Act",
    title_or_section:
      "Disability Protections – Reasonable Accommodation and Modification",
    description:
      "Prohibits disability discrimination in housing and supports reasonable accommodations and reasonable modifications in covered housing.",
    citation: "42 U.S.C. § 3604(f)",
  },
  aca_air: {
    law_name: "Air Carrier Access Act",
    title_or_section: "Disability Protections in Air Travel",
    description:
      "Prohibits disability discrimination by air carriers and governs accessibility obligations in air travel.",
    citation: "49 U.S.C. § 41705",
  },
  idea: {
    law_name: "Individuals with Disabilities Education Act",
    title_or_section: "IDEA – Special Education and Related Services",
    description:
      "Provides rights and procedures for eligible children with disabilities to receive special education and related services.",
    citation: "20 U.S.C. § 1400 et seq.",
  },
} satisfies Record<string, LawBlock>;

export function selectRelevantLaws(flags: GuidanceFlags): LawBlock[] {
  switch (flags.category) {
    case "employment":
      if (flags.isFederalEmployerOrFederalFunding) {
        return [
          LAW_LIBRARY.ada_title_i,
          LAW_LIBRARY.rehab_501,
          LAW_LIBRARY.rehab_504,
        ];
      }
      return [LAW_LIBRARY.ada_title_i];

    case "housing":
      return [LAW_LIBRARY.fha_disability];

    case "education":
      if (flags.k12SpecialEducation) {
        return [LAW_LIBRARY.idea, LAW_LIBRARY.rehab_504];
      }
      if (flags.publicSchoolOrCollege) {
        return [LAW_LIBRARY.ada_title_ii, LAW_LIBRARY.rehab_504];
      }
      return [LAW_LIBRARY.rehab_504];

    case "public_accommodation":
      return [LAW_LIBRARY.ada_title_iii];

    case "government_service":
      return [LAW_LIBRARY.ada_title_ii, LAW_LIBRARY.rehab_504];

    case "transportation":
      return [LAW_LIBRARY.aca_air];

    case "digital_access":
      return flags.isGovernmentEntity
        ? [LAW_LIBRARY.ada_title_ii, LAW_LIBRARY.rehab_504]
        : [LAW_LIBRARY.ada_title_iii];

    default:
      return [];
  }
}