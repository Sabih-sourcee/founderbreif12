import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { sendWaitlistEmail } from "@/lib/waitlist-email";

const waitlistSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  full_name: z.string().trim().max(100).optional(),
});

type WaitlistValues = z.infer<typeof waitlistSchema>;

const inputCls =
  "h-11 w-full min-w-0 rounded-[8px] border border-border bg-surface px-3 text-sm placeholder:text-[color:var(--muted-foreground)] focus:outline-none focus:border-foreground focus:bg-background";
const errCls = "text-xs text-[color:var(--destructive)]";

type WaitlistFormProps = {
  variant?: "inline" | "stacked";
  showName?: boolean;
  submitLabel?: string;
  className?: string;
};

function waitlistErrorMessage(code: string | undefined, message: string): string {
  if (code === "23505") return "";
  if (code === "42P01" || code === "PGRST205") {
    return "Waitlist signup is being set up. Please try again shortly.";
  }
  if (code === "42501") {
    return "We couldn't save your signup. Please try again.";
  }
  console.error("[waitlist]", code, message);
  return "We couldn't add you to the waitlist. Please try again.";
}

export function WaitlistForm({
  variant = "inline",
  showName = false,
  submitLabel = "Join waitlist",
  className = "",
}: WaitlistFormProps) {
  const [joined, setJoined] = useState(false);
  const [joinedEmail, setJoinedEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<WaitlistValues>({
    resolver: zodResolver(waitlistSchema),
  });

  async function onSubmit(values: WaitlistValues) {
    clearErrors("root");
    const email = values.email.trim().toLowerCase();
    const full_name = values.full_name?.trim() || null;

    try {
      const { error } = await supabase.from("waitlist_signups").insert({
        email,
        full_name,
      });

      if (error) {
        if (error.code === "23505") {
          setJoinedEmail(email);
          setJoined(true);
          return;
        }
        setError("root", { message: waitlistErrorMessage(error.code, error.message) });
        return;
      }

      void sendWaitlistEmail(email, full_name, "welcome");
      setJoinedEmail(email);
      setJoined(true);
    } catch {
      setError("root", {
        message: "Couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  if (joined) {
    return (
      <div className={`rounded-2xl border border-border bg-surface p-6 text-left ${className}`}>
        <p className="text-sm font-semibold text-foreground">You&apos;re on the list</p>
        <p className="mt-2 text-sm leading-[1.65] text-[color:var(--subtle-foreground)]">
          Check your inbox at{" "}
          <span className="font-semibold text-foreground">{joinedEmail}</span> — we just sent a
          confirmation. We&apos;ll email you again when it&apos;s your turn for early access.
        </p>
      </div>
    );
  }

  const isInline = variant === "inline";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`w-full ${isInline ? "max-w-xl" : "max-w-md mx-auto"} ${className}`}
    >
      <div className={isInline ? "flex flex-col sm:flex-row gap-3" : "space-y-4"}>
        {showName && (
          <div className={isInline ? "sm:flex-1 sm:min-w-[140px]" : ""}>
            <input
              type="text"
              autoComplete="name"
              placeholder="Your name (optional)"
              className={inputCls}
              {...register("full_name")}
            />
            {errors.full_name && <p className={`${errCls} mt-1`}>{errors.full_name.message}</p>}
          </div>
        )}
        <div className={isInline ? "sm:flex-[1.4] sm:min-w-[180px]" : ""}>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={inputCls}
            {...register("email")}
          />
          {errors.email && <p className={`${errCls} mt-1`}>{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center justify-center h-11 px-5 rounded-[8px] text-sm font-semibold transition-colors bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60 ${isInline ? "sm:shrink-0" : "w-full"}`}
        >
          {isSubmitting ? "Joining…" : submitLabel}
        </button>
      </div>
      {errors.root && <p className={`${errCls} mt-2`}>{errors.root.message}</p>}
    </form>
  );
}
