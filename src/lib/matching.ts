// Trainer compatibility scoring (0-100)

export interface ClientPrefs {
  fitness_goal?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_trainer_gender?: string | null;
  preferred_experience?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  training_style_pref?: string | null; // strict, supportive, analytical, flexible
  sessions_per_week_pref?: number | null;
}

export interface TrainerLike {
  user_id: string;
  specialties?: string[] | null;
  specialized_goals?: string[] | null;
  experience_years?: number | null;
  price_per_session?: number | null;
  rating?: number | null;
  training_location?: string | null;
  availability_slots?: { start_time: string; end_time: string; date: string }[] | null;
  retention_rate?: number | null; // 0.0 to 1.0
  training_style?: string | null; // strict, supportive, analytical, flexible
  profile_completeness?: number | null; // 0.0 to 1.0
  profile: {
    gender?: string | null;
    latitude?: number | null;
    longitude?: number | null;
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

// Goal to Specialty Matrix (Weights)
const goalSpecialtyMatrix: Record<string, Record<string, number>> = {
  weight_loss: {
    "hiit": 1.0,
    "cardio": 0.9,
    "fat loss": 1.0,
    "weight loss": 1.0,
    "nutrition": 0.7,
    "strength": 0.5,
  },
  muscle_gain: {
    "bodybuilding": 1.0,
    "hypertrophy": 1.0,
    "muscle": 1.0,
    "strength": 0.8,
    "nutrition": 0.6,
  },
  body_recomposition: {
    "recomposition": 1.0,
    "strength": 0.9,
    "nutrition": 1.0,
    "fat loss": 0.7,
    "muscle": 0.7,
  },
  strength_training: {
    "strength": 1.0,
    "powerlifting": 1.0,
    "olympic": 1.0,
    "mobility": 0.6,
  },
  general_fitness: {
    "functional": 1.0,
    "general": 1.0,
    "wellness": 0.9,
    "mobility": 0.8,
  },
};

export function scoreTrainer(
  client: ClientPrefs,
  trainer: TrainerLike,
): MatchResult | null {
  const reasons: string[] = [];
  let total = 0;

  const price = trainer.price_per_session ?? 0;
  const isOnline = trainer.training_location?.toLowerCase().includes("online");

  // --- HARD FILTERS ---
  if (client.budget_max != null && price > client.budget_max) return null;

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
    if (distanceKm > 50 && !isOnline) return null;
  }

  // --- SCORING (New Weights) ---

  // 1. Goal × Specialty Matrix (25%)
  const goal = client.fitness_goal ?? undefined;
  const specs = (trainer.specialties ?? []).map((s) => s.toLowerCase());
  const specializedGoals = (trainer.specialized_goals ?? []).map(g => g.toLowerCase());
  
  if (goal) {
    const matrix = goalSpecialtyMatrix[goal] ?? {};
    let goalScore = 0;
    if (specializedGoals.includes(goal.toLowerCase())) {
      goalScore = 1.0;
      reasons.push(`Expert in ${goal.replace("_", " ")}`);
    } else {
      let bestSpecWeight = 0;
      for (const [spec, weight] of Object.entries(matrix)) {
        if (specs.some(s => s.includes(spec))) {
          bestSpecWeight = Math.max(bestSpecWeight, weight);
        }
      }
      goalScore = bestSpecWeight;
      if (goalScore > 0) reasons.push(`Specialty match for your goal`);
    }
    total += goalScore * 25;
  } else {
    total += 15;
  }

  // 2. Schedule Overlap Score (20%)
  const sessionsNeeded = client.sessions_per_week_pref ?? 3;
  const availableSlotsCount = trainer.availability_slots?.length ?? 0;
  // Simplification: use slot count relative to needs (ideally would check actual time overlap)
  const overlapScore = Math.min(1, availableSlotsCount / sessionsNeeded);
  if (overlapScore >= 0.8) reasons.push("Great schedule availability");
  total += overlapScore * 20;

  // 3. Trainer Quality Score (15%)
  // Quality = rating (60%) + retention (30%) + completeness (10%)
  const rating = trainer.rating ?? 0;
  const ratingScore = rating / 5; // 0-1
  const retentionScore = trainer.retention_rate ?? 0.7; // Default 0.7 if missing
  const completenessScore = trainer.profile_completeness ?? 0.8; // Default 0.8 if missing
  
  const qualityScore = (ratingScore * 0.6) + (retentionScore * 0.3) + (completenessScore * 0.1);
  if (qualityScore >= 0.8) reasons.push("High-quality professional");
  total += qualityScore * 15;

  // 4. Experience Level Fit (15%)
  const expYears = trainer.experience_years ?? 0;
  const prefExp = client.preferred_experience;
  let expScore = 0.5;
  if (!prefExp || prefExp === "any") expScore = 0.7;
  else if (prefExp === "beginner") {
    if (expYears >= 2 && expYears <= 8) expScore = 1.0;
    else if (expYears > 8) expScore = 0.8;
  } else if (prefExp === "intermediate") {
    if (expYears >= 5) expScore = 1.0;
  } else if (prefExp === "advanced") {
    if (expYears >= 10) expScore = 1.0;
    else if (expYears >= 5) expScore = 0.7;
  }
  if (expScore >= 0.9) reasons.push("Experience level matches your needs");
  total += expScore * 15;

  // 5. Distance / Location (10%)
  let distScore = 0;
  if (distanceKm != null) {
    if (distanceKm <= 5) distScore = 1.0;
    else if (distanceKm <= 15) distScore = 0.8;
    else if (distanceKm <= 30) distScore = 0.5;
    else distScore = 0.2;
    if (distScore >= 0.8) reasons.push(`Close to you (${distanceKm.toFixed(1)} km)`);
  } else if (isOnline) {
    distScore = 0.8;
    reasons.push("Available online");
  } else {
    distScore = 0.5;
  }
  total += distScore * 10;

  // 6. Training Style Match (10%)
  const clientStyle = client.training_style_pref;
  const trainerStyle = trainer.training_style;
  let styleScore = 0.5;
  if (clientStyle && trainerStyle) {
    if (clientStyle.toLowerCase() === trainerStyle.toLowerCase()) {
      styleScore = 1.0;
      reasons.push(`Matches your ${clientStyle} training style`);
    }
  } else if (!clientStyle) {
    styleScore = 0.7;
  }
  total += styleScore * 10;

  // 7. Gender Preference (5%)
  let genderScore = 0.6;
  if (client.preferred_trainer_gender) {
    if (trainer.profile.gender === client.preferred_trainer_gender) {
      genderScore = 1.0;
      reasons.push("Matches gender preference");
    } else {
      genderScore = 0.2;
    }
  }
  total += genderScore * 5;

  const score = Math.min(100, Math.round(total));
  const badges: string[] = [];
  if (score >= 90) badges.push("Perfect Match");
  else if (score >= 80) badges.push("Best Match");
  if (distanceKm != null && distanceKm <= 3) badges.push("Closest");
  if (isOnline) badges.push("Online");
  if (expYears >= 10) badges.push("Veteran Coach");

  return { score, distanceKm, reasons, badges };
}
