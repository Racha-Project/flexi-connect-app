import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/trainer/profile")({
  component: () => <RoleGuard role="trainer"><P /></RoleGuard>,
});

function P() {
  const { user } = useAuth();
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["trainer-profile", user?.id],
    queryFn: async () => {
      const { data: tp } = await supabase.from("trainer_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return { tp, prof };
    },
    enabled: !!user,
  });

  const [form, setForm] = useState<Record<string, unknown>>({});
  useEffect(() => {
    if (data) setForm({ ...data.prof, ...data.tp, full_name: data.prof?.full_name });
  }, [data]);

  const [saving, setSaving] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const specialties = String(form.specialties_str ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const certifications = String(form.certifications_str ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("profiles").update({
        full_name: (form.full_name as string) || null,
        gender: (form.gender as "male") || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      }).eq("id", user!.id),
      supabase.from("trainer_profiles").update({
        bio: (form.bio as string) || null,
        specialties,
        certifications,
        experience_years: Number(form.experience_years || 0),
        price_per_session: Number(form.price_per_session || 0),
        training_location: (form.training_location as string) || null,
        gym_name: (form.gym_name as string) || null,
      }).eq("user_id", user!.id),
    ]);
    setSaving(false);
    if (e1 || e2) toast.error((e1 || e2)!.message);
    else { toast.success("Profile saved"); refetch(); }
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const specStr = (form.specialties_str as string) ?? (Array.isArray(form.specialties) ? (form.specialties as string[]).join(", ") : "");
  const certStr = (form.certifications_str as string) ?? (Array.isArray(form.certifications) ? (form.certifications as string[]).join(", ") : "");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Trainer profile</h1>
        <p className="mt-2 text-muted-foreground">This is what clients see.</p>
      </div>
      <form onSubmit={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
        <F label="Full name"><input value={(form.full_name as string) ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={cls} /></F>
        <F label="Bio"><textarea rows={3} value={(form.bio as string) ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={cls} /></F>
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Years of experience"><input type="number" value={(form.experience_years as number) ?? 0} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} className={cls} /></F>
          <F label="Price per session ($)"><input type="number" value={(form.price_per_session as number) ?? 0} onChange={(e) => setForm({ ...form, price_per_session: e.target.value })} className={cls} /></F>
        </div>
        <F label="Specialties (comma separated)"><input value={specStr} onChange={(e) => setForm({ ...form, specialties_str: e.target.value })} className={cls} placeholder="strength, hypertrophy, cardio" /></F>
        <F label="Certifications (comma separated)"><input value={certStr} onChange={(e) => setForm({ ...form, certifications_str: e.target.value })} className={cls} placeholder="NASM, ACE" /></F>
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Gym name"><input value={(form.gym_name as string) ?? ""} onChange={(e) => setForm({ ...form, gym_name: e.target.value })} className={cls} /></F>
          <F label="Training location"><input value={(form.training_location as string) ?? ""} onChange={(e) => setForm({ ...form, training_location: e.target.value })} className={cls} /></F>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Latitude"><input value={(form.latitude as number) ?? ""} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className={cls} /></F>
          <F label="Longitude"><input value={(form.longitude as number) ?? ""} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className={cls} /></F>
        </div>
        <button disabled={saving} className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
      </form>
    </div>
  );
}

const cls = "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none";
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>;
}
