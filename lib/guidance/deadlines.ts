import { DeadlineBlock, GuidanceFlags } from "./types";

export function selectDeadlines(flags: GuidanceFlags): DeadlineBlock[] {
  switch (flags.category) {
    case "employment":
      return [
        {
          title: "Deadline to know",
          text:
            "Employment complaints typically must be filed within 180 days, and this may extend to 300 days if a state or local agency enforces a similar law.",
        },
      ];

    case "housing":
      return [
        {
          title: "Deadline to know",
          text:
            "Fair Housing Act complaints generally must be filed within 1 year of the last discriminatory act.",
        },
      ];

    case "education":
      return [
        {
          title: "Deadline to know",
          text:
            "Education Office for Civil Rights complaints ordinarily must be filed within 180 days of the last act of discrimination.",
        },
      ];

    case "transportation":
      return [
        {
          title: "Timing matters",
          text:
            "Air-travel disability complaints should be raised quickly. Delays can make documentation and resolution harder.",
        },
      ];

    default:
      return [];
  }
}