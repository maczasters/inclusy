"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAvailableActions } from "../lib/actionAvailability";
import {
  ClassificationResult,
  FollowupQuestion,
  GuidanceSections,
} from "../lib/type";

async function safeFetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const text = await res.text();

  if (!res.ok) throw new Error(text || "Request failed");
  if (!text) throw new Error("Empty response");

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON");
  }
}

const QUICK_STARTS = [
  {
    label: "Accessibility Barrier",
    value: "I need help with an accessibility barrier.",
  },
  {
    label: "Request Accommodation",
    value: "I want to request an accommodation.",
  },
  {
    label: "Business Accessibility",
    value: "I want to make a business or service accessible.",
  },
  {
    label: "Digital Accessibility",
    value: "I need digital accessibility guidance for a website, app, or document.",
  },
  {
    label: "Accessible Event Planning",
    value: "I’m planning an event and want it to be accessible.",
  },
  {
    label: "Housing / Employment / Government",
    value: "I need help with housing, employment, or government access.",
  },
  {
    label: "Upcoming Situation",
    value: "I’m preparing for an upcoming accessibility-related situation.",
  },
  {
    label: "Not Sure",
    value: "I’m not sure where my situation fits, but I need accessibility guidance.",
  },
];

function SectionCard({
  title,
  children,
  accent = "var(--primary)",
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <section
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
      aria-label={title}
    >
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-main)]">
        {title}
      </h2>
      <div className="text-sm leading-7 text-[var(--text-muted)]">
        {children}
      </div>
    </section>
  );
}

function ListBlock({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return <p className="text-[var(--text-soft)]">None provided.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function QuickStartButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-left text-sm font-medium text-[var(--text-main)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--primary-softer)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
    >
      {label}
    </button>
  );
}

async function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_name: eventName,
        properties: properties || {},
      }),
    });
  } catch {
    // no-op
  }
}

