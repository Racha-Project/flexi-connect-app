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
        .select("total_price, commission_amount, net_amount, booking_status, created_at")
        .eq("trainer_id", user!.id)
        .eq("booking_status", "completed");
      return data ?? [];
    },
    enabled: !!user,
  });

  const totalGross = (data ?? []).reduce((s, b) => s + Number(b.total_price ?? 0), 0);
  const totalNet = (data ?? []).reduce((s, b) => s + Number(b.net_amount ?? b.total_price ?? 0), 0);
  const totalCommission = (data ?? []).reduce((s, b) => s + Number(b.commission_amount ?? 0), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthData = (data ?? []).filter((b) => {
    const d = new Date(b.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const monthNet = monthData.reduce((s, b) => s + Number(b.net_amount ?? b.total_price ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Earnings</h1>
        <p className="mt-2 text-muted-foreground">Income from completed sessions after 10% commission.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            Total Net Income <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 font-display text-4xl font-bold">${totalNet.toFixed(2)}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Gross: ${totalGross.toFixed(2)} | Fees: ${totalCommission.toFixed(2)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            Net This Month <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 font-display text-4xl font-bold text-primary">${monthNet.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left font-medium text-muted-foreground">
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Gross</th>
                <th className="pb-3 text-right">Fee (10%)</th>
                <th className="pb-3 text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">No completed bookings yet.</td>
                </tr>
              ) : (
                (data ?? []).map((b, i) => (
                  <tr key={i}>
                    <td className="py-3">{new Date(b.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">${Number(b.total_price).toFixed(2)}</td>
                    <td className="py-3 text-right text-destructive">-${Number(b.commission_amount ?? 0).toFixed(2)}</td>
                    <td className="py-3 text-right font-semibold text-primary">${Number(b.net_amount ?? b.total_price).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
