import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LayoutDashboard, Briefcase, ShoppingBag, Sparkles, MessageSquare, Users, Settings, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const items = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/services", label: "Services", icon: Sparkles },
  { to: "/admin/testimonials", label: "Testimonials", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/hiring", label: "Hiring", icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { session, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isLoginPage = path === "/admin/login";

  useEffect(() => {
    if (!loading && !session && !isLoginPage) {
      nav({ to: "/admin/login" });
    }
  }, [loading, session, nav, isLoginPage]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  // If we are on the login page, just render the outlet (the login form)
  if (isLoginPage) return <Outlet />;

  // If no session and not on login page, we'll be redirected by the useEffect
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div className="glass max-w-md rounded-3xl p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="font-display mt-6 text-2xl font-bold">Not authorized</h1>
          <p className="mt-2 text-muted-foreground">This account is not an admin. Please contact the owner or sign in with an admin account.</p>
          <button 
            onClick={() => supabase.auth.signOut().then(() => nav({ to: "/admin/login" }))} 
            className="mt-8 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-surface/50 p-4 md:flex">
        <Link to="/" className="font-display px-2 py-3 text-lg font-bold">Lacha<span className="text-primary">.</span></Link>
        <nav className="mt-4 flex-1 space-y-0.5">
          {items.map((it) => {
            const active = it.exact ? path === it.to : path.startsWith(it.to);
            return (
              <Link key={it.to} to={it.to} className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors", active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50")}>
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={() => supabase.auth.signOut().then(() => nav({ to: "/admin/login" }))} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
