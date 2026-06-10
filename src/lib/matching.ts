// Trainer compatibility scoring (0-100)

export interface ClientPrefs {
  fitness_goal?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_trainer_gender?: string | null;
  preferred_experience?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface TrainerLike {
  user_id: string;
  specialties?: string[] | null;
  experience_years?: number | null;
  price_per_session?: number | null;
  rating?: number | null;
  profile: {
    gender?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    fitness_goal?: string | null;
  };
}

export interface MatchResult {
  score: number;
  distanceKm: number | null;
  reasons: string[];
  badges: string[];
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const goalSpecialtyMap: Record<string, string[]> = {
  weight_loss: ["cardio", "hiit", "fat loss", "weight loss"],
  muscle_gain: ["hypertrophy", "bodybuilding", "muscle"],
  body_recomposition: ["recomposition", "strength", "nutrition"],
  strength_training: ["strength", "powerlifting", "olympic"],
  general_fitness: ["functional", "general", "wellness"],
};

export function scoreTrainer(
  client: ClientPrefs,
  trainer: TrainerLike,
): MatchResult {
  const reasons: string[] = [];
  let total = 0;

  // 30% fitness goal / specialty
  const goal = client.fitness_goal ?? undefined;
  const wanted = goal ? goalSpecialtyMap[goal] ?? [] : [];
  const specs = (trainer.specialties ?? []).map((s) => s.toLowerCase());
  const specHit = wanted.some((w) => specs.some((s) => s.includes(w)));
  if (specHit) {
    total += 30;
    reasons.push(`Specializes in ${goal?.replace("_", " ")}`);
  } else if (specs.length > 0) {
    total += 12;
  }

  // 20% distance
  let distanceKm: number | null = null;
  if (
    client.latitude != null &&
    client.longitude != null &&
    trainer.profile.latitude != null &&
    trainer.profile.longitude != null
  ) {
    distanceKm = haversineKm(
      { lat: client.latitude, lng: client.longitude },
      { lat: trainer.profile.latitude, lng: trainer.profile.longitude },
    );
    if (distanceKm <= 5) {
      total += 20;
      reasons.push(`Just ${distanceKm.toFixed(1)} km away`);
    } else if (distanceKm <= 15) total += 14;
    else if (distanceKm <= 30) total += 8;
    else total += 3;
  } else {
    total += 10; // neutral
  }

  // 20% availability — placeholder (assume overlap)
  total += 14;

  // 15% budget
  const price = trainer.price_per_session ?? 0;
  if (
    client.budget_min != null &&
    client.budget_max != null &&
    price >= client.budget_min &&
    price <= client.budget_max
  ) {
    total += 15;
    reasons.push("Within your budget");
  } else if (client.budget_max != null && price <= client.budget_max) {
    total += 10;
  } else if (price > 0) total += 5;

  // 10% specialty count / rating
  const rating = trainer.rating ?? 0;
  if (rating >= 4.5) {
    total += 10;
    reasons.push("Top-rated");
  } else if (rating >= 4) total += 7;
  else total += 3;

  // 5% gender preference
  if (
    client.preferred_trainer_gender &&
    trainer.profile.gender === client.preferred_trainer_gender
  ) {
    total += 5;
    reasons.push("Matches gender preference");
  } else if (!client.preferred_trainer_gender) {
    total += 3;
  }

  const score = Math.min(100, Math.round(total));
  const badges: string[] = [];
  if (score >= 85) badges.push("Best Match");
  if (distanceKm != null && distanceKm <= 3) badges.push("Closest");
  if (
    client.budget_max != null &&
    price > 0 &&
    price <= (client.budget_max ?? 0) * 0.7
  )
    badges.push("Budget Friendly");
  if (rating >= 4.7) badges.push("Top Rated");

  return { score, distanceKm, reasons, badges };
}
