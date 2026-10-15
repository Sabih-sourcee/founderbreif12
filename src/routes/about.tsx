import { createFileRoute, Link } from "@tanstack/react-router";

import { JsonLd } from "@/components/JsonLd";
import { LogoLink } from "@/components/Logo";
import { aboutPageSchema, pageHead, PUBLIC_PAGE_CACHE } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  headers: () => ({ "Cache-Control": PUBLIC_PAGE_CACHE }),
  head: () =>
    pageHead({
      title: "About FounderBrief — AI PRD and build plan",
      description:
        "FounderBrief helps founders write a PRD and a build plan before they write code — scope, stories, requirements, and how the first version gets made.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <JsonLd data={aboutPageSchema()} />
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <LogoLink to="/" size="sm" />
          <nav className="flex items-center gap-4 text-sm text-[color:var(--subtle-foreground)]">
            <Link to="/demo" className="hover:text-foreground">
              Demo
            </Link>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <span className="eyebrow">About</span>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] md:text-4xl">
          Built so founders know the product before they write it
        </h1>
        <p className="mt-6 text-base leading-[1.75] text-[color:var(--subtle-foreground)]">
          FounderBrief is an AI PRD and build-plan generator. Describe a startup idea, answer a few
          questions, and get the scope, user stories, requirements, and technical plan for the first
          version — before a line of code.
        </p>

        <section className="mt-14 space-y-4">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Our mission</h2>
          <p className="text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            Help every founder decide what they are building and how they will make it, while the
            idea is still cheap to change. The output is a document a builder can start from.
          </p>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Who we serve</h2>
          <p className="text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            Non-technical founders who need to brief a developer, and technical founders who want
            the scope written down before the first commit.
          </p>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">How FounderBrief works</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            <li>Describe the product in plain language.</li>
            <li>Answer a short set of questions about users, platform, and constraints.</li>
            <li>Read the PRD and build plan, then export it or hand it to whoever will build it.</li>
          </ol>
          <p className="text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            You can{" "}
            <Link to="/demo" className="font-medium text-foreground underline underline-offset-2">
              generate your first PRD free
            </Link>
            . No credit card for the first generation.
          </p>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Trust and privacy</h2>
          <p className="text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            Brief content is designed to stay on your device. We collect account email and name to
            operate the product. Generation prompts are processed through Google Gemini via our API
            and are not permanently stored afterward. Read the full{" "}
            <Link
              to="/privacy"
              className="font-medium text-foreground underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Contact</h2>
          <p className="text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            Questions or press? Email{" "}
            <a
              href="mailto:hello@founderbrief.app"
              className="font-medium text-foreground underline underline-offset-2"
            >
              hello@founderbrief.app
            </a>
            .
          </p>
        </section>

        <div className="mt-16 flex flex-wrap gap-3">
          <Link
            to="/demo"
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-foreground px-5 text-sm font-semibold text-background hover:bg-foreground/90"
          >
            Generate your first PRD free
          </Link>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-border px-5 text-sm font-semibold hover:bg-surface"
          >
            Join waitlist
          </Link>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-8 text-xs text-[color:var(--muted-foreground)]">
          © {new Date().getFullYear()} FounderBrief
        </div>
      </footer>
    </div>
  );
}
