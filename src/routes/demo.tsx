import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { DemoFlow } from "@/components/demo/DemoFlow";
import { JsonLd } from "@/components/JsonLd";
import { LogoLink } from "@/components/Logo";
import { checkHealth } from "@/lib/demo-api";
import { pageHead, softwareApplicationSchema } from "@/lib/seo";

export const Route = createFileRoute("/demo")({
  head: () =>
    pageHead({
      title: "Generate your first PRD free — FounderBrief",
      description:
        "Describe a startup idea and get an AI PRD and build plan. Scope, user stories, requirements, and milestones. No credit card for the first one.",
      path: "/demo",
    }),
  component: DemoPage,
});

function DemoPage() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <LogoLink to="/" size="sm" />
          <span className="eyebrow">Free demo</span>
        </div>
      </header>

      {backendOnline === false && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3">
          <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>
              Backend offline — brief generation may not work. Set{" "}
              <code className="rounded bg-amber-100 px-1">GEMINI_API_KEY</code> and restart the
              dev server.
            </p>
          </div>
        </div>
      )}

      <main>
        <section className="mx-auto max-w-2xl px-6 pb-2 pt-10 text-left">
          <p className="text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            FounderBrief&apos;s demo turns a startup idea into a product requirements document and a
            build plan before you write code. Describe the product in plain language, then answer a
            few questions about who it is for, which platforms it runs on, how people sign in, and
            what it must integrate with. Those answers are what change the scope.
          </p>
          <p className="mt-3 text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            You get a PRD a builder can start from: a short summary, goals and non-goals, user
            stories, functional requirements, the core experience, success metrics, technical
            constraints, and a phased plan with milestones. The point is to show what the first
            version is, and what it is not, so the first stretch of work stays small enough to
            finish. Read it as a draft you will cut, not as a promise to build every line.
          </p>
          <p className="mt-3 text-sm leading-[1.75] text-[color:var(--subtle-foreground)]">
            The first generation is free and does not ask for a card. Delete anything you cannot
            defend, then open an editor or send the plan to the person who will build it. Paid
            plans add unlimited generations, shareable links, and PDF export when the document
            needs to leave your machine. The demo does not replace talking to a real user. It makes
            the idea specific enough that the conversation, and the build, can start.
          </p>
        </section>
        <JsonLd data={softwareApplicationSchema()} />
        <DemoFlow />
      </main>
    </div>
  );
}
