import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useEnsureCurrentBrief } from "@/hooks/use-briefs";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/brief/new")({
  head: () => ({ meta: [{ title: "New brief — FounderBrief" }] }),
  component: NewBriefRedirect,
});

function NewBriefRedirect() {
  const ensure = useEnsureCurrentBrief();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    ensure
      .mutateAsync()
      .then((id) => {
        if (!cancelled) navigate({ to: "/brief/$id/edit", params: { id }, replace: true });
      })
      .catch((e) => toast.error(e.message ?? "Couldn't open brief"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="py-20 text-center text-sm text-[color:var(--muted-foreground)]">
      Opening this week's brief…
    </div>
  );
}
