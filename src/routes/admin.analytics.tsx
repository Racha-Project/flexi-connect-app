import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, DollarSign, Users, Briefcase } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: An,
});

function An() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data: b } = await supabase
        .from("bookings")
        .select("booking_status, total_price, commission_amount, created_at");
      
      const statusCounts: Record<string, number> = {};
      let totalRevenue = 0;
      let platformProfit = 0;
      const revenueByDate: Record<string, { date: string, revenue: number, profit: number }> = {};

      (b ?? []).forEach((x) => {
        // Status counts
        statusCounts[x.booking_status] = (statusCounts[x.booking_status] ?? 0) + 1;
        
        // Revenue calculations (only for completed)
        if (x.booking_status === "completed") {
          const revenue = Number(x.total_price ?? 0);
          // ✅ Fallback calculation if DB columns are null
          const profit = x.commission_amount !== null ? Number(x.commission_amount) : revenue * 0.1;
          
          totalRevenue += revenue;
          platformProfit += profit;

          const date = new Date(x.created_at).toLocaleDateString();
          if (!revenueByDate[date]) {
            revenueByDate[date] = { date, revenue: 0, profit: 0 };
          }
          revenueByDate[date].revenue += revenue;
          revenueByDate[date].profit += profit;
        }
      });

      return {
        statusData: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        revenueData: Object.values(revenueByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        stats: {
          totalRevenue,
          platformProfit,
          totalBookings: b?.length ?? 0,
          completedBookings: b?.filter(x => x.booking_status === "completed").length ?? 0
        }
      };
    },
  });

  if (isLoading) return <div className="p-12 text-center">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold">Platform Analytics</h1>
        <p className="mt-2 text-muted-foreground">ภาพรวมรายได้และสถิติของแพลตฟอร์ม (หักค่าคอมมิชชั่น 10%)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="รายได้รวมทั้งหมด (Gross)" 
          value={`฿${analytics?.stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
        />
        <StatCard 
          label="กำไรแพลตฟอร์ม (10%)" 
          value={`฿${analytics?.stats.platformProfit.toLocaleString()}`} 
          icon={TrendingUp}
          highlight
        />
        <StatCard 
          label="จำนวนการจองทั้งหมด" 
          value={analytics?.stats.totalBookings ?? 0} 
          icon={Briefcase} 
        />
        <StatCard 
          label="จองสำเร็จแล้ว" 
          value={analytics?.stats.completedBookings ?? 0} 
          icon={Users} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-6 font-display text-lg font-semibold">Revenue Trend (Platform Profit)</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={analytics?.revenueData ?? []}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.92 0.22 119)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.92 0.22 119)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.7 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.7 0 0)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: "oklch(0.2 0 0)", border: "1px solid oklch(0.3 0 0)", borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  name="Platform Profit"
                  stroke="oklch(0.92 0.22 119)" 
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-6 font-display text-lg font-semibold">Bookings by Status</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={analytics?.statusData ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" vertical={false} />
                <XAxis dataKey="status" stroke="oklch(0.7 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.7 0 0)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: "oklch(0.2 0 0)", border: "1px solid oklch(0.3 0 0)", borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="oklch(0.92 0.22 119)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, highlight }: { label: string, value: string | number, icon: any, highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 ${highlight ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'}`}>
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        {label}
        <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className={`mt-3 font-display text-3xl font-bold ${highlight ? 'text-primary' : ''}`}>{value}</div>
    </div>
  );
}
