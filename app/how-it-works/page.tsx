export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)]">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How to use Inclusy
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Describe your situation, answer a few clarifying questions if needed,
            and review the structured guidance. Inclusy is designed to help with
            accessibility barriers, planning, accommodations, and practical next
            steps.
          </p>
        </div>
      </div>
    </main>
  );
}