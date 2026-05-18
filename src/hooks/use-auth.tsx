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
    // If no UID or already loading this UID, skip
    if (!uid) return;
    
    // Check if we're already loading this role to prevent duplicate calls
    if (roleLoading) {
      console.log("Auth Provider: Role already loading, skipping duplicate call.");
      return;
    }
    
    setRoleLoading(true);
    console.log("Auth Provider: Loading role for user:", uid);
    
    // Set a timeout to clear roleLoading if Supabase is slow
    const timeout = setTimeout(() => {
      console.warn("Auth Provider: roleLoading timeout reached");
      setRoleLoading(false);
      if (!role) setRole("client");
    }, 6000);

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .order("role", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      const userRole = (data?.role as AppRole) || "client";
      console.log("Auth Provider: Role loaded successfully:", userRole);
      setRole(userRole);
    } catch (err) {
      console.error("Auth Provider: Critical error loading role:", err);
      setRole("client");
    } finally {
      clearTimeout(timeout);
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety fallback: Force loading to false after 5 seconds no matter what
    const timer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth Provider: Safety fallback triggered (loading forced to false)");
        setLoading(false);
      }
    }, 5000);

    const initAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) await loadRole(s.user.id);
      } catch (err) {
        console.error("Auth Provider: Init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (evt, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user && (evt === "SIGNED_IN" || evt === "TOKEN_REFRESHED")) {
        await loadRole(s.user.id);
      } else if (evt === "SIGNED_OUT") {
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timer);
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
          try {
            await supabase.auth.signOut();
          } catch (err) {
            console.error("Auth Provider: Sign out error:", err);
          } finally {
            // Force clear state even if Supabase sign out fails
            setSession(null);
            setUser(null);
            setRole(null);
          }
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
