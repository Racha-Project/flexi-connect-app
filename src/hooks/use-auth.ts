import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      qc.invalidateQueries({ queryKey: ["is_admin"] });
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [qc]);

  const isAdminQuery = useQuery({
    queryKey: ["is_admin", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      // First check if any user roles exist
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true });
      
      // If no users exist, the first user is automatically an admin
      if (count === 0) return true;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session!.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  return { 
    session, 
    user: session?.user ?? null, 
    isAdmin: !!isAdminQuery.data, 
    loading: loading || (!!session && isAdminQuery.isLoading) 
  };
}
