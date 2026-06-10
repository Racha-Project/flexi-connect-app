import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/trainer/availability")({
  component: () => <RoleGuard role="trainer"><Avail /></RoleGuard>,
});

function Avail() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [date, setDate] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  const { data: slots, isLoading } = useQuery({
    queryKey: ["my-slots", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("trainer_id", user!.id)
        .order("date").order("start_time");
      return data ?? [];
    },
    enabled: !!user,
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    const d = new Date(date);
    const { error } = await supabase.from("availability_slots").insert({
      trainer_id: user!.id,
      date,
      day_of_week: d.getDay(),
      start_time: start,
      end_time: end,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Slot added");
      qc.invalidateQueries({ queryKey: ["my-slots"] });
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("availability_slots").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Slot removed");
      qc.invalidateQueries({ queryKey: ["my-slots"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Availability</h1>
        <p className="mt-2 text-muted-foreground">Open slots are bookable by clients.</p>
      </div>
      <form onSubmit={add} className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={cls} />
        <input type="time" value={start} onChange={(e) => setStart(e.target.value)} required className={cls} />
        <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required className={cls} />
        <button className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>
      {isLoading ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !slots || slots.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">No slots yet.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {new Date(s.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div className="mt-1 font-display text-lg font-bold">{s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</div>
                <div className="mt-1 text-xs">
                  {s.is_booked ? <span className="text-primary">Booked</span> : <span className="text-muted-foreground">Open</span>}
                </div>
              </div>
              {!s.is_booked && (
                <button onClick={() => remove(s.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cls = "rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none";
