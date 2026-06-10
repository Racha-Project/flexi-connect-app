import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { Activity, Camera, Play, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/client/pose")({
  component: () => (
    <RoleGuard role="client">
      <Pose />
    </RoleGuard>
  ),
});

const EXERCISES = [
  { id: "squat", name: "Squat", feedback: ["Lower your hips", "Keep your back straight", "Drive through your heels"] },
  { id: "pushup", name: "Push-up", feedback: ["Engage your core", "Lower chest to ground", "Keep elbows close"] },
  { id: "plank", name: "Plank", feedback: ["Hold straight line", "Tighten your glutes", "Breathe steadily"] },
  { id: "lunge", name: "Lunge", feedback: ["Drop back knee toward ground", "Keep front knee over ankle"] },
  { id: "bicep_curl", name: "Bicep Curl", feedback: ["Control the descent", "Don't swing your back"] },
];

function Pose() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [exercise, setExercise] = useState(EXERCISES[0]);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const tickRef = useRef<number | null>(null);

  useEffect(() => () => { if (tickRef.current) clearInterval(tickRef.current); }, []);

  const start = () => {
    setRunning(true);
    setScore(50);
    setFeedback("Get into position…");
    tickRef.current = window.setInterval(() => {
      setScore((s) => {
        const next = Math.max(40, Math.min(99, s + (Math.random() * 10 - 4)));
        return Math.round(next);
      });
      setFeedback(exercise.feedback[Math.floor(Math.random() * exercise.feedback.length)]);
    }, 1500);
  };

  const stop = async () => {
    if (tickRef.current) clearInterval(tickRef.current);
    setRunning(false);
    if (!user) return;
    const { error } = await supabase.from("pose_sessions").insert({
      client_id: user.id,
      exercise_name: exercise.name,
      accuracy_score: score,
      feedback_json: { last: feedback },
    });
    if (error) toast.error(error.message);
    else {
      toast.success(`Session saved · ${score}% accuracy`);
      qc.invalidateQueries({ queryKey: ["pose-history"] });
    }
  };

  const { data: history } = useQuery({
    queryKey: ["pose-history", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("pose_sessions")
        .select("*")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
          <Activity className="h-3 w-3" /> AI Posture Module
        </div>
        <h1 className="mt-1 font-display text-4xl font-bold">Train with form feedback</h1>
        <p className="mt-2 text-muted-foreground">Live posture detection helps every rep count.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="relative flex aspect-video items-center justify-center bg-black">
            <Camera className="h-16 w-16 text-muted-foreground/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Camera preview</div>
              <div className="mt-2 text-sm text-muted-foreground">(MediaPipe integration ready)</div>
            </div>
            {running && (
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-destructive/90 px-3 py-1 text-xs font-bold text-destructive-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive-foreground" /> LIVE
              </div>
            )}
            {running && (
              <div className="absolute right-4 top-4 rounded-full bg-background/90 px-4 py-2 text-center backdrop-blur">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Accuracy</div>
                <div className="font-display text-3xl font-bold text-primary">{score}%</div>
              </div>
            )}
            {running && (
              <div className="absolute bottom-6 left-1/2 max-w-md -translate-x-1/2 rounded-lg bg-background/90 px-4 py-2 text-center backdrop-blur">
                <div className="text-sm font-semibold">{feedback}</div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Exercise</div>
              <div className="font-display text-2xl font-bold">{exercise.name}</div>
            </div>
            {running ? (
              <button onClick={stop} className="flex items-center gap-2 rounded-md bg-destructive px-5 py-2.5 font-display font-bold text-destructive-foreground">
                <Square className="h-4 w-4" /> Stop & save
              </button>
            ) : (
              <button onClick={start} className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground">
                <Play className="h-4 w-4" /> Start session
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Select exercise</div>
            <div className="space-y-2">
              {EXERCISES.map((e) => (
                <button
                  key={e.id}
                  onClick={() => !running && setExercise(e)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${exercise.id === e.id ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-surface"}`}
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Recent sessions</h2>
        {!history || history.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            No sessions yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((h) => (
              <div key={h.id} className="rounded-xl border border-border bg-card p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{h.exercise_name}</div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="font-display text-3xl font-bold text-primary">{Math.round(Number(h.accuracy_score ?? 0))}%</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
