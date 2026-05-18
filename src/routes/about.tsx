import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LachaFit" },
      { name: "description", content: "Our mission: connect every fitness journey with the right coach." },
      { property: "og:title", content: "About LachaFit" },
      { property: "og:description", content: "Our mission: connect every fitness journey with the right coach." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Dumbbell className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">LachaFit</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-xs uppercase tracking-widest text-primary">About</div>
        <h1 className="mt-3 font-display text-5xl font-bold leading-tight">
          We connect <span className="text-gradient-lime">people</span> to the right coach.
        </h1>
        <div className="mt-8 space-y-6 text-lg text-muted-foreground">
          <p>
            LachaFit is a modern fitness marketplace built on intelligent matching.
            Finding a trainer should not be a guessing game — your goals, budget,
            schedule, and preferences all matter.
          </p>
          <p>
            Our platform scores compatibility across multiple dimensions so you
            see the most relevant coaches first. Trainers get a clean
            scheduling system and predictable bookings. Everyone wins.
          </p>
          <p>
            And when you train, our AI posture module gives real-time form
            feedback so every rep counts.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["Smart", "Compatibility scoring across goals, budget, distance, schedule."],
            ["Fast", "Real-time bookings with double-booking protection."],
            ["Honest", "Verified trainers, transparent reviews, no inflated metrics."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-border bg-card p-6">
              <div className="font-display text-lg font-semibold">{t}</div>
              <div className="mt-2 text-sm text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
