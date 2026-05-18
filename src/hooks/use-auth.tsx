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
    if (!uid) return;
    
    setRoleLoading(true);
    console.log("Auth Provider: FETCHING ROLE FROM DB ONLY for:", uid);

    // Hard timeout of 5 seconds for role fetch
    const timeout = setTimeout(() => {
      console.warn("Auth Provider: Role fetch timeout, defaulting to client");
      setRole("client");
      setRoleLoading(false);
    }, 5000);

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .order("role", { ascending: true }) // admin < client < trainer
        .limit(1);
      
      clearTimeout(timeout);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.warn("Auth Provider: No role found in DB for user:", uid);
        setRole("client"); // Default to client if DB record is missing
      } else {
        const userRole = data[0].role as AppRole;
        console.log("Auth Provider: Role fetched from DB:", userRole);
        setRole(userRole);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.error("Auth Provider: Error fetching role from DB:", err);
      setRole("client");
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
        console.error("Auth Provider: Init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (evt, s) => {
      console.log("Auth Provider: Auth state change (Strict DB mode):", evt);
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
          } finally {
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
