import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, DollarSign, Award, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/client/trainer/$id")({
  component: () => (
    <RoleGuard role="client">
      <TrainerDetail />
    </RoleGuard>
  ),
});

function TrainerDetail() {
  const { id } = useParams({ from: "/client/trainer/$id" });
  const { user } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [booking, setBooking] = useState<string | null>(null);

  const { data: trainer, isLoading } = useQuery({
    queryKey: ["trainer-detail", id],
    queryFn: async () => {
      const { data: tp } = await supabase.from("trainer_profiles").select("*").eq("user_id", id).maybeSingle();
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      return { tp, prof };
    },
  });

  const { data: slots } = useQuery({
    queryKey: ["slots", id],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("trainer_id", id)
        .eq("is_booked", false)
        .gte("date", today)
        .order("date")
        .order("start_time");
      return data ?? [];
    },
  });

  const book = async (slotId: string) => {
    if (!user || !trainer?.tp) return;
    setBooking(slotId);
    const { error } = await supabase.from("bookings").insert({
      client_id: user.id,
      trainer_id: id,
      slot_id: slotId,
      total_price: trainer.tp.price_per_session ?? 0,
      booking_status: "pending",
    });
    if (error) {
      toast.error(error.message);
      setBooking(null);
      return;
    }
    await supabase.from("availability_slots").update({ is_booked: true }).eq("id", slotId);
    toast.success("Booking requested!");
    qc.invalidateQueries({ queryKey: ["slots", id] });
    setBooking(null);
    nav({ to: "/client/bookings" });
  };

  if (isLoading || !trainer)
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const { tp, prof } = trainer;
  if (!tp) return <div>Trainer not found.</div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="aspect-square overflow-hidden rounded-xl border border-border bg-surface-elevated">
          {prof?.avatar_url ? (
            <img src={prof.avatar_url} alt={prof.full_name ?? ""} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-7xl font-bold text-primary/40">
              {prof?.full_name?.[0]?.toUpperCase() ?? "T"}
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold">{prof?.full_name ?? "Trainer"}</h1>
          {tp.gym_name && (
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {tp.gym_name}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-4">
            <Stat icon={Star} label="Rating" value={`${Number(tp.rating ?? 0).toFixed(1)} / 5`} />
            <Stat icon={Award} label="Experience" value={`${tp.experience_years ?? 0} yrs`} />
            <Stat icon={DollarSign} label="Price" value={`$${tp.price_per_session ?? 0}`} />
          </div>
          <p className="mt-6 text-muted-foreground">{tp.bio || "No bio yet."}</p>
          {tp.specialties && tp.specialties.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tp.specialties.map((s: string) => (
                <span key={s} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold">
          <Calendar className="h-5 w-5 text-primary" /> Available slots
        </h2>
        {!slots || slots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No available slots right now.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((s) => (
              <button
                key={s.id}
                disabled={booking === s.id}
                onClick={() => book(s.id)}
                className="group rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary disabled:opacity-50"
              >
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {new Date(s.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div className="mt-1 font-display text-xl font-bold">
                  {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                </div>
                <div className="mt-2 text-xs text-primary opacity-0 transition group-hover:opacity-100">
                  {booking === s.id ? "Booking…" : "Book this slot →"}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 font-display text-lg font-bold">{value}</div>
    </div>
  );
}
