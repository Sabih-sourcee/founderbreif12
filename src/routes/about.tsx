import { createFileRoute, Link } from "@tanstack/react-router";

import { JsonLd } from "@/components/JsonLd";
import { LogoLink } from "@/components/Logo";
import { aboutPageSchema, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About FounderBrief — A weekly brief for founders who ship",
      description:
        "FounderBrief helps founders replace scattered dashboards with one Monday brief — strategy, metrics, and priorities in a single calm summary.",
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
          Built for founders who would rather decide than dashboard
        </h1>
        <p className="mt-6 text-base leading-[1.75] text-[color:var(--subtle-foreground)]">
          FounderBrief is a weekly operating brief for founders. Strategy, metrics, and priorities
          usually live across Notion docs, spreadsheets, Linear boards, and Slack threads. We
          distill that signal into one calm page every Monday morning.
        </p>

        <section className="mt-14 space-y-4">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Our mission</h2>
          <p className="text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            Give every founder a reliable Monday ritual: open one brief, see what matters, decide,
            then get back to building. No new dashboard to maintain. No noise dressed up as insight.
          </p>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Who we serve</h2>
          <p className="text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            Non-technical and technical founders running early-stage and growth-stage products.
            Especially teams that already have tools — but no weekly cadence that turns data into
            decisions.
          </p>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">How FounderBrief works</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            <li>Connect the sources you already use (metrics, docs, priorities).</li>
            <li>Set what belongs in the brief: north star, KPIs, this week&apos;s three, blockers.</li>
            <li>Read one focused summary every Monday — share with investors or your team when needed.</li>
          </ol>
          <p className="text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            You can also{" "}
            <Link to="/demo" className="font-medium text-foreground underline underline-offset-2">
              try the free demo
            </Link>{" "}
            to turn a startup idea into a structured technical brief in minutes.
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
            Try free demo
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
