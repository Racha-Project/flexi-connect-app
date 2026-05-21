import { supabase } from "@/integrations/supabase/client";
import { scoreTrainer, type ClientPrefs, type MatchResult } from "@/lib/matching";
import type { TrainerCardData } from "@/components/trainers/TrainerCard";

export interface RankedTrainer extends TrainerCardData {
  match: MatchResult;
}

export async function fetchRankedTrainers(prefs: ClientPrefs): Promise<RankedTrainer[]> {
  const { data: trainers, error } = await supabase
    .from("trainer_profiles")
    .select("user_id, bio, specialties, specialized_goals, experience_years, price_per_session, rating, gym_name, training_location, is_approved, is_suspended")
    .eq("is_approved", true)
    .eq("is_suspended", false);
  if (error) throw error;
  if (!trainers || trainers.length === 0) return [];

  const ids = trainers.map((t) => t.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, gender, latitude, longitude")
    .in("id", ids);

  const profMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return trainers
    .map((t) => {
      const p = profMap.get(t.user_id);
      const match = scoreTrainer(prefs, {
        user_id: t.user_id,
        specialties: t.specialties,
        specialized_goals: t.specialized_goals,
        experience_years: t.experience_years,
        price_per_session: Number(t.price_per_session ?? 0),
        rating: Number(t.rating ?? 0),
        training_location: t.training_location,
        profile: {
          gender: p?.gender ?? null,
          latitude: p?.latitude ?? null,
          longitude: p?.longitude ?? null,
        },
      });

      if (!match) return null;

      return {
        user_id: t.user_id,
        full_name: p?.full_name ?? null,
        avatar_url: p?.avatar_url ?? null,
        bio: t.bio,
        specialties: t.specialties,
        experience_years: t.experience_years,
        price_per_session: Number(t.price_per_session ?? 0),
        rating: Number(t.rating ?? 0),
        gym_name: t.gym_name,
        match,
      } as RankedTrainer;
    })
    .filter((t): t is RankedTrainer => t !== null)
    .sort((a, b) => b.match.score - a.match.score);
}
