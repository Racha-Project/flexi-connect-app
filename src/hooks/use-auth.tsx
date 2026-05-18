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
  const [role, setRole] = useState<AppRole | null>(() => {
    // Try to recover role from localStorage for instant UI responsiveness
    if (typeof window !== "undefined") {
      return localStorage.getItem("fitder_role") as AppRole | null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  const loadRole = async (uid: string) => {
    if (!uid) return;
    
    setRoleLoading(true);
    console.log("Auth Provider: Fetching role for:", uid);

    // Hard timeout for the role fetch to prevent hanging the whole app
    const rolePromise = supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .order("role", { ascending: true })
      .limit(1);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Role fetch timeout")), 4000)
    );

    try {
      const result = await Promise.race([rolePromise, timeoutPromise]) as any;
      
      if (result.error) throw result.error;
      
      const userRole = (result.data?.[0]?.role as AppRole) || "client";
      console.log("Auth Provider: Role identified as:", userRole);
      
      setRole(userRole);
      localStorage.setItem("fitder_role", userRole);
    } catch (err) {
      console.error("Auth Provider: Error loading role, staying with current or client:", err);
      if (!role) {
        setRole("client");
        localStorage.setItem("fitder_role", "client");
      }
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety fallback: Force loading to false after 6 seconds no matter what
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth Provider: GLOBAL safety fallback triggered");
        setLoading(false);
      }
    }, 6000);

    const initAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setSession(s);
        setUser(s?.user ?? null);
        
        if (s?.user) {
          // We don't strictly await loadRole here if it might hang
          // but we want it to finish before loading is false if possible
          await Promise.race([
            loadRole(s.user.id),
            new Promise(res => setTimeout(res, 3500))
          ]);
        }
      } catch (err) {
        console.error("Auth Provider: Init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (evt, s) => {
      console.log("Auth Provider: Auth state change:", evt);
      if (!mounted) return;
      
      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user && (evt === "SIGNED_IN" || evt === "TOKEN_REFRESHED")) {
        // Run role load in background or with timeout
        loadRole(s.user.id);
      } else if (evt === "SIGNED_OUT") {
        setRole(null);
        localStorage.removeItem("fitder_role");
      }
      
      // Ensure loading is false after a short delay to allow state updates
      setTimeout(() => {
        if (mounted) setLoading(false);
      }, 500);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
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
          console.log("Auth Provider: Starting sign out...");
          try {
            // 1. Clear local storage first to prevent any persisted auth issues
            localStorage.clear();
            sessionStorage.clear();

            // 2. Attempt Supabase sign out with a very short timeout
            // If it takes too long, we just move on to local clearance
            const signOutPromise = supabase.auth.signOut();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Sign out timeout")), 1500)
            );

            await Promise.race([signOutPromise, timeoutPromise]).catch(err => {
              console.warn("Auth Provider: Supabase sign out deferred or timed out:", err);
            });
          } catch (err) {
            console.error("Auth Provider: Error during sign out process:", err);
          } finally {
            // 3. Guaranteed state clearance
            setSession(null);
            setUser(null);
            setRole(null);
            localStorage.removeItem("fitder_role");
            console.log("Auth Provider: Sign out state cleared locally.");
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
