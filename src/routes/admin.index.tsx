import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, ShoppingBag, Mail, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const counts = useQuery({
    queryKey: ["admin_counts"],
    queryFn: async () => {
      const tables = ["portfolio_projects", "digital_products", "contact_messages", "hiring_requests"] as const;
      const results = await Promise.all(tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true })));
      return Object.fromEntries(tables.map((t, i) => [t, results[i].count ?? 0]));
    },
  });

  const cards = [
    { label: "Projects", value: counts.data?.portfolio_projects ?? 0, icon: Briefcase },
    { label: "Products", value: counts.data?.digital_products ?? 0, icon: ShoppingBag },
    { label: "Messages", value: counts.data?.contact_messages ?? 0, icon: Mail },
    { label: "Hiring", value: counts.data?.hiring_requests ?? 0, icon: MessageSquare },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">Quick snapshot of your site.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-2xl p-5">
            <c.icon className="h-5 w-5 text-primary" />
            <div className="mt-4 text-3xl font-semibold">{c.value}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
