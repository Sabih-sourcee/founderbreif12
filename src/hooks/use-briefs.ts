import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mondayISO, SECTION_TYPES, SECTION_META, type SectionType } from "@/lib/week";

export type BriefStatus = "draft" | "published";

export type Brief = {
  id: string;
  user_id: string;
  week_start: string;
  title: string;
  status: BriefStatus;
  created_at: string;
  updated_at: string;
};

export type BriefSection = {
  id: string;
  brief_id: string;
  section_type: SectionType;
  content: string;
  sort_order: number;
};

function normalizeStatus(s: string): BriefStatus {
  return s === "published" ? "published" : "draft";
}

function toBrief(row: any): Brief {
  return { ...row, status: normalizeStatus(row.status) };
}

export function useBriefs() {
  return useQuery({
    queryKey: ["briefs"],
    queryFn: async (): Promise<Brief[]> => {
      const { data, error } = await supabase
        .from("briefs")
        .select("*")
        .order("week_start", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toBrief);
    },
  });
}

export function useBrief(id: string | undefined) {
  return useQuery({
    queryKey: ["brief", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: brief, error } = await supabase
        .from("briefs")
        .select("*, brief_sections(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      const { brief_sections, ...rest } = brief as any;
      const sections = (brief_sections ?? [])
        .map((s: any) => ({ ...s, section_type: s.section_type as SectionType }))
        .sort((a: BriefSection, b: BriefSection) => a.sort_order - b.sort_order);
      return { brief: toBrief(rest), sections: sections as BriefSection[] };
    },
  });
}

/** Ensure a brief exists for current week. Returns the brief id. Seeds 6 sections. */
export function useEnsureCurrentBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const week = mondayISO();

      // Race-safe: upsert on the (user_id, week_start) UNIQUE constraint.
      const { data: upserted, error } = await supabase
        .from("briefs")
        .upsert(
          { user_id: userId, week_start: week, title: "" },
          { onConflict: "user_id,week_start", ignoreDuplicates: false },
        )
        .select("id")
        .single();
      if (error) throw error;
      const briefId = upserted.id;

      // Only seed sections if none exist yet (idempotent).
      const { count } = await supabase
        .from("brief_sections")
        .select("id", { count: "exact", head: true })
        .eq("brief_id", briefId);
      if (!count) {
        const rows = SECTION_TYPES.map((t) => ({
          brief_id: briefId,
          section_type: t,
          content: "",
          sort_order: SECTION_META[t].sort_order,
        }));
        const { error: sErr } = await supabase.from("brief_sections").insert(rows);
        if (sErr) throw sErr;
      }
      return briefId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["briefs"] });
    },
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; brief_id: string; content: string }) => {
      const { error } = await supabase
        .from("brief_sections")
        .update({ content: input.content })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["brief", vars.brief_id] });
    },
  });
}

export function useUpdateBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title?: string; status?: BriefStatus }) => {
      const { error } = await supabase
        .from("briefs")
        .update({
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["brief", vars.id] });
      qc.invalidateQueries({ queryKey: ["briefs"] });
    },
  });
}

export function useDeleteBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("briefs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["briefs"] }),
  });
}
