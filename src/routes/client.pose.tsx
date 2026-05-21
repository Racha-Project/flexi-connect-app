import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Activity, Camera, Play, Square, Loader2, CheckCircle2, AlertCircle, Upload, FileVideo, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Pose as MPPose, POSE_CONNECTIONS, Results } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export const Route = createFileRoute("/client/pose")({
  component: () => (
    <RoleGuard role="client">
      <Pose />
    </RoleGuard>
  ),
});

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
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [feedback, setFeedback] = useState<string>("Upload a video to start analysis");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<MPPose | null>(null);
  const requestRef = useRef<number>();

  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
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
        const currentScore = Math.round(progress);
        setScore(currentScore);
        setMaxScore(prev => Math.max(prev, currentScore));

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setScore(0);
      setMaxScore(0);
      setFeedback("Video loaded. Press start analysis.");
      setIsCorrect(null);
    }
  };

  const processFrame = async () => {
    if (videoRef.current && poseRef.current && analyzing) {
      if (!videoRef.current.paused && !videoRef.current.ended) {
        await poseRef.current.send({ image: videoRef.current });
      }
      requestRef.current = requestAnimationFrame(processFrame);
    }
  };

  const startAnalysis = async () => {
    if (!videoRef.current || !videoSrc) return;

    try {
      setAnalyzing(true);
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

      videoRef.current.currentTime = 0;
      await videoRef.current.play();
      
      setFeedback("Analyzing posture...");
      requestRef.current = requestAnimationFrame(processFrame);

    } catch (err: any) {
      toast.error("AI Error: " + err.message);
      stopAnalysis();
    }
  };

  const stopAnalysis = async () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
    
    setAnalyzing(false);
    setRunning(false);
    setIsCorrect(null);

    if (maxScore > 0 && user) {
      const { error } = await supabase.from("pose_sessions").insert({
        client_id: user.id,
        exercise_name: exercise.name,
        accuracy_score: maxScore,
        feedback_json: { last: feedback, exercise_id: exercise.id },
      });
      if (!error) toast.success(`Analysis saved · ${maxScore}% max accuracy`);
      qc.invalidateQueries({ queryKey: ["pose-history"] });
    }
  };

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
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
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
          <Activity className="h-3 w-3" /> AI Posture Module
        </div>
        <h1 className="mt-1 font-display text-4xl font-bold">Train with video analysis</h1>
        <p className="mt-2 text-muted-foreground">Upload your workout video and let AI analyze your form.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="relative flex aspect-video items-center justify-center bg-black">
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                muted
                className="h-full w-full object-contain"
                onEnded={stopAnalysis}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-surface-elevated p-6 mb-4">
                  <FileVideo className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white">No video selected</h3>
                <p className="mt-2 text-sm text-white/50">Upload a video of yourself performing the exercise</p>
                <label className="mt-6 cursor-pointer rounded-md bg-primary px-6 py-2.5 font-display font-bold text-primary-foreground transition hover:opacity-90">
                  <Upload className="mr-2 inline-block h-4 w-4" /> Upload Video
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              className={cn(
                "absolute inset-0 h-full w-full pointer-events-none",
                !analyzing && "hidden"
              )}
              width={1280}
              height={720}
            />
            
            {analyzing && (
              <>
                {/* AI Status Indicators */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-full bg-destructive/90 px-3 py-1 text-xs font-bold text-destructive-foreground">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-destructive-foreground" /> AI ANALYZING VIDEO
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
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Max Accuracy</div>
                  <div className="font-display text-3xl font-bold text-primary">{maxScore}%</div>
                </div>

                <div className="absolute bottom-6 left-1/2 max-w-md -translate-x-1/2 rounded-lg bg-background/90 px-4 py-2 text-center backdrop-blur">
                  <div className="text-sm font-semibold text-primary">{feedback}</div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Exercise</div>
                <div className="font-display text-2xl font-bold">{exercise.name}</div>
              </div>
              {videoSrc && !analyzing && (
                <label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-bold hover:bg-surface-elevated transition">
                  Change Video
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                </label>
              )}
            </div>
            {analyzing ? (
              <button onClick={stopAnalysis} className="flex items-center gap-2 rounded-md bg-destructive px-5 py-2.5 font-display font-bold text-destructive-foreground">
                <Square className="h-4 w-4" /> Stop & save
              </button>
            ) : (
              <button 
                onClick={startAnalysis} 
                disabled={!videoSrc}
                className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" /> Start analysis
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
                  onClick={() => setExercise(e)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg p-3 text-sm font-medium transition",
                    exercise.id === e.id 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-surface-elevated text-foreground"
                  )}
                >
                  {e.name}
                  {exercise.id === e.id && <Activity className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">History</div>
            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                    <div>
                      <div className="text-sm font-bold">{h.exercise_name}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm font-bold text-primary">{h.accuracy_score}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground italic">No sessions yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      {text}
    </div>
  );
}

