export function LegalLayout({
  eyebrow,
  title,
  updatedAt,
  children,
}: {
  eyebrow: string;
  title: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-10 border-b border-white/5 pb-8">
        <p className="mb-2 text-[11px] font-medium tracking-[0.25em] text-amber-300">
          {eyebrow}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {updatedAt && (
          <p className="mt-3 text-xs text-muted-foreground/70">
            最終更新日: {updatedAt}
          </p>
        )}
      </header>
      <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </article>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        {heading}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
