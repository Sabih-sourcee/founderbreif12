import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useBriefs } from "@/hooks/use-briefs";
import { formatWeekLabel } from "@/lib/week";
import { CheckCircle2, FileText, Plus, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/briefs")({
  head: () => ({ meta: [{ title: "All briefs — FounderBrief" }] }),
  component: BriefsListPage,
});

type Filter = "all" | "published" | "draft";

function BriefsListPage() {
  const { data, isLoading, isError, refetch } = useBriefs();
  const [filter, setFilter] = useState<Filter>("all");
  const briefs = (data ?? []).filter((b) => filter === "all" ? true : b.status === filter);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow">Archive</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-[-0.02em]">All briefs</h1>
          <p className="mt-2 text-[color:var(--subtle-foreground)]">Every Monday, in one place.</p>
        </div>
        <Link
          to="/brief/new"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" /> New brief
        </Link>
      </div>

      <div className="mt-8 inline-flex rounded-[8px] border border-border bg-surface p-1">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 h-8 rounded-md text-xs font-semibold capitalize ${
              filter === f ? "bg-background text-foreground" : "text-[color:var(--muted-foreground)] hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <SkeletonList />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : briefs.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="rounded-2xl border border-border bg-surface divide-y divide-border">
            {briefs.map((b) => (
              <li key={b.id}>
                <Link
                  to="/brief/$id/edit"
                  params={{ id: b.id }}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-background"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                      {b.status === "published" ? (
                        <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {b.title?.trim() || formatWeekLabel(b.week_start)}
                      </p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        {b.title?.trim() ? formatWeekLabel(b.week_start) + " · " : ""}
                        {b.status === "published" ? "Published" : "Draft"}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[color:var(--muted-foreground)] shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="rounded-2xl border border-border bg-surface divide-y divide-border">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-background border border-border animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-background border border-border animate-pulse" />
            <div className="h-2 w-1/4 rounded bg-background border border-border animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 text-sm">
      <p>We couldn't load your briefs.</p>
      <button onClick={onRetry} className="mt-3 h-9 px-3 rounded-[8px] border border-border bg-background text-xs font-semibold">
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center">
      <h3 className="text-base font-semibold tracking-[-0.01em]">Nothing here yet</h3>
      <p className="mt-2 text-sm text-[color:var(--subtle-foreground)] max-w-sm mx-auto">
        Once you write your first brief it will live here, organized by week.
      </p>
      <Link to="/brief/new" className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90">
        <Plus className="h-4 w-4" /> Write this week's brief
      </Link>
    </div>
  );
}
