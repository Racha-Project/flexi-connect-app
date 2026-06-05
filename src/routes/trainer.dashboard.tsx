import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Users, DollarSign, Zap, ZapOff, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/trainer/dashboard")({
  component: () => <RoleGuard role="trainer"><Dash /></RoleGuard>,
});

function Dash() {
  const { user } = useAuth();
  const { data, refetch } = useQuery({
    queryKey: ["trainer-dash", user?.id],
    queryFn: async () => {
      const [{ data: bookings }, { data: slots }, { data: tp }] = await Promise.all([
        supabase.from("bookings").select("id, booking_status, total_price, client_id").eq("trainer_id", user!.id),
        supabase.from("availability_slots").select("id, is_booked").eq("trainer_id", user!.id),
        supabase.from("trainer_profiles").select("auto_accept").eq("user_id", user!.id).maybeSingle(),
      ]);
      return { bookings: bookings ?? [], slots: slots ?? [], autoAccept: tp?.auto_accept ?? false };
    },
    enabled: !!user,
  });

  const [toggling, setToggling] = useState(false);
  const toggleAutoAccept = async () => {
    if (!user) return;
    setToggling(true);
    const { error } = await supabase
      .from("trainer_profiles")
      .update({ auto_accept: !data?.autoAccept })
      .eq("user_id", user.id);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Auto-accept ${!data?.autoAccept ? "enabled" : "disabled"}`);
      refetch();
    }
    setToggling(false);
  };

  const b = data?.bookings ?? [];
  const stats = {
    pending: b.filter((x) => x.booking_status === "pending").length,
    accepted: b.filter((x) => x.booking_status === "accepted").length,
    clients: new Set(b.map((x) => x.client_id)).size,
    earnings: b.filter((x) => x.booking_status === "completed").reduce((s, x) => s + Number(x.total_price ?? 0), 0),
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary">Trainer dashboard</div>
        <h1 className="mt-1 font-display text-4xl font-bold">Today's overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Pending requests" value={stats.pending} icon={Clock} />
        <Stat label="Accepted sessions" value={stats.accepted} icon={Calendar} />
        <Stat label="Unique clients" value={stats.clients} icon={Users} />
        <Stat label="Earnings" value={`$${stats.earnings}`} icon={DollarSign} />
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Quick actions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your availability to receive more bookings, or review pending requests.
            </p>
          </div>
          <button
            onClick={toggleAutoAccept}
            disabled={toggling}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
              data?.autoAccept
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {toggling ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : data?.autoAccept ? (
              <>
                <Zap className="h-3 w-3 fill-current" /> Auto-accept ON
              </>
            ) : (
              <>
                <ZapOff className="h-3 w-3" /> Auto-accept OFF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Clock }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        {label} <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
