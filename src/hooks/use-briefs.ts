import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mondayISO, SECTION_TYPES, SECTION_META, type SectionType } from "@/lib/week";

export type Brief = {
  id: string;
  user_id: string;
  week_start: string;
  title: string;
  status: "draft" | "published";
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

export function useBriefs() {
  return useQuery({
    queryKey: ["briefs"],
    queryFn: async (): Promise<Brief[]> => {
      const { data, error } = await supabase
        .from("briefs")
        .select("*")
        .order("week_start", { ascending: false });
      if (error) throw error;
      return data as Brief[];
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
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      const { data: sections, error: sErr } = await supabase
        .from("brief_sections")
        .select("*")
        .eq("brief_id", id!)
        .order("sort_order");
      if (sErr) throw sErr;
      return { brief: brief as Brief, sections: (sections ?? []) as BriefSection[] };
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

      const { data: existing } = await supabase
        .from("briefs")
        .select("id")
        .eq("user_id", userId)
        .eq("week_start", week)
        .maybeSingle();
      if (existing) return existing.id;

      const { data: created, error } = await supabase
        .from("briefs")
        .insert({ user_id: userId, week_start: week, title: "" })
        .select("id")
        .single();
      if (error) throw error;

      const rows = SECTION_TYPES.map((t) => ({
        brief_id: created.id,
        section_type: t,
        content: "",
        sort_order: SECTION_META[t].sort_order,
      }));
      const { error: sErr } = await supabase.from("brief_sections").insert(rows);
      if (sErr) throw sErr;
      return created.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["briefs"] });
    },
  });
}

export function useUpdateSection() {
  return useMutation({
    mutationFn: async (input: { id: string; content: string }) => {
      const { error } = await supabase
        .from("brief_sections")
        .update({ content: input.content })
        .eq("id", input.id);
      if (error) throw error;
    },
  });
}

export function useUpdateBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title?: string; status?: Brief["status"] }) => {
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
