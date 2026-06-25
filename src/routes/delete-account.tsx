import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { LogoLink } from "@/components/Logo";
import { clearDemoSession } from "@/lib/demo-session";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/delete-account")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Delete account — FounderBrief" }],
  }),
  component: DeleteAccountPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  confirmed: z.literal(true, {
    errorMap: () => ({ message: "You must confirm that you understand this action is permanent." }),
  }),
});

type FormValues = z.infer<typeof schema>;

function DeleteAccountPage() {
  const [deleted, setDeleted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { confirmed: undefined },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);

    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email, password: values.password }),
    });

    const data = (await res.json()) as { error?: string; message?: string };

    if (!res.ok) {
      const message = data.error ?? "Could not delete your account.";
      setFormError(message);
      toast.error(message);
      return;
    }

    await supabase.auth.signOut();
    clearDemoSession();
    localStorage.removeItem("founderbrief_demo_used");
    setDeleted(true);
    toast.success("Account deleted");
  }

  if (deleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <LogoLink to="/" size="xs" className="mb-8 mx-auto" />
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">Account deleted</h1>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--subtle-foreground)]">
            Your FounderBrief account, profile, briefs, and related data have been permanently
            removed.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-[8px] bg-foreground text-sm font-semibold text-background hover:bg-foreground/90"
          >
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <LogoLink to="/" size="xs" className="mb-8" />

        <h1 className="text-2xl font-bold tracking-[-0.02em]">Delete your account</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--subtle-foreground)]">
          Enter your email and password to permanently delete your account and all associated data.
        </p>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-left">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
            <div className="text-xs leading-relaxed text-red-900">
              <p className="font-semibold">This action cannot be undone.</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Your profile and login credentials</li>
                <li>All weekly briefs and sections</li>
                <li>Metrics and priorities</li>
                <li>Demo session data stored on this device</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-800">
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="text-xs font-semibold text-[color:var(--subtle-foreground)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1.5 h-11 w-full rounded-[8px] border border-border bg-surface px-3 text-sm focus:border-foreground focus:bg-background focus:outline-none"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[color:var(--destructive)]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-xs font-semibold text-[color:var(--subtle-foreground)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1.5 h-11 w-full rounded-[8px] border border-border bg-surface px-3 text-sm focus:border-foreground focus:bg-background focus:outline-none"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-[color:var(--destructive)]">
                {errors.password.message}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border border-border bg-surface p-3 text-left">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
              {...register("confirmed")}
            />
            <span className="text-xs leading-relaxed text-[color:var(--subtle-foreground)]">
              I understand this permanently deletes my account and all data. This cannot be reversed.
            </span>
          </label>
          {errors.confirmed && (
            <p className="text-xs text-[color:var(--destructive)]">{errors.confirmed.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-[8px] bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isSubmitting ? "Deleting account…" : "Delete my account permanently"}
          </button>
        </form>

        <Link
          to="/auth"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-[color:var(--subtle-foreground)] hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
