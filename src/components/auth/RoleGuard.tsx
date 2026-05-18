import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export function RoleGuard({
  role,
  children,
}: {
  role: AppRole;
  children: ReactNode;
}) {
  const { user, role: userRole, loading, roleLoading } = useAuth();
  const nav = useNavigate();

  const isLoading = loading || roleLoading;

  useEffect(() => {
    if (isLoading) return;
    if (!user) nav({ to: "/login" });
    else if (userRole && userRole !== role) {
      nav({ to: `/${userRole}/dashboard` as never });
    }
  }, [user, userRole, isLoading, role, nav]);

  if (isLoading || !user || userRole !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <AppShell>{children}</AppShell>;
}
