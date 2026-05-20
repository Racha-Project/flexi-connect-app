import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Atelier" },
      { name: "description", content: "Selected work across product design, branding, and web." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects_all"],
    queryFn: async () => (await supabase.from("portfolio_projects").select("*").order("order_position")).data ?? [],
  });

  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean) as string[]))], [projects]);
  const filtered = projects.filter((p) =>
    (cat === "All" || p.category === cat) &&
    (q === "" || p.title.toLowerCase().includes(q.toLowerCase()) || p.description?.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <PublicLayout>
      <section className="px-6 pb-12 pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Portfolio</div>
          <h1 className="font-display mt-2 text-balance text-5xl font-bold tracking-tight md:text-7xl">Selected work</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">A few projects I'm proud of, across product, brand and web.</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects…"
                className="w-full rounded-full border border-border bg-surface/60 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-surface" />)}
            {!isLoading && filtered.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">No projects match your search.</div>
            )}
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <Link to="/portfolio/$slug" params={{ slug: p.slug }} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl border border-border shadow-card">
                  {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</div>
                    <h3 className="font-display mt-1 text-2xl font-semibold">{p.title}</h3>
                  </div>
                  <div className="absolute right-4 top-4 rounded-full bg-background/80 p-2 backdrop-blur transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
