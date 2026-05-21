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
  specialized_goals?: string[] | null;
  experience_years?: number | null;
  price_per_session?: number | null;
  rating?: number | null;
  training_location?: string | null;
  availability_slots?: { start_time: string; end_time: string; date: string }[] | null;
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
  
  // 1. Budget Hard Filter
  if (client.budget_max != null && price > client.budget_max) {
    return null; 
  }

  // 2. Distance Hard Filter (Max 50km unless online)
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
    
    if (distanceKm > 50 && !isOnline) {
      return null;
    }
  }

  // 3. Availability Hard Filter (Optional - only if client has preferred times)
  // For now, if trainer has NO slots and it's not online, we might skip, 
  // but let's keep it simple: only exclude if they explicitly don't match a specific required slot.
  // (Assuming for now we just want to show trainers with ANY slots)

  // --- SCORING ---

  // 30% Fitness Goal & Specialty Matrix
  const goal = client.fitness_goal ?? undefined;
  const specs = (trainer.specialties ?? []).map((s) => s.toLowerCase());
  const specializedGoals = (trainer.specialized_goals ?? []).map(g => g.toLowerCase());
  
  if (goal) {
    const matrix = goalSpecialtyMatrix[goal] ?? {};
    let goalScore = 0;
    
    // Direct goal match
    if (specializedGoals.includes(goal.toLowerCase())) {
      goalScore = 1.0;
      reasons.push(`Expert in ${goal.replace("_", " ")}`);
    } else {
      // Matrix match
      let bestSpecWeight = 0;
      for (const [spec, weight] of Object.entries(matrix)) {
        if (specs.some(s => s.includes(spec))) {
          bestSpecWeight = Math.max(bestSpecWeight, weight);
        }
      }
      goalScore = bestSpecWeight;
      if (goalScore > 0) {
        reasons.push(`Strong specialty match for your goal`);
      }
    }
    total += goalScore * 30;
  } else {
    total += 15; // Neutral
  }

  // 20% Distance / Online
  if (distanceKm != null) {
    if (distanceKm <= 5) {
      total += 20;
      reasons.push(`Very close (${distanceKm.toFixed(1)} km)`);
    } else if (distanceKm <= 15) {
      total += 15;
      reasons.push(`Nearby (${distanceKm.toFixed(1)} km)`);
    } else if (distanceKm <= 30) {
      total += 10;
    } else {
      total += 5;
    }
  } else if (isOnline) {
    total += 15;
    reasons.push("Available online");
  } else {
    total += 10;
  }

  // 15% Experience Matching
  const expYears = trainer.experience_years ?? 0;
  const prefExp = client.preferred_experience; // beginner, intermediate, advanced, any
  
  let expScore = 0;
  if (!prefExp || prefExp === "any") {
    expScore = 0.7; // Base
  } else if (prefExp === "beginner") {
    // Beginners match best with 2-5 years or trainers explicitly marked for beginners (if we had that field)
    if (expYears >= 2 && expYears <= 8) expScore = 1.0;
    else if (expYears > 8) expScore = 0.8;
    else expScore = 0.5;
  } else if (prefExp === "intermediate") {
    if (expYears >= 5) expScore = 1.0;
    else expScore = 0.6;
  } else if (prefExp === "advanced") {
    if (expYears >= 10) expScore = 1.0;
    else if (expYears >= 5) expScore = 0.7;
    else expScore = 0.4;
  }
  
  if (expScore >= 0.9) reasons.push("Experience level matches your needs");
  total += expScore * 15;

  // 15% Budget Relevance
  if (client.budget_max != null) {
    const budgetRange = client.budget_max - (client.budget_min ?? 0);
    if (price <= client.budget_max && price >= (client.budget_min ?? 0)) {
      total += 15;
      reasons.push("Perfectly within your budget");
    } else {
      total += 10;
    }
  } else {
    total += 10;
  }

  // 10% Rating (Quality over Specialty Count)
  const rating = trainer.rating ?? 0;
  if (rating >= 4.8) {
    total += 10;
    reasons.push("Exceptional rating");
  } else if (rating >= 4.5) {
    total += 8;
    reasons.push("Highly rated");
  } else if (rating >= 4.0) {
    total += 6;
  } else {
    total += 3;
  }

  // 10% Gender & Availability assumed overlap for now
  if (
    client.preferred_trainer_gender &&
    trainer.profile.gender === client.preferred_trainer_gender
  ) {
    total += 5;
    reasons.push("Matches gender preference");
  } else {
    total += 3;
  }
  total += 5; // Availability placeholder

  const score = Math.min(100, Math.round(total));
  const badges: string[] = [];
  if (score >= 90) badges.push("Perfect Match");
  else if (score >= 80) badges.push("Best Match");
  
  if (distanceKm != null && distanceKm <= 3) badges.push("Closest");
  if (isOnline) badges.push("Online");
  if (expYears >= 10) badges.push("Veteran Coach");

  return { score, distanceKm, reasons, badges };
}
