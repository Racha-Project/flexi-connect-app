import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  component: An,
});

function An() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data: b } = await supabase.from("bookings").select("booking_status");
      const counts: Record<string, number> = {};
      (b ?? []).forEach((x) => { counts[x.booking_status] = (counts[x.booking_status] ?? 0) + 1; });
      return Object.entries(counts).map(([status, count]) => ({ status, count }));
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold">Analytics</h1>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Bookings by status</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
              <XAxis dataKey="status" stroke="oklch(0.7 0 0)" />
              <YAxis stroke="oklch(0.7 0 0)" />
              <Tooltip contentStyle={{ background: "oklch(0.2 0 0)", border: "1px solid oklch(0.3 0 0)" }} />
              <Bar dataKey="count" fill="oklch(0.92 0.22 119)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
