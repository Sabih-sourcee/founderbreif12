import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { DemoFlow } from "@/components/demo/DemoFlow";
import { checkHealth } from "@/lib/demo-api";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [{ title: "Try the demo — FounderBrief" }],
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
          <Link to="/" className="text-[17px] font-bold tracking-[-0.01em]">
            FounderBrief
          </Link>
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
        <DemoFlow />
      </main>
    </div>
  );
}
