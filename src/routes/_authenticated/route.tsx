import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { AuthProvider } from "@/lib/auth";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  head: () =>
    pageHead({
      title: "FounderBrief",
      path: "/dashboard",
      noindex: true,
    }),
  beforeLoad: async () => {
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      await supabase.auth.getSession();
    }
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw redirect({ to: "/auth" });
    return { user: sessionData.session.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AuthProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthProvider>
  );
}
