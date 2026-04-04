import { ClassificationResult, OptionalActionType } from "./type";

export function getAvailableActions(
  classification: ClassificationResult
): OptionalActionType[] {
  const actions: OptionalActionType[] = [];

  const denialOrEscalation =
    classification.timing === "denied_or_unresolved" ||
    classification.possible_discrimination ||
    classification.user_intent === "respond_to_barrier";

  if (
    classification.user_intent === "request_accommodation" ||
    classification.timing === "upcoming"
  ) {
    actions.push("draft_request");
  }

  if (denialOrEscalation) {
    actions.push("draft_followup", "complaint_outline");
  }

  if (
    classification.primary_user_type === "business" ||
    classification.primary_user_type === "public_entity" ||
    classification.primary_user_type === "event_planner"
  ) {
    actions.push("business_checklist");
  }

  if (
    classification.primary_user_type === "developer" ||
    classification.primary_scenario === "digital_accessibility" ||
    classification.primary_scenario === "document_accessibility"
  ) {
    actions.push("digital_checklist");
  }

  return [...new Set(actions)];
}