import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { JsonLd } from "@/components/JsonLd";
import { LogoLink } from "@/components/Logo";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getGuide, type Guide, type GuideFaq, type GuideSection } from "@/lib/guides";
import { faqPageSchema, pageHead, PUBLIC_PAGE_CACHE } from "@/lib/seo";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  headers: () => ({ "Cache-Control": PUBLIC_PAGE_CACHE }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return pageHead({ title: "Guide — FounderBrief", path: "/guides", noindex: true });
    }
    return pageHead({
      title: `${loaderData.title} — FounderBrief`,
      description: loaderData.description,
      path: `/guides/${loaderData.slug}`,
      type: "article",
    });
  },
  component: GuidePage,
});

function GuidePage() {
  const guide = Route.useLoaderData() as Guide;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <JsonLd data={faqPageSchema(guide.faqs)} />
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <LogoLink to="/" size="sm" />
          <nav className="flex items-center gap-4 text-sm text-[color:var(--subtle-foreground)]">
            <Link to="/guides" className="hover:text-foreground">
              Guides
            </Link>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="eyebrow">Guide</p>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] md:text-4xl">{guide.title}</h1>
        <p className="mt-6 text-base leading-[1.75] text-foreground">{guide.answer}</p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold tracking-[-0.01em]">Generate your first PRD free</h2>
          <p className="mt-2 text-sm leading-[1.65] text-[color:var(--subtle-foreground)]">
            Describe the idea and get a PRD and build plan. No card required for the first one.
          </p>
          <Link
            to="/demo"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[8px] bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            Generate your first PRD free
          </Link>
          <div className="mt-6">
            <WaitlistForm variant="stacked" submitLabel="Join the waitlist" />
          </div>
        </div>

        <div className="mt-14 space-y-12">
          {guide.sections.map((section: GuideSection) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">{section.heading}</h2>
              {section.paragraphs.map((paragraph: string) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm leading-[1.75] text-[color:var(--subtle-foreground)]"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Questions</h2>
          <div className="mt-6 space-y-8">
            {guide.faqs.map((faq: GuideFaq) => (
              <article key={faq.question}>
                <h3 className="text-base font-semibold tracking-[-0.01em]">{faq.question}</h3>
                <p className="mt-2 text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
