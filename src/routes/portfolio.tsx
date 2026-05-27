import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, Filter, Rocket, Star, Zap, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";
import { Marquee } from "@/components/Marquee";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Lacha" },
      { name: "description", content: "Selected design and engineering projects." },
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs uppercase tracking-widest text-primary font-bold flex items-center gap-2"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Selected Work
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display mt-2 text-balance text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl"
          >
            Stuff I <span className="text-primary italic">actually</span> shipped.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-muted-foreground text-lg"
          >
            A few projects I'm proud of, across product, brand and web. Built with care and attention to detail.
          </motion.p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects by name or description…"
                className="w-full rounded-2xl border border-border bg-surface/40 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 mr-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                <Filter size={14} /> Filter:
              </div>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
                    cat === c
                      ? "border-primary bg-primary text-primary-foreground shadow-glow-sm scale-105"
                      : "border-border bg-surface/40 hover:border-primary/50 hover:bg-surface"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[2.5rem] bg-surface border border-border" />
            ))}
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                    delay: i * 0.05
                  }}
                  whileHover={{ y: -8 }}
                >
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: p.slug }}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-card transition-all hover:border-primary/50 hover:shadow-glow-sm"
                  >
                    {p.thumbnail && (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                          {p.category}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">2026</span>
                      </div>
                      <h3 className="font-display mt-2 text-3xl font-bold text-white group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                    </div>
                    <div className="absolute right-6 top-6 rounded-full bg-white/10 p-3 backdrop-blur-md border border-white/20 transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:rotate-12">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {!isLoading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full rounded-[2.5rem] border-2 border-dashed border-border p-20 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">No matches found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
              <button onClick={() => { setQ(""); setCat("All"); }} className="mt-6 text-sm font-bold text-primary hover:underline">
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Playful Footer Marquee */}
      <div className="mt-20 border-y border-border/50 bg-primary/5 py-8">
        <Marquee speed={40} className="text-2xl font-display font-black uppercase tracking-tighter text-primary/20 italic">
          <div className="flex items-center gap-4 mx-12">
            <Rocket /> Let's Build
          </div>
          <div className="flex items-center gap-4 mx-12">
            <Star /> Something Great
          </div>
          <div className="flex items-center gap-4 mx-12">
            <Zap /> Fast & Finished
          </div>
          <div className="flex items-center gap-4 mx-12">
            <Heart /> With Care
          </div>
        </Marquee>
      </div>
    </PublicLayout>
  );
}