export default function HomePage() {
  const [sessionId] = useState(() => `sess_${Date.now()}`);
  const [input, setInput] = useState("");
  const [consent, setConsent] = useState(false);

  const [classification, setClassification] =
    useState<ClassificationResult | null>(null);
  const [questions, setQuestions] = useState<FollowupQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [guidance, setGuidance] = useState<GuidanceSections | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "followup" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const [actionOutput, setActionOutput] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const responseRegionRef = useRef<HTMLDivElement | null>(null);
  const responseHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    trackEvent("page_view");
  }, []);

  useEffect(() => {
    if (stage === "followup" || stage === "done") {
      responseRegionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      window.setTimeout(() => {
        responseHeadingRef.current?.focus();
      }, 250);
    }
  }, [stage]);

  const availableActions = useMemo(() => {
    return classification ? getAvailableActions(classification) : [];
  }, [classification]);

  const canStart = input.trim().length > 0 && consent && !loading;

  const handleQuickStart = (value: string) => {
    setInput(value);
    setGuidance(null);
    setQuestions([]);
    setAnswers({});
    setClassification(null);
    setStage("idle");
    setError(null);
    setActionOutput(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

const handleStart = async () => {
  if (!consent) {
    setError("Please accept the guidance notice before continuing.");
    return;
  }

  if (!input.trim()) {
    setError("Please describe your situation or choose a starting point.");
    return;
  }

  try {
    setLoading(true);
    setLoadingStep("Understanding your situation...");
    setError(null);
    setGuidance(null);
    setQuestions([]);
    setAnswers({});
    setClassification(null);
    setActionOutput(null);

    await trackEvent("started_guidance", { session_id: sessionId });

    const classifyData = await safeFetchJSON("/api/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        user_input: input,
      }),
    });

    if (!classifyData.success) {
      throw new Error(
        classifyData?.errors?.[0] || "Failed to classify the request."
      );
    }

    setClassification(classifyData.classification);

    await trackEvent("classification_completed", {
      primary_user_type:
        classifyData.classification?.primary_user_type ?? null,
      primary_scenario:
        classifyData.classification?.primary_scenario ?? null,
      user_intent: classifyData.classification?.user_intent ?? null,
      timing: classifyData.classification?.timing ?? null,
    });

    setLoadingStep("Preparing follow-up questions...");

    const followupData = await safeFetchJSON("/api/followup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        user_input: input,
        classification: classifyData.classification,
      }),
    });

    if (!followupData.success) {
      throw new Error(
        followupData?.errors?.[0] ||
          "Failed to generate follow-up questions."
      );
    }

    const nextQuestions: FollowupQuestion[] = followupData.questions || [];
    setQuestions(nextQuestions);

    if (
      nextQuestions.length > 0 &&
      classifyData.classification?.needs_clarification
    ) {
      setStage("followup");
      await trackEvent("followup_shown", { count: nextQuestions.length });
    } else {
      await handleGetGuidance(classifyData.classification, {});
    }
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Something went wrong.");
  } finally {
    setLoading(false);
    setLoadingStep(null);
  }
};
const handleGetGuidance = async (
  classificationOverride?: ClassificationResult,
  answersOverride?: Record<string, string>
) => {
  try {
    setLoading(true);
    setLoadingStep("Generating guidance...");
    setError(null);

    const activeClassification = classificationOverride || classification;
    const activeAnswers = answersOverride || answers;

   const data = await safeFetchJSON("/api/guidance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input, classification, answers }),
    });

    if (!data.success) {
      throw new Error(data?.errors?.[0] || "Failed to generate guidance.");
    }

    setGuidance(data.guidance || null);
    setStage("done");

    await trackEvent("guidance_generated", {
      primary_user_type: activeClassification?.primary_user_type ?? null,
      primary_scenario: activeClassification?.primary_scenario ?? null,
      user_intent: activeClassification?.user_intent ?? null,
      timing: activeClassification?.timing ?? null,
    });
  } catch (err: any) {
    setError(
  err instanceof Error
    ? err.message
    : "Something went wrong while generating guidance."
);
  } finally {
    setLoading(false);
    setLoadingStep(null);
  }
};
  const handleAction = async (actionType: string) => {
  try {
    setActionLoading(true);

    await trackEvent("action_clicked", {
      action_type: actionType,
      primary_scenario: classification?.primary_scenario ?? null,
    });

    const data = await safeFetchJSON("/api/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: actionType,
        input,
        classification,
        answers,
      }),
    });

    if (!data.success) {
      throw new Error(data?.errors?.[0] || "Action failed");
    }

    setActionOutput(data.output);
  } catch (err: any) {
    alert(err instanceof Error ? err.message : "Action failed");
  } finally {
    setActionLoading(false);
  }
};
  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleStartOver = async () => {
    setInput("");
    setClassification(null);
    setQuestions([]);
    setAnswers({});
    setGuidance(null);
    setLoading(false);
    setStage("idle");
    setError(null);
    setActionOutput(null);
    setConsent(true);
    await trackEvent("start_over_clicked");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main
        id="main-content"
        className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)]"
      >
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-4">
                    <img
                      src="/inclusy-logo.png"
                      alt="Inclusy"
                      className="h-32 w-auto object-contain"
                    />

                   <p className="text-xl font-semibold uppercase tracking-[0.18em] text-[var(--text-main)]">
                    Accessibility Navigation
                  </p>
                  </div>

                  <h1 className="mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                    Tell us what’s going on.
                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
                    Describe a barrier, ask a question, or get help planning for
                    an accessibility-related situation.
                  </p>
                </div>

                <div className="mt-8">
                  <label
                    htmlFor="main-input"
                    className="mb-2 block text-sm font-medium"
                  >
                    Your situation or question
                  </label>

                  <textarea
                    id="main-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    aria-describedby="input-help"
                    placeholder={`Examples:
• I need a sign language interpreter for a public meeting
• My workplace is not accommodating my disability
• How do I make my business accessible?
• I’m not sure what kind of help I need`}
                    className="min-h-[180px] w-full rounded-2xl border border-[var(--border)] bg-white px-5 py-4 text-sm leading-7 text-[var(--text-main)] placeholder:text-[var(--text-soft)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />

                  <p
                    id="input-help"
                    className="mt-2 text-xs text-[var(--text-soft)]"
                  >
                    Provide as much detail as you are comfortable sharing.
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--primary-softer)] p-4">
                  <label
                    htmlFor="consent"
                    className="flex cursor-pointer items-start gap-3"
                  >
                    <input
                      id="consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[var(--border)]"
                    />
                    <span className="text-sm leading-7 text-[var(--text-muted)]">
                      I understand this tool provides general informational
                      accessibility guidance only, not legal advice, and that I
                      am responsible for how I use and verify the information
                      provided.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-[var(--error)]/20 bg-[var(--error-soft)] px-4 py-3 text-sm text-[var(--error)]">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    onClick={handleStart}
                    disabled={!canStart || stage !== "idle"}
                    aria-disabled={!canStart || stage !== "idle"}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-40 sm:w-auto"
                  >
                    {loading ? loadingStep || "Working..." : "Start Guidance"}
                  </button>

                  <a
                    href="/how-it-works"
                    className="text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                  >
                    Learn how to use this tool
                  </a>
                </div>
              </div>

              {stage === "followup" && questions.length > 0 && (
                <div ref={responseRegionRef}>
                  <section
                    className="rounded-3xl border border-[var(--border-strong)] bg-[var(--primary-softer)] p-6 shadow-[var(--shadow-card)] sm:p-8"
                    aria-labelledby="current-step-heading"
                    aria-live="polite"
                  >
                    <div className="mb-4 inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                      Step 2 of 3
                    </div>

                    <h2
                      id="current-step-heading"
                      ref={responseHeadingRef}
                      tabIndex={-1}
                      className="text-2xl font-semibold tracking-tight text-[var(--text-main)]"
                    >
                      A few quick follow-up questions
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                      We need a little more detail to make the guidance more
                      useful and specific.
                    </p>

                    <div className="mt-6 space-y-4">
                      {questions.map((q) => (
                        <div
                          key={q.id}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm"
                        >
                          <label
                            htmlFor={q.id}
                            className="block text-sm font-medium text-[var(--text-main)]"
                          >
                            {q.question}
                          </label>

                          {q.why_it_matters && (
                            <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">
                              {q.why_it_matters}
                            </p>
                          )}

                          <input
                            id={q.id}
                            type="text"
                            value={answers[q.id] || ""}
                            onChange={(e) =>
                              handleAnswerChange(q.id, e.target.value)
                            }
                            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                            placeholder="Type your answer here"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleGetGuidance()}
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                      >
                        {loading ? "Generating guidance..." : "Get Guidance"}
                      </button>

                      <button
                        type="button"
                        onClick={handleStartOver}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--primary-soft)] sm:w-auto"
                      >
                        Start Over
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {stage === "done" && guidance && (
                <div ref={responseRegionRef} className="space-y-4">
                  <section
                    className="rounded-3xl border border-[var(--border-strong)] bg-[var(--primary-softer)] p-6 shadow-[var(--shadow-card)] sm:p-8"
                    aria-labelledby="current-step-heading"
                    aria-live="polite"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                          Step 3 of 3
                        </div>

                        <h2
                          id="current-step-heading"
                          ref={responseHeadingRef}
                          tabIndex={-1}
                          className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-main)]"
                        >
                          Your guidance summary
                        </h2>

                        <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                          Here is your structured guidance based on what you
                          shared.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleStartOver}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--primary-soft)] sm:w-auto"
                      >
                        Start Over
                      </button>
                    </div>
                  </section>

                  <div className="grid gap-4">
                    <SectionCard title="Situation Summary">
                      <p>{guidance.situation_summary || "No summary provided."}</p>
                    </SectionCard>

                    <SectionCard title="Likely Relevant Frameworks or Standards">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {guidance.relevant_frameworks?.length ? (
                            guidance.relevant_frameworks.map((framework: string, i: number) => (
                              <span
                                key={`${framework}-${i}`}
                                className="rounded-full border border-[var(--border-strong)] bg-[var(--primary-soft)] px-3 py-1 text-xs font-medium text-[var(--primary)]"
                              >
                                {framework}
                              </span>
                            ))
                          ) : (
                            <span className="text-[var(--text-soft)]">
                              No frameworks listed.
                            </span>
                          )}
                        </div>

                        {guidance.frameworks_note && <p>{guidance.frameworks_note}</p>}
                      </div>
                    </SectionCard>

                    <SectionCard title="Recommended Next Steps">
                      <ListBlock items={guidance.recommended_next_steps} />
                    </SectionCard>

                    <SectionCard title="Request or Documentation Guidance">
                      <p>
                        {guidance.request_or_documentation_guidance ||
                          "Not especially relevant here."}
                      </p>
                    </SectionCard>

                    <SectionCard title="If You Encounter a Barrier, Denial, or Inadequate Access">
                      <p>
                        {guidance.barrier_denial_guidance ||
                          "No additional barrier guidance provided."}
                      </p>
                    </SectionCard>

                    <SectionCard
                      title="Helpful Resources or Types of Support"
                      accent="var(--accent)"
                    >
                      <ListBlock
                        items={guidance.helpful_resources_or_support_types}
                      />
                    </SectionCard>

                    <SectionCard title="Best Practices or Additional Considerations">
                      <ListBlock
                        items={
                          guidance.best_practices_or_additional_considerations
                        }
                      />
                    </SectionCard>

                    <SectionCard
                      title="Important Note"
                      accent="var(--warning)"
                    >
                      <p>
                        {guidance.important_note ||
                          "This tool provides general guidance and is not legal advice."}
                      </p>
                    </SectionCard>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
                    <h2 className="text-lg font-semibold">Next actions</h2>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {availableActions.includes("draft_request") && (
                        <button
                          type="button"
                          onClick={() => handleAction("draft_request")}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--primary-softer)]"
                        >
                          Draft Request
                        </button>
                      )}

                      {availableActions.includes("draft_followup") && (
                        <button
                          type="button"
                          onClick={() => handleAction("draft_followup")}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--primary-softer)]"
                        >
                          Draft Follow-Up
                        </button>
                      )}

                      {availableActions.includes("complaint_outline") && (
                        <button
                          type="button"
                          onClick={() => handleAction("complaint_outline")}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--primary-softer)]"
                        >
                          Complaint Outline
                        </button>
                      )}

                      {availableActions.includes("business_checklist") && (
                        <button
                          type="button"
                          onClick={() => handleAction("business_checklist")}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--primary-softer)]"
                        >
                          Business Checklist
                        </button>
                      )}

                      {availableActions.includes("digital_checklist") && (
                        <button
                          type="button"
                          onClick={() => handleAction("digital_checklist")}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--primary-softer)]"
                        >
                          Digital Checklist
                        </button>
                      )}
                    </div>

                    {actionLoading && (
                      <p className="mt-4 text-sm text-[var(--text-muted)]">
                        Generating action output...
                      </p>
                    )}

                    {actionOutput && (
                      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-soft)]">
                        <h3 className="mb-2 text-lg font-semibold">
                          {actionOutput.title || "Generated Output"}
                        </h3>

                        {actionOutput.subject && (
                          <p className="mb-2 text-sm">
                            <strong>Subject:</strong> {actionOutput.subject}
                          </p>
                        )}

                        {actionOutput.body && typeof actionOutput.body === "string" && (
                          <pre className="whitespace-pre-wrap text-sm leading-6 text-[var(--text-muted)]">
                            {actionOutput.body}
                          </pre>
                        )}

                        {actionOutput.body &&
                          typeof actionOutput.body === "object" &&
                          !Array.isArray(actionOutput.body) && (
                            <div className="space-y-4">
                              {Object.entries(actionOutput.body).map(([key, value]) => (
                                <div key={key}>
                                  <h4 className="mb-1 text-sm font-semibold text-[var(--text-main)]">
                                    {key}
                                  </h4>
                                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                                    {typeof value === "string" ? value : JSON.stringify(value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                        {actionOutput.checklist_items?.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-semibold">Next Steps</h4>
                            <ul className="list-disc pl-5 text-sm">
                              {actionOutput.checklist_items.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {actionOutput.notes?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="mb-2 text-sm font-semibold">
                              Notes
                            </h4>
                            <ListBlock items={actionOutput.notes} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {stage === "idle" && (
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
                  <h2 className="text-xl font-semibold">
                    Or choose a starting point
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                    These options can help if you are not sure how to phrase
                    your question yet.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {QUICK_STARTS.map((item) => (
                      <QuickStartButton
                        key={item.label}
                        label={item.label}
                        onClick={() => handleQuickStart(item.value)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
                <h2 className="text-lg font-semibold">What this can help with</h2>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
                  <li>Accessibility barriers happening now</li>
                  <li>Planning ahead for an upcoming situation</li>
                  <li>Accommodation request guidance</li>
                  <li>Business and public-facing accessibility</li>
                  <li>Government, education, housing, and travel contexts</li>
                  <li>Digital accessibility for websites, apps, and documents</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
                <h2 className="text-lg font-semibold">Sample prompts</h2>
                <div className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
                  <div className="rounded-2xl bg-[var(--bg-muted)] p-3">
                    “I need an interpreter for a public meeting.”
                  </div>
                  <div className="rounded-2xl bg-[var(--bg-muted)] p-3">
                    “My landlord won’t allow my service animal.”
                  </div>
                  <div className="rounded-2xl bg-[var(--bg-muted)] p-3">
                    “How do I make my business more accessible?”
                  </div>
                  <div className="rounded-2xl bg-[var(--bg-muted)] p-3">
                    “What should I check for mobile accessibility?”
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
                <h2 className="text-lg font-semibold">Important note</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                  This tool provides general accessibility guidance based on
                  recognized standards and public information. It is not legal
                  advice.
                </p>

                <div className="mt-4 flex flex-col gap-2 text-sm">
                  <a
                    href="/sources"
                    className="text-[var(--primary)] underline-offset-4 hover:underline"
                  >
                    View sources and standards
                  </a>
                  <a
                    href="/terms"
                    className="text-[var(--primary)] underline-offset-4 hover:underline"
                  >
                    View terms and disclaimer
                  </a>
                  <a
                    href="/contact"
                    className="text-[var(--primary)] underline-offset-4 hover:underline"
                  >
                    Contact / early access
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}