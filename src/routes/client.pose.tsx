import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { Activity, Camera, Play, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

import { useState, useRef, useEffect, useCallback } from "react";
import { Activity, Camera, Play, Square, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Pose as MPPose, POSE_CONNECTIONS, Results } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera as MPCamera } from "@mediapipe/camera_utils";

const EXERCISES = [
  { 
    id: "squat", 
    name: "Squat", 
    targetAngle: 90, 
    joints: [24, 26, 28], // Right Hip, Knee, Ankle
    feedback: ["Lower your hips", "Keep your back straight", "Drive through your heels"] 
  },
  { 
    id: "bicep_curl", 
    name: "Bicep Curl", 
    targetAngle: 45, 
    joints: [12, 14, 16], // Right Shoulder, Elbow, Wrist
    feedback: ["Control the descent", "Don't swing your back", "Full range of motion"] 
  },
  { 
    id: "pushup", 
    name: "Push-up", 
    targetAngle: 80, 
    joints: [12, 14, 16], 
    feedback: ["Engage your core", "Lower chest to ground", "Keep elbows close"] 
  },
];

// Helper to calculate angle between 3 points
function calculateAngle(a: any, b: any, c: any) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

function Pose() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [exercise, setExercise] = useState(EXERCISES[0]);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>("Ready to start?");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<MPPose | null>(null);
  const cameraRef = useRef<MPCamera | null>(null);

  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw the video frame to canvas (optional, we use video as bg)
    // canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.poseLandmarks) {
      // Draw Skeleton
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#d4ff3a",
        lineWidth: 4,
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "#ffffff",
        lineWidth: 1,
        radius: 3,
      });

      // Validation Logic
      const landmarks = results.poseLandmarks;
      const [p1, p2, p3] = exercise.joints;
      
      if (landmarks[p1] && landmarks[p2] && landmarks[p3]) {
        const angle = calculateAngle(landmarks[p1], landmarks[p2], landmarks[p3]);
        
        // Simulating progress based on angle
        const progress = Math.max(0, Math.min(100, (180 - angle) / (180 - exercise.targetAngle) * 100));
        setScore(Math.round(progress));

        if (progress > 85) {
          setIsCorrect(true);
          setFeedback("Excellent form! Keep it up.");
        } else if (progress > 40) {
          setIsCorrect(null);
          setFeedback("Keep going... deeper!");
        } else {
          setIsCorrect(false);
          setFeedback(exercise.feedback[0]);
        }
      }
    }
    canvasCtx.restore();
  }, [exercise]);

  const start = async () => {
    if (!videoRef.current) return;

    try {
      setRunning(true);
      setFeedback("Initializing AI...");

      // Initialize MediaPipe Pose
      poseRef.current = new MPPose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseRef.current.onResults(onResults);

      // Initialize Camera
      cameraRef.current = new MPCamera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });

      await cameraRef.current.start();
      setFeedback("Get into position!");
    } catch (err: any) {
      toast.error("AI Error: " + err.message);
      stop();
    }
  };

  const stop = async () => {
    if (cameraRef.current) {
      await cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
    
    setRunning(false);
    setIsCorrect(null);

    if (score > 0 && user) {
      const { error } = await supabase.from("pose_sessions").insert({
        client_id: user.id,
        exercise_name: exercise.name,
        accuracy_score: score,
        feedback_json: { last: feedback },
      });
      if (!error) toast.success(`Session saved · ${score}% max accuracy`);
      qc.invalidateQueries({ queryKey: ["pose-history"] });
    }
  };

  useEffect(() => {
    return () => {
      if (running) stop();
    };
  }, [running]);

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
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "h-full w-full object-cover",
                !running && "hidden"
              )}
            />
            
            <canvas
              ref={canvasRef}
              className={cn(
                "absolute inset-0 h-full w-full",
                !running && "hidden"
              )}
              width={1280}
              height={720}
            />
            
            {!running && (
              <>
                <Camera className="h-16 w-16 text-muted-foreground/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="text-xs uppercase tracking-widest text-white">AI Pose Tracking</div>
                  <div className="mt-2 text-sm text-white/70">Select exercise and press start</div>
                </div>
              </>
            )}

            {running && (
              <>
                {/* AI Status Indicators */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-full bg-destructive/90 px-3 py-1 text-xs font-bold text-destructive-foreground">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-destructive-foreground" /> LIVE AI TRACKING
                  </div>
                  
                  {isCorrect === true && (
                    <div className="flex items-center gap-2 rounded-full bg-success/90 px-3 py-1 text-xs font-bold text-success-foreground animate-in zoom-in">
                      <CheckCircle2 className="h-3 w-3" /> CORRECT FORM
                    </div>
                  )}
                  {isCorrect === false && (
                    <div className="flex items-center gap-2 rounded-full bg-warning/90 px-3 py-1 text-xs font-bold text-warning-foreground animate-in shake">
                      <AlertCircle className="h-3 w-3" /> ADJUST FORM
                    </div>
                  )}
                </div>

                <div className="absolute right-4 top-4 rounded-full bg-background/90 px-4 py-2 text-center backdrop-blur">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Form Accuracy</div>
                  <div className="font-display text-3xl font-bold text-primary">{score}%</div>
                </div>

                <div className="absolute bottom-6 left-1/2 max-w-md -translate-x-1/2 rounded-lg bg-background/90 px-4 py-2 text-center backdrop-blur">
                  <div className="text-sm font-semibold text-primary">{feedback}</div>
                </div>
              </>
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
