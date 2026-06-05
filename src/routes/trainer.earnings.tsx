import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Percent, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trainer/earnings")({
  component: () => <RoleGuard role="trainer"><E /></RoleGuard>,
});

function E() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["earnings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("total_price, commission_amount, net_amount, booking_status, created_at")
        .eq("trainer_id", user!.id)
        .eq("booking_status", "completed")
        .order("created_at", { ascending: false });
      
      // ✅ Fallback: หากข้อมูลใน DB ยังเป็น Null (เช่น ยังไม่ได้รัน SQL Migration) 
      // ให้คำนวณสดที่ Frontend เพื่อให้ Trainer เห็นตัวเลขทันที
      return (data ?? []).map(b => {
        const total = Number(b.total_price ?? 0);
        const comm = b.commission_amount !== null ? Number(b.commission_amount) : total * 0.1;
        const net = b.net_amount !== null ? Number(b.net_amount) : total - comm;
        return {
          ...b,
          commission_amount: comm,
          net_amount: net
        };
      });
    },
    enabled: !!user,
  });

  const totalGross = (data ?? []).reduce((s, b) => s + Number(b.total_price ?? 0), 0);
  const totalCommission = (data ?? []).reduce((s, b) => s + Number(b.commission_amount ?? 0), 0);
  const totalNet = (data ?? []).reduce((s, b) => s + Number(b.net_amount ?? 0), 0);

  const thisMonthData = (data ?? []).filter((b) => {
    const d = new Date(b.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthGross = thisMonthData.reduce((s, b) => s + Number(b.total_price ?? 0), 0);
  const monthNet = thisMonthData.reduce((s, b) => s + Number(b.net_amount ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold">Earnings</h1>
        <p className="mt-2 text-muted-foreground">รายได้จากการเทรนที่หักค่าคอมมิชชั่น 10% แล้ว</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard 
          label="รายได้สุทธิทั้งหมด" 
          value={`฿${totalNet.toLocaleString()}`} 
          subValue={`จากยอดรวม ฿${totalGross.toLocaleString()}`}
          icon={Wallet} 
          primary
        />
        <SummaryCard 
          label="รายได้สุทธิเดือนนี้" 
          value={`฿${monthNet.toLocaleString()}`} 
          subValue={`จากยอดรวม ฿${monthGross.toLocaleString()}`}
          icon={TrendingUp} 
        />
        <SummaryCard 
          label="ค่าคอมมิชชั่นสะสม (10%)" 
          value={`฿${totalCommission.toLocaleString()}`} 
          icon={Percent} 
          variant="muted"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/50 px-6 py-4">
          <h2 className="font-bold">ประวัติรายได้ (Completed Sessions)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-6 py-3 font-medium">วันที่</th>
                <th className="px-6 py-3 font-medium">ยอดเต็ม</th>
                <th className="px-6 py-3 font-medium">ค่าคอมฯ (10%)</th>
                <th className="px-6 py-3 font-medium text-primary">รายได้สุทธิ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : (data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">ยังไม่มีรายได้ที่เสร็จสมบูรณ์</td>
                </tr>
              ) : (
                (data ?? []).map((b, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">{new Date(b.created_at).toLocaleDateString('th-TH')}</td>
                    <td className="px-6 py-4 font-mono">฿{Number(b.total_price).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">-฿{Number(b.commission_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-primary">฿{Number(b.net_amount).toLocaleString()}</td>
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

function SummaryCard({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  primary,
  variant = "default" 
}: { 
  label: string; 
  value: string; 
  subValue?: string;
  icon: any; 
  primary?: boolean;
  variant?: "default" | "muted"
}) {
  return (
    <div className={cn(
      "rounded-xl border p-6 transition-all hover:shadow-md",
      primary ? "border-primary/20 bg-primary/5" : "border-border bg-card",
      variant === "muted" && "opacity-80"
    )}>
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        {label} 
        <Icon className={cn("h-4 w-4", primary ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className={cn("mt-3 font-display text-3xl font-bold", primary && "text-primary")}>
        {value}
      </div>
      {subValue && (
        <div className="mt-1 text-xs text-muted-foreground italic">
          {subValue}
        </div>
      )}
    </div>
  );
}
