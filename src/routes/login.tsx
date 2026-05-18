import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Dumbbell, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Fitder" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const { user, role, loading, roleLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !roleLoading && user && role) {
      console.log("Redirecting to dashboard for role:", role);
      nav({ to: `/${role}/dashboard` as never });
    }
  }, [user, role, loading, roleLoading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log("Attempting sign in...");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error.message);
        toast.error(error.message);
        setIsSubmitting(false);
      } else {
        console.log("Sign in successful, waiting for role...");
        toast.success("Welcome back!");
        // Safety timeout: if we don't redirect in 8 seconds, reset button
        setTimeout(() => {
          if (mountedRef.current) setIsSubmitting(false);
        }, 8000);
      }
    } catch (err: any) {
      console.error("Unexpected sign in error:", err);
      toast.error(err.message || "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const isLoading = isSubmitting || loading || (user && roleLoading);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Fitder</span>
        </Link>
        <h1 className="font-display text-3xl font-bold">Welcome to Fitder</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to manage your training.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-display font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
