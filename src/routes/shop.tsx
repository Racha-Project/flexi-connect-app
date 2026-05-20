import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Atelier digital products" },
      { name: "description", content: "Templates, icon sets, and starter kits crafted for designers and builders." },
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
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Shop</div>
          <h1 className="font-display mt-2 text-balance text-5xl font-bold tracking-tight md:text-7xl">Digital products</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">Templates, tools, and assets crafted with the same care as my client work.</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full rounded-full border border-border bg-surface/60 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60"}`}>{c}</button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-surface" />)}
            {!isLoading && filtered.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">No products yet.</div>
            )}
            {filtered.map((p) => (
              <Link key={p.id} to="/shop/$slug" params={{ slug: p.slug }} className="group glass overflow-hidden rounded-3xl transition-colors hover:border-primary/40">
                {p.thumbnail && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</div>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                    <div className="text-right">
                      {p.discount_price ? (
                        <>
                          <div className="text-sm font-semibold text-primary">${Number(p.discount_price).toFixed(0)}</div>
                          <div className="text-xs text-muted-foreground line-through">${Number(p.price).toFixed(0)}</div>
                        </>
                      ) : (
                        <div className="text-sm font-semibold">${Number(p.price).toFixed(0)}</div>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
