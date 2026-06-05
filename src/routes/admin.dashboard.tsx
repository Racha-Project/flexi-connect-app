import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShieldCheck, Calendar, Activity, TrendingUp, DollarSign } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: A,
});

function A() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [profiles, trainers, bookings, poses, recentBookings] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("trainer_profiles").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id, total_price, commission_amount, booking_status"),
        supabase.from("pose_sessions").select("id", { count: "exact", head: true }),
        supabase
          .from("bookings")
          .select("*, client:profiles!client_id(full_name)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const allBookings = bookings.data ?? [];
      let totalGross = 0;
      let platformProfit = 0;

      allBookings.forEach(b => {
        if (b.booking_status === "completed") {
          const gross = Number(b.total_price ?? 0);
          const profit = b.commission_amount !== null ? Number(b.commission_amount) : gross * 0.1;
          totalGross += gross;
          platformProfit += profit;
        }
      });

      return {
        users: profiles.count ?? 0,
        trainers: trainers.count ?? 0,
        bookings: allBookings.length,
        poses: poses.count ?? 0,
        totalGross,
        platformProfit,
        recentBookings: recentBookings.data ?? [],
      };
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary">Admin</div>
        <h1 className="mt-1 font-display text-4xl font-bold">Platform overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <S label="Total users" value={data?.users ?? 0} icon={Users} />
        <S label="Trainers" value={data?.trainers ?? 0} icon={ShieldCheck} />
        <S label="Gross Revenue" value={`฿${data?.totalGross.toLocaleString()}`} icon={DollarSign} />
        <S label="Platform Profit" value={`฿${data?.platformProfit.toLocaleString()}`} icon={TrendingUp} highlight />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Recent Bookings</h2>
          <div className="space-y-4">
            {(data?.recentBookings ?? []).map((b: any) => (
              <div key={b.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div>
                  <div className="font-semibold">{b.client?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">${b.total_price}</div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">{b.booking_status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-success uppercase">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auth Service</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-success uppercase">
                <span className="h-2 w-2 rounded-full bg-success" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-success uppercase">
                <span className="h-2 w-2 rounded-full bg-success" />
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function S({ label, value, icon: Icon, highlight }: { label: string; value: string | number; icon: typeof Users, highlight?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${highlight ? 'border-primary/50 bg-primary/5' : ''}`}>
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">{label} <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-primary'}`} /></div>
      <div className={`mt-3 font-display text-3xl font-bold ${highlight ? 'text-primary' : ''}`}>{value}</div>
    </div>
  );
}
