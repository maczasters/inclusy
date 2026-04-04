export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)]">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Contact / early access
          </h1>

          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            For questions, feedback, or early access inquiries, contact:
          </p>

          <p className="mt-4 text-base font-medium">
            <a
              href="mailto:inclusynavigator@gmail.com"
              className="text-[var(--primary)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
            >
              inclusynavigator@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}