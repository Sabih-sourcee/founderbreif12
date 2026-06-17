import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBrief, useUpdateBrief, useUpdateSection, useDeleteBrief, type BriefSection } from "@/hooks/use-briefs";
import { SECTION_META, type SectionType, formatWeekLabel } from "@/lib/week";
import { useBlocker } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/brief/$id/edit")({
  head: () => ({ meta: [{ title: "Edit brief — FounderBrief" }] }),
  component: EditBrief,
});

type SaveState = "idle" | "saving" | "saved" | "error";

function EditBrief() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useBrief(id);
  const updateSection = useUpdateSection();
  const updateBrief = useUpdateBrief();
  const deleteBrief = useDeleteBrief();

  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<Record<string, { id: string; content: string }>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (data) {
      setTitle(data.brief.title ?? "");
      const map: Record<string, { id: string; content: string }> = {};
      for (const s of data.sections) map[s.section_type] = { id: s.id, content: s.content ?? "" };
      setSections(map);
    }
  }, [data]);

  // Autosave: fixed 30s cadence — does NOT reset on every keystroke.
  useEffect(() => {
    if (!data) return;
    const handle = window.setInterval(() => {
      if (!dirtyRef.current) return;
      void saveAll(false);
    }, 30_000);
    return () => window.clearInterval(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.brief.id]);

  // Warn on tab close / reload when there are unsaved edits.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Block in-app navigation when there are unsaved edits.
  useBlocker({
    shouldBlockFn: () => {
      if (!dirtyRef.current) return false;
      return !window.confirm("You have unsaved changes. Leave without saving?");
    },
  });

  async function saveAll(showToast: boolean) {
    if (!data) return;
    setSaveState("saving");
    try {
      const ops: Promise<unknown>[] = [];
      if (title !== (data.brief.title ?? "")) {
        ops.push(updateBrief.mutateAsync({ id: data.brief.id, title }));
      }
      for (const s of data.sections) {
        const current = sections[s.section_type]?.content ?? "";
        if (current !== (s.content ?? "")) {
          ops.push(updateSection.mutateAsync({ id: s.id, brief_id: data.brief.id, content: current }));
        }
      }
      await Promise.all(ops);
      dirtyRef.current = false;
      setSaveState("saved");
      if (showToast) toast.success("Saved");
      window.setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1800);
    } catch (e: any) {
      setSaveState("error");
      toast.error(e?.message ?? "Save failed");
    }
  }

  async function publish() {
    if (!data) return;
    await saveAll(false);
    try {
      await updateBrief.mutateAsync({ id: data.brief.id, status: "published" });
      toast.success("Brief published");
    } catch (e: any) {
      toast.error(e?.message ?? "Publish failed");
    }
  }

  async function onDelete() {
    if (!data) return;
    if (!window.confirm("Delete this brief? This can't be undone.")) return;
    try {
      await deleteBrief.mutateAsync(data.brief.id);
      toast.success("Brief deleted");
      navigate({ to: "/briefs" });
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  if (isLoading) return <EditSkeleton />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8">
        <p className="text-sm">We couldn't load this brief.</p>
        <button onClick={() => refetch()} className="mt-3 h-9 px-3 rounded-[8px] border border-border bg-background text-xs font-semibold">
          Try again
        </button>
      </div>
    );
  }

  const isPublished = data.brief.status === "published";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to="/briefs" className="inline-flex items-center gap-1.5 text-sm text-[color:var(--subtle-foreground)] hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All briefs
        </Link>
        <div className="flex items-center gap-3">
          <SaveIndicator state={saveState} />
          <button
            onClick={() => saveAll(true)}
            className="h-9 px-3 rounded-[8px] border border-border bg-surface text-xs font-semibold hover:bg-background"
          >
            Save draft
          </button>
          <button
            onClick={publish}
            disabled={updateBrief.isPending}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-[8px] bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            {isPublished ? "Re-publish" : "Publish brief"}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <p className="eyebrow">{formatWeekLabel(data.brief.week_start)}</p>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            dirtyRef.current = true;
          }}
          placeholder="Untitled brief"
          className="mt-3 w-full bg-transparent text-3xl md:text-4xl font-bold tracking-[-0.02em] focus:outline-none placeholder:text-[color:var(--muted-foreground)]/60"
        />
        <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
          {isPublished ? "Published · changes will re-publish" : "Draft · autosaves every 30 seconds"}
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {data.sections
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((s) => (
            <SectionEditor
              key={s.id}
              section={s}
              value={sections[s.section_type]?.content ?? ""}
              onChange={(v) => {
                setSections((prev) => ({
                  ...prev,
                  [s.section_type]: { id: s.id, content: v },
                }));
                dirtyRef.current = true;
              }}
            />
          ))}
      </div>

      <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete brief
        </button>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  value,
  onChange,
}: {
  section: BriefSection;
  value: string;
  onChange: (v: string) => void;
}) {
  const meta = SECTION_META[section.section_type as SectionType] ?? {
    title: section.section_type,
    prompt: "",
    sort_order: section.sort_order,
  };
  const count = useMemo(() => value.length, [value]);
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="eyebrow">Section {section.sort_order + 1}</p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.01em]">{meta.title}</h3>
        </div>
        <p className="text-[11px] font-semibold text-[color:var(--muted-foreground)]">{count} chars</p>
      </div>
      {meta.prompt && <p className="mt-1 text-xs text-[color:var(--subtle-foreground)]">{meta.prompt}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Write here…"
        className="mt-4 w-full rounded-[8px] border border-border bg-background p-3 text-sm leading-[1.65] focus:outline-none focus:border-foreground resize-y min-h-[120px]"
      />
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[color:var(--muted-foreground)]">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[color:var(--success)]">
        <Check className="h-3 w-3" /> Saved
      </span>
    );
  }
  if (state === "error") {
    return <span className="text-xs text-[color:var(--destructive)]">Save failed</span>;
  }
  return null;
}

function EditSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-1/3 rounded bg-surface border border-border animate-pulse" />
      <div className="h-40 rounded-2xl bg-surface border border-border animate-pulse" />
      <div className="h-40 rounded-2xl bg-surface border border-border animate-pulse" />
    </div>
  );
}
