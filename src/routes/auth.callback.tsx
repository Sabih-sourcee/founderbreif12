import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { LogoLink } from "@/components/Logo";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Confirming — FounderBrief" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirming your account…");

  useEffect(() => {
    let cancelled = false;

    async function finishAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) {
            throw new Error("No session found. The confirmation link may have expired.");
          }
        }

        if (cancelled) return;
        toast.success("You're signed in!");
        navigate({ to: "/dashboard", replace: true });
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Could not complete sign in. Try signing in manually.";
        setMessage(msg);
        toast.error(msg);
        window.setTimeout(() => navigate({ to: "/auth", replace: true }), 2500);
      }
    }

    finishAuth();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <LogoLink to="/" size="sm" />
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
      <p className="text-sm text-[color:var(--subtle-foreground)]">{message}</p>
    </div>
  );
}
