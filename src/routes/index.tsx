import { createFileRoute } from "@tanstack/react-router";
import { FounderApp } from "@/app/FounderApp";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () =>
    pageHead({
      title: "FounderBrief — Speak an idea. Get a document.",
      description:
        "FounderBrief turns a spoken or typed idea into a PRD, business plan, resume, pitch deck, or brief — then exports it or reads it aloud.",
      path: "/",
    }),
  component: FounderApp,
});
