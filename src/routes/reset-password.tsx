import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Set new password — FounderBrief" }] }),
  component: ResetPasswordPage,
});

const schema = z.object({ password: z.string().min(8, "At least 8 characters").max(72) });
type V = z.infer<typeof schema>;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    // Only the PASSWORD_RECOVERY event indicates the user arrived via the
    // recovery email link. An existing signed-in session is NOT sufficient —
    // otherwise any logged-in user visiting this URL could silently rotate
    // their password without going through the email flow.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(values: V) {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="h-7 w-7 rounded-md border border-border bg-surface flex items-center justify-center">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold tracking-[-0.01em]">FounderBrief</span>
        </div>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Set a new password</h1>
        <p className="mt-2 text-sm text-[color:var(--subtle-foreground)]">
          Choose a password you'll remember. At least 8 characters.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="text-xs font-semibold text-[color:var(--subtle-foreground)]">New password</label>
            <input
              id="password" type="password" autoComplete="new-password"
              className="mt-1.5 h-11 w-full rounded-[8px] border border-border bg-surface px-3 text-sm focus:outline-none focus:border-foreground focus:bg-background"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-[color:var(--destructive)] mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting || !ready} className="h-11 w-full rounded-[8px] bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60">
            {isSubmitting ? "Updating…" : ready ? "Update password" : "Waiting for recovery link…"}
          </button>
        </form>
      </div>
    </div>
  );
}
