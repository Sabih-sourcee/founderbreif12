import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  CalendarClock,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/brief/new", label: "This Week", icon: CalendarClock },
  { to: "/briefs", label: "Briefs", icon: FileText },
];

function initialsFor(name: string | null | undefined, email: string | null | undefined) {
  if (name) {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    const letters = parts.map((p) => p[0]).join("");
    if (letters) return letters.toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "·";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  function isActive(to: string) {
    if (to === "/dashboard") return pathname === "/dashboard";
    if (to === "/briefs") {
      return pathname === "/briefs" || (pathname.startsWith("/brief/") && pathname !== "/brief/new");
    }
    return pathname === to;
  }

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-border">
        <div className="h-8 w-8 rounded-lg border border-border bg-surface flex items-center justify-center">
          <FileText className="h-4 w-4" />
        </div>
        <span className="font-bold tracking-[-0.01em]">FounderBrief</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm border-l-2 ${
                active
                  ? "border-l-accent font-semibold bg-surface text-foreground"
                  : "border-l-transparent text-[color:var(--subtle-foreground)] hover:bg-surface hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <Link
          to="/brief/new"
          onClick={() => setMobileOpen(false)}
          className="mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" /> New Brief
        </Link>
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-[11px] font-semibold">
            {initialsFor(profile?.full_name, user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{profile?.full_name || user?.email}</p>
            <p className="text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)]">
              {profile?.plan === "pro" ? "Pro plan" : "Free plan"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="p-1.5 rounded-md text-[color:var(--muted-foreground)] hover:text-foreground hover:bg-surface"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r border-border bg-background flex-col">
        {SidebarBody}
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md border border-border bg-surface flex items-center justify-center">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold tracking-[-0.01em] text-sm">FounderBrief</span>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-md border border-border bg-surface"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-14">
          {SidebarBody}
        </div>
      )}

      <main className="md:pl-64">
        <div className="mx-auto max-w-5xl px-5 md:px-10 py-8 md:py-12">{children}</div>
      </main>
    </div>
  );
}
