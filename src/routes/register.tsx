import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Dumbbell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up — Fitder" }] }),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const { user, role: userRole, loading: authLoading, roleLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"client" | "trainer">("client");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ONLY redirect once the user is created AND the role is confirmed in the DB
    if (!authLoading && !roleLoading && user && userRole) {
      console.log("Register: Strict redirect to:", `/${userRole}/dashboard`);
      nav({ to: `/${userRole}/dashboard` as never });
    }
  }, [user, userRole, authLoading, roleLoading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName, role },
        },
      });

      if (error) {
        toast.error(error.message);
        setIsSubmitting(false);
      } else {
        toast.success("Account created — waiting for database sync…");
        // Success is handled by the useEffect above
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || authLoading;
  const showSpinner = isSubmitting || (user && roleLoading);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Fitder</span>
        </Link>
        <h1 className="font-display text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join the Fitder community.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
          {(["client", "trainer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-md py-2 text-sm font-semibold capitalize transition",
                role === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              I'm a {r}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Full name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isButtonDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-display font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {showSpinner && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
