import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowUpRight, ShoppingBag, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Lacha digital products" },
      { name: "description", content: "Premium assets for designers and developers." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products_all"],
    queryFn: async () => (await supabase.from("digital_products").select("*").eq("status", "active").order("created_at", { ascending: false })).data ?? [],
  });

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))], [products]);
  const filtered = products.filter((p) =>
    (cat === "All" || p.category === cat) &&
    (q === "" || p.title.toLowerCase().includes(q.toLowerCase())),
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
            <ShoppingBag size={14} />
            Digital Shop
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display mt-2 text-balance text-5xl font-bold tracking-tight md:text-7xl"
          >
            Premium <span className="text-primary italic">assets</span> for builders.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-muted-foreground text-lg"
          >
            Templates, tools, and assets crafted with the same care as my client work. Level up your workflow.
          </motion.p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-border bg-surface/40 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 mr-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                <Filter size={14} /> Category:
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
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100, delay: i * 0.05 }}
                  whileHover={{ y: -8 }}
                >
                  <Link
                    to="/shop/$slug"
                    params={{ slug: p.slug }}
                    className="group relative block overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-card transition-all hover:border-primary/50 hover:shadow-glow-sm"
                  >
                    {p.thumbnail && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{p.category}</div>
                        {p.discount_price && (
                          <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">Sale</div>
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between gap-4">
                        <h3 className="font-display text-2xl font-bold group-hover:text-primary transition-colors">{p.title}</h3>
                        <div className="text-right shrink-0">
                          {p.discount_price ? (
                            <>
                              <div className="text-xl font-black text-primary italic">${Number(p.discount_price).toFixed(0)}</div>
                              <div className="text-[10px] text-muted-foreground line-through decoration-primary/40">${Number(p.price).toFixed(0)}</div>
                            </>
                          ) : (
                            <div className="text-xl font-black italic">${Number(p.price).toFixed(0)}</div>
                          )}
                        </div>
                      </div>
                      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{p.description}</p>
                    </div>
                    <div className="absolute right-6 top-6 rounded-full bg-white/10 p-3 backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
