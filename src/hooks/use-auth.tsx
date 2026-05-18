import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "client" | "trainer" | "admin";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  roleLoading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  const loadRole = async (uid: string) => {
    setRoleLoading(true);
    console.log("Loading role for user:", uid);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .order("role", { ascending: true }) // Ensure deterministic order if multiple
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      const userRole = (data?.role as AppRole) || "client";
      console.log("Role loaded successfully:", userRole);
      setRole(userRole);
    } catch (err) {
      console.error("Critical: Failed to load role:", err);
      setRole("client"); // Fallback to client to prevent lock-out
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(s);
        setUser(s?.user ?? null);
        
        if (s?.user) {
          await loadRole(s.user.id);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (evt, s) => {
      console.log("Auth state change:", evt, s?.user?.id);
      if (!mounted) return;

      setSession(s);
      setUser(s?.user ?? null);

      if (evt === "SIGNED_IN" || evt === "TOKEN_REFRESHED") {
        if (s?.user) await loadRole(s.user.id);
      } else if (evt === "SIGNED_OUT") {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        role,
        loading,
        roleLoading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
        refreshRole: async () => {
          if (user) await loadRole(user.id);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
