import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useBriefs, useEnsureCurrentBrief } from "@/hooks/use-briefs";
import { useAuth } from "@/lib/auth";
import { formatWeekLabel, mondayISO } from "@/lib/week";
import { ArrowUpRight, Plus, FileText, CheckCircle2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FounderBrief" }] }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuth();
  const briefsQ = useBriefs();
  const ensure = useEnsureCurrentBrief();
  const navigate = useNavigate();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "founder";
  const currentWeek = mondayISO();

  async function openCurrent() {
    try {
      const id = await ensure.mutateAsync();
      navigate({ to: "/brief/$id/edit", params: { id } });
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't open this week's brief");
    }
  }

  const briefs = briefsQ.data ?? [];
  const currentBrief = briefs.find((b) => b.week_start === currentWeek);
  const publishedCount = briefs.filter((b) => b.status === "published").length;
  const draftCount = briefs.filter((b) => b.status === "draft").length;

  return (
    <div>
      <div>
        <p className="eyebrow">{format(new Date(), "EEEE, MMMM d")}</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-[-0.02em]">
          {greeting()}, {name}.
        </h1>
        <p className="mt-2 text-[color:var(--subtle-foreground)]">
          Here's your Monday brief.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mt-10 grid sm:grid-cols-3 gap-3">
        <StatCard label="Briefs written" value={String(briefs.length)} hint={`${publishedCount} published · ${draftCount} draft`} />
        <StatCard
          label="This week"
          value={currentBrief ? (currentBrief.status === "published" ? "Sent" : "In draft") : "Not started"}
          hint={formatWeekLabel(currentWeek)}
        />
        <StatCard label="Cadence" value="Weekly" hint="Every Monday" />
      </div>

      {/* Quick actions */}
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.01em]">
              {currentBrief?.status === "published"
                ? "This week's brief is live"
                : "Open this week's brief"}
            </h2>
            <p className="mt-1.5 text-sm text-[color:var(--subtle-foreground)]">
              {formatWeekLabel(currentWeek)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openCurrent}
              disabled={ensure.isPending}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 disabled:opacity-60"
            >
              {currentBrief ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {currentBrief ? "Continue brief" : "Start this week"}
            </button>
          </div>
        </div>
      </div>

      {/* Recent briefs */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-[-0.01em]">Recent briefs</h2>
          <Link to="/briefs" className="text-xs font-semibold text-[color:var(--subtle-foreground)] hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4">
          {briefsQ.isLoading ? (
            <SkeletonList />
          ) : briefsQ.isError ? (
            <ErrorState onRetry={() => briefsQ.refetch()} />
          ) : briefs.length === 0 ? (
            <EmptyState onStart={openCurrent} />
          ) : (
            <ul className="rounded-2xl border border-border bg-surface divide-y divide-border">
              {briefs.slice(0, 4).map((b) => (
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
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-[color:var(--muted-foreground)]">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-[-0.01em]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="rounded-2xl border border-border bg-surface divide-y divide-border">
      {[0, 1, 2].map((i) => (
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
      <button onClick={onRetry} className="mt-3 h-9 px-3 rounded-[8px] border border-border bg-background text-xs font-semibold hover:bg-surface">
        Try again
      </button>
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center">
      <h3 className="text-base font-semibold tracking-[-0.01em]">No briefs yet</h3>
      <p className="mt-2 text-sm text-[color:var(--subtle-foreground)] max-w-sm mx-auto">
        Start your first weekly brief. It takes about ten minutes and sets the tone for the week.
      </p>
      <button onClick={onStart} className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90">
        <Plus className="h-4 w-4" /> Write this week's brief
      </button>
    </div>
  );
}
