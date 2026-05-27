import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, Filter, MessageSquare, Calendar, User } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { PreviewModal } from "@/components/PreviewModal";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Lacha" },
      { name: "description", content: "Thoughts on design, code, and digital products." },
    ],
  }),
  component: BlogPage,
});

// Mock blog data since we don't have a table yet
const mockBlogs = [
  {
    id: "1",
    title: "The Future of Glassmorphism in 2026",
    description: "Why soft blur and frosted textures are making a huge comeback in modern web interfaces.",
    category: "Design",
    date: "May 20, 2026",
    author: "Lacha",
    slug: "future-of-glassmorphism",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Building Playful UIs with Framer Motion",
    description: "How to add personality and joy to your React apps using physics-based animations.",
    category: "Engineering",
    date: "May 15, 2026",
    author: "Lacha",
    slug: "playful-uis-framer-motion",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Why I Switched to Drizzle ORM",
    description: "A deep dive into why Drizzle is the best choice for type-safe SQL in 2026.",
    category: "Tech Stack",
    date: "May 10, 2026",
    author: "Lacha",
    slug: "why-drizzle-orm",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
  }
];

function BlogPage() {
  const [q, setQ] = useState("");
  const [previewData, setPreviewData] = useState<any>(null);

  const filtered = mockBlogs.filter((b) =>
    q === "" || b.title.toLowerCase().includes(q.toLowerCase()) || b.description.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PublicLayout>
      <section className="px-6 pb-12 pt-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2"
          >
            <MessageSquare size={14} className="animate-pulse" />
            The Journal
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display mt-2 text-balance text-5xl font-black tracking-tight md:text-7xl lg:text-8xl italic"
          >
            Notes from the <span className="text-primary not-italic">workshop.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-muted-foreground text-lg font-medium"
          >
            Thoughts on design, engineering, and the process of building digital products.
          </motion.p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-2xl border border-border/40 bg-surface/40 py-4 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => setPreviewData({ ...b, type: "blog" })}
                className="group cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden rounded-[2.5rem] border-2 border-border/40 bg-surface shadow-card transition-all group-hover:border-primary/50 group-hover:shadow-glow-sm">
                  {b.thumbnail && (
                    <img
                      src={b.thumbnail}
                      alt={b.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute right-6 top-6 rounded-full bg-white/10 p-3 backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 group-hover:rotate-12 group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-6 px-2">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    <span>{b.category}</span>
                    <span className="h-1 w-1 rounded-full bg-primary/30" />
                    <span className="text-muted-foreground">{b.date}</span>
                  </div>
                  <h3 className="font-display mt-3 text-2xl font-black italic group-hover:text-primary transition-colors">
                    {b.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground font-medium leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PreviewModal
        isOpen={!!previewData}
        onClose={() => setPreviewData(null)}
        data={previewData}
      />
    </PublicLayout>
  );
}
