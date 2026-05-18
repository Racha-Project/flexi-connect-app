import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShieldCheck, Calendar, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => <RoleGuard role="admin"><A /></RoleGuard>,
});

function A() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [profiles, trainers, bookings, poses] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("trainer_profiles").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("pose_sessions").select("id", { count: "exact", head: true }),
      ]);
      return {
        users: profiles.count ?? 0,
        trainers: trainers.count ?? 0,
        bookings: bookings.count ?? 0,
        poses: poses.count ?? 0,
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
        <S label="Bookings" value={data?.bookings ?? 0} icon={Calendar} />
        <S label="Pose sessions" value={data?.poses ?? 0} icon={Activity} />
      </div>
    </div>
  );
}

function S({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">{label} <Icon className="h-4 w-4 text-primary" /></div>
      <div className="mt-3 font-display text-4xl font-bold">{value}</div>
    </div>
  );
}
