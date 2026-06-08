import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/trainer/earnings")({
  component: () => <RoleGuard role="trainer"><E /></RoleGuard>,
});

function E() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["earnings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("total_price, booking_status, created_at").eq("trainer_id", user!.id).eq("booking_status", "completed");
      return data ?? [];
    },
    enabled: !!user,
  });

  const total = (data ?? []).reduce((s, b) => s + Number(b.total_price ?? 0), 0);
  const month = (data ?? []).filter((b) => new Date(b.created_at).getMonth() === new Date().getMonth()).reduce((s, b) => s + Number(b.total_price ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Earnings</h1>
        <p className="mt-2 text-muted-foreground">Income from completed sessions.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">All-time <DollarSign className="h-4 w-4 text-primary" /></div>
          <div className="mt-3 font-display text-4xl font-bold">${total}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">This month <TrendingUp className="h-4 w-4 text-primary" /></div>
          <div className="mt-3 font-display text-4xl font-bold text-primary">${month}</div>
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Detailed earnings breakdown & payouts coming soon.
      </div>
    </div>
  );
}
