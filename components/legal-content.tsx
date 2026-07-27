export function LegalContent({ title, content }: { title: string; content: string }) {
  const paragraphs = content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <section className="px-4 py-16">
      <article className="surface mx-auto max-w-4xl rounded-3xl p-6 sm:p-10">
        <h1 className="text-balance text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">{title}</h1>
        <div className="mt-7 grid gap-5 text-sm leading-7 text-slate-400 sm:text-base">
          {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}
        </div>
      </article>
    </section>
  );
}
