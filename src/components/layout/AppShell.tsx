import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  Calendar,
  History,
  Sparkles,
  User,
  LogOut,
  Users,
  ShieldCheck,
  BarChart3,
  CalendarRange,
  Wallet,
  Activity,
  Dumbbell,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Search };

const navByRole: Record<AppRole, NavItem[]> = {
  client: [
    { to: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/client/discover", label: "Discover", icon: Search },
    { to: "/client/matches", label: "Matches", icon: Sparkles },
    { to: "/client/bookings", label: "Bookings", icon: History },
    { to: "/client/pose", label: "AI Pose", icon: Activity },
    { to: "/client/profile", label: "Profile", icon: User },
  ],
  trainer: [
    { to: "/trainer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/trainer/availability", label: "Availability", icon: Calendar },
    { to: "/trainer/bookings", label: "Bookings", icon: CalendarRange },
    { to: "/trainer/clients", label: "Clients", icon: Users },
    { to: "/trainer/earnings", label: "Earnings", icon: Wallet },
    { to: "/trainer/profile", label: "Profile", icon: User },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/trainers", label: "Trainers", icon: ShieldCheck },
    { to: "/admin/bookings", label: "Bookings", icon: CalendarRange },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { role, user, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const items = role ? navByRole[role] : [];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Fitder
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto flex flex-col gap-1 p-3">
          {items.map((it) => {
            const active = path === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                  active
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-sidebar-border p-3 bg-sidebar">
          <div className="mb-2 px-3 py-2 text-xs text-muted-foreground">
            <div className="truncate">{user?.email}</div>
            <div className="mt-1 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
              {role}
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              nav({ to: "/login" });
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <button
            className="rounded-md p-2 hover:bg-muted lg:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden font-display text-sm uppercase tracking-widest text-muted-foreground lg:block">
            {role} · Fitder
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
