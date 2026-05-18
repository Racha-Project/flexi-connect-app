import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/bookings")({
  component: () => <RoleGuard role="admin"><B /></RoleGuard>,
});

function B() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold">All bookings</h1>
      {isLoading ? <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        : <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="px-4 py-3">Status</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Created</th></tr>
            </thead>
            <tbody>
              {(data ?? []).map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-4 py-3"><span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold uppercase text-primary">{b.booking_status}</span></td>
                  <td className="px-4 py-3">${b.total_price}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(b.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </div>
  );
}
