import { createFileRoute, Link } from "@tanstack/react-router";

import { JsonLd } from "@/components/JsonLd";
import { LogoLink } from "@/components/Logo";
import { GUIDES } from "@/lib/guides";
import { breadcrumbListSchema, itemListSchema, pageHead, PUBLIC_PAGE_CACHE } from "@/lib/seo";

export const Route = createFileRoute("/guides/")({
  headers: () => ({ "Cache-Control": PUBLIC_PAGE_CACHE }),
  head: () =>
    pageHead({
      title: "Guides — PRDs, MVPs, and build plans — FounderBrief",
      description:
        "Practical guides on writing a startup PRD, using an AI PRD generator, validating an idea, planning an MVP, and choosing a SaaS stack.",
      path: "/guides",
    }),
  component: GuidesIndex,
});

function GuidesIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <JsonLd
        data={[
          breadcrumbListSchema([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
          itemListSchema(
            "FounderBrief guides",
            GUIDES.map((guide) => ({
              name: guide.title,
              path: `/guides/${guide.slug}`,
            })),
          ),
        ]}
      />
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <LogoLink to="/" size="sm" />
          <nav className="flex items-center gap-4 text-sm text-[color:var(--subtle-foreground)]">
            <Link to="/demo" className="hover:text-foreground">
              Generate PRD
            </Link>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <span className="eyebrow">Guides</span>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] md:text-4xl">
          Know what you are building before you write code
        </h1>
        <p className="mt-4 text-base leading-[1.7] text-[color:var(--subtle-foreground)]">
          Short guides for founders writing a PRD, checking an idea, and planning the first version.
        </p>
        <ul className="mt-12 space-y-4">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link
                to="/guides/$slug"
                params={{ slug: guide.slug }}
                className="block rounded-2xl border border-border bg-surface p-6 hover:border-foreground"
              >
                <h2 className="text-lg font-semibold tracking-[-0.01em]">{guide.title}</h2>
                <p className="mt-2 text-sm leading-[1.65] text-[color:var(--subtle-foreground)]">
                  {guide.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
