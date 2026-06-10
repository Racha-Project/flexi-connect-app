import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Users, DollarSign, Gift } from "lucide-react";
import { DailyReward } from "@/components/auth/DailyReward";

export const Route = createFileRoute("/trainer/dashboard")({
  component: () => <RoleGuard role="trainer"><Dash /></RoleGuard>,
});

function Dash() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["trainer-dash", user?.id],
    queryFn: async () => {
      const [{ data: bookings }, { data: slots }, { data: profile }] = await Promise.all([
        supabase.from("bookings").select("id, booking_status, total_price, commission_amount, net_amount, client_id").eq("trainer_id", user!.id),
        supabase.from("availability_slots").select("id, is_booked").eq("trainer_id", user!.id),
        supabase.from("profiles").select("reward_points").eq("id", user!.id).maybeSingle(),
      ]);
      return { bookings: bookings ?? [], slots: slots ?? [], profile };
    },
    enabled: !!user,
  });

  const b = data?.bookings ?? [];
  const completedBookings = b.filter((x) => x.booking_status === "completed");
  const stats = {
    pending: b.filter((x) => x.booking_status === "pending").length,
    accepted: b.filter((x) => x.booking_status === "accepted").length,
    clients: new Set(b.map((x) => x.client_id)).size,
    grossEarnings: completedBookings.reduce((s, x) => s + Number(x.total_price ?? 0), 0),
    netEarnings: completedBookings.reduce((s, x) => s + Number(x.net_amount ?? x.total_price ?? 0), 0),
    rewardPoints: data?.profile?.reward_points ?? 0,
  };

  return (
    <div className="space-y-8">
      <DailyReward />
      <div>
        <div className="text-xs uppercase tracking-widest text-primary">Trainer dashboard</div>
        <h1 className="mt-1 font-display text-4xl font-bold">Today's overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Stat label="Pending requests" value={stats.pending} icon={Clock} />
        <Stat label="Accepted sessions" value={stats.accepted} icon={Calendar} />
        <Stat label="Unique clients" value={stats.clients} icon={Users} />
        <Stat 
          label="Net Earnings" 
          value={`$${stats.netEarnings}`} 
          icon={DollarSign} 
          subValue={`Gross: $${stats.grossEarnings}`}
        />
        <Stat label="Reward Points" value={stats.rewardPoints} icon={Gift} />
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold">Quick actions</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your availability to receive more bookings, or review pending requests.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, subValue }: { label: string; value: string | number; icon: typeof Clock; subValue?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        {label} <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      {subValue && <div className="mt-1 text-xs text-muted-foreground">{subValue}</div>}
    </div>
  );
}
