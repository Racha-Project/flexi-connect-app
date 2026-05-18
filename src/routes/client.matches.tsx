import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchRankedTrainers } from "@/lib/trainers";
import { TrainerCard } from "@/components/trainers/TrainerCard";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/client/matches")({
  component: () => (
    <RoleGuard role="client">
      <Matches />
    </RoleGuard>
  ),
});

function Matches() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: ranked, isLoading } = useQuery({
    queryKey: ["matches", profile?.id, profile?.fitness_goal],
    queryFn: () =>
      fetchRankedTrainers({
        fitness_goal: profile?.fitness_goal,
        budget_min: profile?.budget_min,
        budget_max: profile?.budget_max,
        preferred_trainer_gender: profile?.preferred_trainer_gender,
        preferred_experience: profile?.preferred_experience,
        latitude: profile?.latitude,
        longitude: profile?.longitude,
      }),
    enabled: !!profile,
  });

  const top = (ranked ?? []).filter((r) => r.match.score >= 60);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Your AI matches</h1>
        <p className="mt-2 text-muted-foreground">Trainers ranked by compatibility with your goals.</p>
      </div>
      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : top.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          No strong matches yet — complete your profile or browse all trainers.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((t) => (
            <div key={t.user_id} className="space-y-2">
              <TrainerCard trainer={t} match={t.match} />
              {t.match.reasons.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                  <div className="mb-1 font-semibold uppercase tracking-widest text-primary">Why this match</div>
                  <ul className="space-y-0.5">
                    {t.match.reasons.map((r) => <li key={r}>• {r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
