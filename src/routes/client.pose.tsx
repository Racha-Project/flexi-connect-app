import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Square, CheckCircle2, Upload, FileVideo,
  Cpu, Target, RotateCcw, Loader2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Pose, Results } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { RepCounter, ExerciseType } from "@/lib/mediapipe-pose-core";

export const Route = createFileRoute("/client/pose")({
  component: () => (
    <RoleGuard role="client">
      <PoseAnalyzer />
    </RoleGuard>
  ),
});

// ─── Constants ────────────────────────────────────────────────────────────────

const EXERCISES: ExerciseType[] = [
  "Squat", "Push-up", "Plank", "Jumping Jacks", "Sit-up", "Pull-up"
];

// ─── Component ────────────────────────────────────────────────────────────────

type LoadState = "idle" | "loading" | "ready" | "error";

function PoseAnalyzer() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // model state
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [loadMsg,   setLoadMsg]   = useState("");
  const poseRef          = useRef<Pose | null>(null);
  const analyzingRef     = useRef(false);

  // session state
  const [videoSrc,   setVideoSrc]   = useState<string | null>(null);
  const [analyzing,  setAnalyzing]  = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>("Squat");
  const [feedback,   setFeedback]   = useState("Ready to start");
  const [repCount,   setRepCount]   = useState(0);
  const [latency,    setLatency]    = useState(0);
  const [frameCount, setFrameCount] = useState(0);

  const videoRef       = useRef<HTMLVideoElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const repCounterRef  = useRef(new RepCounter());
  const requestRef     = useRef<number>();
  const feedbackTimeoutRef = useRef<NodeJS.Timeout>();

  // ── Load MediaPipe Pose ──────────────────────────────────────────────────────
  const loadModels = useCallback(async () => {
    setLoadState("loading");
    setLoadMsg("Initializing MediaPipe Pose...");
    try {
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);
      poseRef.current = pose;
      
      setLoadState("ready");
      setLoadMsg("MediaPipe Pose Ready ✅");
      toast.success("MediaPipe Pose loaded successfully!");
    } catch (err: any) {
      setLoadState("error");
      setLoadMsg(err.message);
      toast.error("Failed to load MediaPipe Pose: " + err.message);
    }
  }, []);

  const onResults = useCallback((results: Results) => {
    const canvasCtx = canvasRef.current?.getContext("2d");
    if (!canvasCtx || !canvasRef.current) return;

    const t0 = performance.now();
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.poseLandmarks) {
      // Draw skeleton
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#d4ff3a",
        lineWidth: 4,
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "#ffffff",
        lineWidth: 2,
        radius: 4,
      });

      // Update Exercise Logic
      const { count, feedback: fb } = repCounterRef.current.update(selectedExercise, results.poseLandmarks);
      setRepCount(count);
      
      if (fb && fb !== "") {
        setFeedback(fb);
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedback(prev => (prev === fb ? "Keep it up!" : prev));
        }, 2500);
      }
    }

    canvasCtx.restore();
    setLatency(Math.round(performance.now() - t0));
    setFrameCount(f => f + 1);
  }, [selectedExercise]);

  const processVideo = useCallback(async () => {
    if (!videoRef.current || !poseRef.current || !analyzingRef.current) return;
    
    if (videoRef.current.paused || videoRef.current.ended) return;

    await poseRef.current.send({ image: videoRef.current });
    requestRef.current = requestAnimationFrame(processVideo);
  }, []);

  // ── Start / Stop ─────────────────────────────────────────────────────────────
  const startAnalysis = async () => {
    if (!videoRef.current || !videoSrc || loadState !== "ready") return;
    
    repCounterRef.current.reset();
    setRepCount(0);
    setFrameCount(0);
    setFeedback("Starting analysis...");

    const vid = videoRef.current;
    const cvs = canvasRef.current;
    if (cvs && vid.videoWidth && vid.videoHeight) {
      cvs.width = vid.videoWidth;
      cvs.height = vid.videoHeight;
    }

    vid.currentTime = 0;
    await vid.play();
    analyzingRef.current = true;
    setAnalyzing(true);
    processVideo();
  };

  const stopAnalysis = useCallback(async () => {
    analyzingRef.current = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    videoRef.current?.pause();
    setAnalyzing(false);

    if (user) {
      const { error } = await supabase.from("pose_sessions").insert({
        client_id:      user.id,
        exercise_name:  selectedExercise,
        accuracy_score: 100, // Placeholder
        feedback_json: {
          engine: "mediapipe-pose",
          reps: repCounterRef.current.count,
        },
      });
      if (!error)
        toast.success(`Session saved: ${repCounterRef.current.count} ${selectedExercise} reps`);
      qc.invalidateQueries({ queryKey: ["pose-history"] });
    }
  }, [selectedExercise, user, qc]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setVideoSrc(URL.createObjectURL(file));
    setRepCount(0);
    setFeedback("Video loaded. Select exercise and start.");
  };

  useEffect(() => () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    analyzingRef.current = false;
  }, [videoSrc]);

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
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
          <Cpu className="h-3 w-3" /> MediaPipe Pose Engine
        </div>
        <h1 className="mt-1 font-display text-4xl font-bold">AI Pose Analysis</h1>
        <p className="mt-2 text-muted-foreground">
          Real-time exercise tracking using MediaPipe. Select your exercise and start.
        </p>
      </div>

      {/* Model loader banner */}
      {loadState !== "ready" && (
        <div className={cn(
          "rounded-xl border p-4 flex items-center justify-between",
          loadState === "error"   ? "border-destructive/50 bg-destructive/5" :
          loadState === "loading" ? "border-primary/30 bg-primary/5" :
          "border-border bg-card",
        )}>
          <div className="flex items-center gap-3">
            {loadState === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : loadState === "error" ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <Cpu className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <div className="font-semibold text-sm">
                {loadState === "idle"    && "MediaPipe Pose not loaded"}
                {loadState === "loading" && "Loading MediaPipe Pose..."}
                {loadState === "error"   && "Failed to load MediaPipe"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{loadMsg}</div>
            </div>
          </div>
          {(loadState === "idle" || loadState === "error") && (
            <button
              onClick={loadModels}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              Load Engine
            </button>
          )}
        </div>
      )}

      {/* Exercise Selection */}
      <div className="flex flex-wrap gap-2">
        {EXERCISES.map(ex => (
          <button
            key={ex}
            onClick={() => setSelectedExercise(ex)}
            disabled={analyzing}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all border",
              selectedExercise === ex 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Video panel */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="relative flex aspect-video items-center justify-center bg-black">
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                muted
                preload="auto"
                className="h-full w-full object-contain"
                onEnded={stopAnalysis}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 p-12 text-center">
                <div className="rounded-full bg-surface-elevated p-6">
                  <FileVideo className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white">Upload Exercise Video</h3>
                <label className="cursor-pointer rounded-md bg-primary px-6 py-2.5 font-bold text-primary-foreground">
                  <Upload className="mr-2 inline h-4 w-4" /> Select Video
                  <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
                </label>
              </div>
            )}

            {/* Overlay canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full object-contain pointer-events-none"
              style={{ opacity: analyzing ? 1 : 0.5 }}
            />

            {/* HUD */}
            {analyzing && (
              <>
                <div className="absolute left-4 top-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold text-primary-foreground">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    MEDIAPIPE LIVE
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-mono text-white backdrop-blur">
                    <Target className="h-3 w-3" /> {latency}ms · f{frameCount}
                  </div>
                </div>

                <div className="absolute right-4 top-4 rounded-lg bg-background/90 px-4 py-2 text-center backdrop-blur border border-primary/20">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Exercise</div>
                  <div className="font-display text-xl font-bold text-primary">{selectedExercise}</div>
                </div>

                <div className="absolute left-4 bottom-16 rounded-lg bg-background/90 px-4 py-2 text-center backdrop-blur border border-primary/20">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Reps</div>
                  <div className="font-display text-3xl font-bold text-primary">{repCount}</div>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-background/90 px-5 py-2 backdrop-blur border border-primary/10 text-center max-w-[80%] animate-in fade-in zoom-in duration-300">
                  <div key={feedback} className="text-sm font-bold text-primary">{feedback}</div>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              {videoSrc && !analyzing && (
                <label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-bold hover:bg-surface-elevated transition">
                  <RotateCcw className="mr-1 inline h-3 w-3" /> Change Video
                  <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
                </label>
              )}
            </div>
            {analyzing ? (
              <button
                onClick={stopAnalysis}
                className="flex items-center gap-2 rounded-md bg-destructive px-5 py-2.5 font-bold text-destructive-foreground"
              >
                <Square className="h-4 w-4" /> Stop & Save
              </button>
            ) : (
              <button
                onClick={startAnalysis}
                disabled={!videoSrc || loadState !== "ready"}
                className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-bold text-primary-foreground disabled:opacity-40"
              >
                {loadState === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {loadState === "loading" ? "Loading..." : "Start Analysis"}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Live Stats</div>
            <Row label="Exercise"     value={selectedExercise} />
            <Row label="Reps"          value={String(repCount)} />
            <Row label="Latency"       value={`${latency} ms`} mono />
            <Row label="Status"        value={analyzing ? "Analyzing" : "Idle"} valueClass={analyzing ? "text-green-500" : ""} />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">History</div>
            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                    <div>
                      <div className="text-sm font-bold">{h.exercise_name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(h.created_at).toLocaleDateString("th-TH")}
                        {h.feedback_json?.reps != null && ` · ${h.feedback_json.reps} reps`}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-primary">{h.accuracy_score}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground italic">No history found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass, mono }: {
  label: string; value: string; valueClass?: string; mono?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-bold", mono && "font-mono text-xs", valueClass)}>{value}</span>
    </div>
  );
}
