import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { LogoLink } from "@/components/Logo";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reset password — FounderBrief" }] }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().trim().email().max(255) });
type V = z.infer<typeof schema>;

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: V) {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("If that email exists, we sent a reset link.");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <LogoLink to="/" size="xs" className="mb-8" />
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Reset your password</h1>
        <p className="mt-2 text-sm text-[color:var(--subtle-foreground)]">
          We'll email you a link to set a new password.
        </p>
        {sent ? (
          <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-sm leading-[1.65]">
            Check your inbox. The link is good for one hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-[color:var(--subtle-foreground)]">Email</label>
              <input
                id="email" type="email" autoComplete="email"
                className="mt-1.5 h-11 w-full rounded-[8px] border border-border bg-surface px-3 text-sm focus:outline-none focus:border-foreground focus:bg-background"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-[color:var(--destructive)] mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-[8px] bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60">
              {isSubmitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <Link to="/auth" className="mt-6 inline-flex items-center gap-1.5 text-sm text-[color:var(--subtle-foreground)] hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
