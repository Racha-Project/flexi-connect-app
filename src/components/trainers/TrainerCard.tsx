import { Link } from "@tanstack/react-router";
import { MapPin, Star, Sparkles, DollarSign } from "lucide-react";
import type { MatchResult } from "@/lib/matching";

export interface TrainerCardData {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[] | null;
  experience_years: number | null;
  price_per_session: number | null;
  rating: number | null;
  gym_name: string | null;
}

export function TrainerCard({
  trainer,
  match,
}: {
  trainer: TrainerCardData;
  match?: MatchResult;
}) {
  return (
    <Link
      to="/client/trainer/$id"
      params={{ id: trainer.user_id }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50 hover:glow-lime"
    >
      {match && match.badges.length > 0 && (
        <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-1">
          {match.badges.map((b) => (
            <span
              key={b}
              className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground"
            >
              {b}
            </span>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-elevated">
        {trainer.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trainer.avatar_url}
            alt={trainer.full_name ?? "Trainer"}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-5xl font-bold text-primary/40">
            {trainer.full_name?.[0]?.toUpperCase() ?? "T"}
          </div>
        )}
        {match && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-bold backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            {match.score}% match
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight">
            {trainer.full_name ?? "Trainer"}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-semibold">
              {trainer.rating?.toFixed(1) ?? "—"}
            </span>
          </div>
        </div>
        {trainer.gym_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {trainer.gym_name}
            {match?.distanceKm != null && (
              <span> · {match.distanceKm.toFixed(1)} km</span>
            )}
          </div>
        )}
        {trainer.specialties && trainer.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {trainer.specialties.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="text-xs text-muted-foreground">per session</div>
            <div className="flex items-center font-display text-xl font-bold text-primary">
              <DollarSign className="h-4 w-4" />
              {trainer.price_per_session ?? 0}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {trainer.experience_years ?? 0} yrs exp
          </div>
        </div>
      </div>
    </Link>
  );
}
