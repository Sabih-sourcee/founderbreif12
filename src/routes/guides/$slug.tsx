import { useState, type ReactNode } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { JsonLd } from "@/components/JsonLd";
import { LogoLink } from "@/components/Logo";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getGuide, type Guide, type GuideFaq, type GuideSection } from "@/lib/guides";
import { articleSchema, faqPageSchema, pageHead, PUBLIC_PAGE_CACHE } from "@/lib/seo";

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

const linkClass = "font-medium text-foreground underline underline-offset-2";

function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <InlineLink key={i} href={match[2]}>
        {match[1]}
      </InlineLink>,
    );
    i += 1;
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

function InlineLink({ href, children }: { href: string; children: string }) {
  if (href === "/demo") {
    return (
      <Link to="/demo" className={linkClass}>
        {children}
      </Link>
    );
  }
  if (href === "/guides") {
    return (
      <Link to="/guides" className={linkClass}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("/guides/")) {
    const slug = href.slice("/guides/".length);
    return (
      <Link to="/guides/$slug" params={{ slug }} className={linkClass}>
        {children}
      </Link>
    );
  }
  return <span>{children}</span>;
}

function TemplateBlock({ title, body }: { title: string; body: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-sm font-medium">{title}</p>
        <button
          type="button"
          className="text-sm font-medium text-foreground underline underline-offset-2"
          onClick={() => {
            void navigator.clipboard.writeText(body).then(
              () => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              },
              () => setCopied(false),
            );
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap p-4 font-mono text-xs leading-[1.7] text-[color:var(--subtle-foreground)]">
        {body}
      </pre>
    </div>
  );
}

function GuidePage() {
  const guide = Route.useLoaderData() as Guide;
  const related = (guide.related ?? [])
    .map((slug) => getGuide(slug))
    .filter((item): item is Guide => Boolean(item));

  const structuredData = [
    faqPageSchema(guide.faqs),
    ...(guide.datePublished
      ? [
          articleSchema({
            title: guide.title,
            description: guide.description,
            path: `/guides/${guide.slug}`,
            datePublished: guide.datePublished,
          }),
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <JsonLd data={structuredData} />
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
          <h2 className="text-lg font-semibold tracking-[-0.01em]">Want to try FounderBrief?</h2>
          <p className="mt-2 text-sm leading-[1.65] text-[color:var(--subtle-foreground)]">
            Describe the idea and get a PRD and build plan. No card required for the first one.
          </p>
          <Link
            to="/demo"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[8px] bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            Try FounderBrief
          </Link>
          <div className="mt-6">
            <WaitlistForm variant="stacked" submitLabel="Join the waitlist" />
          </div>
        </div>

        <div className="mt-14 space-y-12">
          {guide.sections.map((section: GuideSection) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">{section.heading}</h2>
              {section.paragraphs.map((paragraph: string, index: number) => (
                <p
                  key={`${section.heading}-${index}`}
                  className="mt-3 text-sm leading-[1.75] text-[color:var(--subtle-foreground)]"
                >
                  <RichText text={paragraph} />
                </p>
              ))}
              {section.template ? (
                <TemplateBlock title={section.template.title} body={section.template.body} />
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">
            What are the common questions?
          </h2>
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

        {related.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">
              Which guides should you read next?
            </h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link to="/guides/$slug" params={{ slug: item.slug }} className={linkClass}>
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm leading-[1.65] text-[color:var(--subtle-foreground)]">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
