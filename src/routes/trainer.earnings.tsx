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
      const { data } = await supabase
        .from("bookings")
        .select("total_price, net_amount, commission_amount, booking_status, created_at")
        .eq("trainer_id", user!.id)
        .eq("booking_status", "completed");
      return data ?? [];
    },
    enabled: !!user,
  });

  const total = (data ?? []).reduce((s, b) => s + Number(b.net_amount ?? b.total_price ?? 0), 0);
  const month = (data ?? []).filter((b) => new Date(b.created_at).getMonth() === new Date().getMonth()).reduce((s, b) => s + Number(b.net_amount ?? b.total_price ?? 0), 0);
  const totalCommission = (data ?? []).reduce((s, b) => s + Number(b.commission_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Earnings</h1>
        <p className="mt-2 text-muted-foreground">Income from completed sessions.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            Net Earnings (All-time) <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 font-display text-4xl font-bold">${total.toFixed(2)}</div>
          <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest">After 10% platform fee</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            This month <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 font-display text-4xl font-bold text-primary">${month.toFixed(2)}</div>
          <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest">Net income</p>
        </div>
      </div>
      
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Earnings Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Platform Fees (10%)</span>
            <span className="font-bold text-destructive">-${totalCommission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-bold">
            <span>Total Payout Amount</span>
            <span className="text-success">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
