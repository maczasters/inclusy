export default function SourcesPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)]">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Sources and standards
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Inclusy is designed around recognized accessibility frameworks and
            best practices, including ADA, FHA, Section 504, Section 508,
            ACAA, WCAG, and other relevant accessibility guidance depending on
            the situation.
          </p>
        </div>
      </div>
    </main>
  );
}