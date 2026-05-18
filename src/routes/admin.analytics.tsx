import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Wallet, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: () => <RoleGuard role="admin"><An /></RoleGuard>,
});

function An() {
  const { data: analyticsData } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data: b } = await supabase.from("bookings").select("booking_status, total_price, commission_amount");
      const counts: Record<string, number> = {};
      let totalRev = 0;
      let totalComm = 0;

      (b ?? []).forEach((x) => {
        counts[x.booking_status] = (counts[x.booking_status] ?? 0) + 1;
        if (x.booking_status === "completed") {
          totalRev += Number(x.total_price ?? 0);
          totalComm += Number(x.commission_amount ?? 0);
        }
      });

      return {
        chartData: Object.entries(counts).map(([status, count]) => ({ status, count })),
        totalRevenue: totalRev,
        totalCommission: totalComm,
      };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold">Platform Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            Total Commission <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-primary">
            ${analyticsData?.totalCommission.toFixed(2) ?? "0.00"}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground uppercase">Platform revenue (10%)</p>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            Total Volume <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold">
            ${analyticsData?.totalRevenue.toFixed(2) ?? "0.00"}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground uppercase">Total transacted</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            Completed Bookings <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold">
            {analyticsData?.chartData.find(d => d.status === "completed")?.count ?? 0}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground uppercase">Success rate</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Bookings by status</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={analyticsData?.chartData ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
              <XAxis dataKey="status" stroke="oklch(0.7 0 0)" />
              <YAxis stroke="oklch(0.7 0 0)" />
              <Tooltip contentStyle={{ background: "oklch(0.2 0 0)", border: "1px solid oklch(0.3 0 0)" }} />
              <Bar dataKey="count" fill="oklch(0.92 0.22 119)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
