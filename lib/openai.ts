import {
  ACTION_PROMPT,
  CLASSIFY_PROMPT,
  FOLLOWUP_PROMPT,
  GUIDANCE_PROMPT,
  SYSTEM_CONTEXT,
} from "./prompts";

async function callResponsesAPI(
  input: string,
  model: string = "gpt-4o-mini"
) {
  const apiKey = process.env.OPENAI_API_KEY;

  console.log("OPENAI_API_KEY exists:", !!apiKey);

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing in server environment.");
  }

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input,
      max_output_tokens: 800,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error: ${text}`);
  }

  const data = await res.json();

  const text =
    data.output?.find((o: any) => o.type === "message")?.content?.[0]?.text ||
    data.output_text ||
    "";

  return text;
}

function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    try {
      const cleaned = text
        .trim()
        .replace(/^[^{]*\{/, "{")
        .replace(/\}[^}]*$/, "}");
      return JSON.parse(cleaned) as T;
    } catch {
      console.error("FAILED TO PARSE JSON:", text);
      return fallback;
    }
  }
}

export async function runClassification(userInput: string) {
  const raw = await callResponsesAPI(
    `${SYSTEM_CONTEXT}\n${CLASSIFY_PROMPT}\n\nUser input:\n${userInput}`,
    "gpt-4o-mini"
  );

  return safeJsonParse(raw, {
    primary_user_type: "unknown",
    primary_scenario: "unknown",
    secondary_scenarios: [],
    user_intent: "unknown",
    access_domain: "unknown",
    urgency: "unknown",
    timing: "unknown",
    setting_context: "",
    other_person_involved: false,
    other_person_roles: [],
    possible_discrimination: false,
    witnesses_present: false,
    needs_location: false,
    location_provided: false,
    needs_clarification: true,
    clarification_topics: [],
    possible_frameworks: [],
    needs_human_escalation_consideration: false,
    confidence: 0,
    reasoning_summary: "Fallback classification used.",
  });
}

export async function runFollowup(
  userInput: string,
  classification: unknown
) {
  const raw = await callResponsesAPI(
    `${SYSTEM_CONTEXT}\n${FOLLOWUP_PROMPT}\n\nUser input:\n${userInput}\n\nClassification:\n${JSON.stringify(classification)}`,
    "gpt-4o-mini"
  );

  return safeJsonParse(raw, { questions: [] });
}

export async function runGuidance(payload: unknown) {
  const raw = await callResponsesAPI(
    `${SYSTEM_CONTEXT}\n${GUIDANCE_PROMPT}\n\nContext:\n${JSON.stringify(payload)}`,
    "gpt-4o-mini"
  );

  return safeJsonParse(raw, {
    situation_summary: "",
    relevant_frameworks: [],
    frameworks_note: "",
    recommended_next_steps: [],
    request_or_documentation_guidance: "",
    barrier_denial_guidance: "",
    helpful_resources_or_support_types: [],
    best_practices_or_additional_considerations: [],
    important_note:
      "This tool provides general guidance and is not legal advice.",
  });
}

export async function runAction(payload: unknown) {
  const raw = await callResponsesAPI(
    `${SYSTEM_CONTEXT}\n${ACTION_PROMPT}\n\nContext:\n${JSON.stringify(payload)}`,
    "gpt-4o-mini"
  );

  return safeJsonParse(raw, {
    title: "Generated Output",
    subject: "",
    body: "",
    notes: [],
    checklist_items: [],
  });
}