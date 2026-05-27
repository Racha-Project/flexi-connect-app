import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Star, Zap, Rocket, Heart, Globe, Code } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Marquee } from "@/components/Marquee";
import { FloatingElement } from "@/components/FloatingElement";
import { cn } from "@/lib/utils";
import { PreviewModal } from "@/components/PreviewModal";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lacha — Designer & developer for ambitious teams" },
      { name: "description", content: "Crafting modern digital products and experiences." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: settings } = useSiteSettings();
  const [previewData, setPreviewData] = useState<any>(null);
  const { data: projects = [] } = useQuery({
    queryKey: ["featured_projects"],
    queryFn: async () => (await supabase.from("portfolio_projects").select("*").eq("featured", true).order("order_position")).data ?? [],
  });
  const { data: products = [] } = useQuery({
    queryKey: ["featured_products"],
    queryFn: async () => (await supabase.from("digital_products").select("*").eq("featured", true).limit(3)).data ?? [],
  });
  const { data: services = [] } = useQuery({
    queryKey: ["featured_services"],
    queryFn: async () => (await supabase.from("freelance_services").select("*").eq("featured", true).order("order_position")).data ?? [],
  });
  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("*").eq("featured", true).order("order_position")).data ?? [],
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero noise px-6 pb-20 pt-12 playful-decor rounded-[3rem] border border-border/40 shadow-glow-sm">
        {/* Playful Floating SVG Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute top-[10%] left-[5%] text-primary/10 animate-float" width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-[10%] right-[5%] text-secondary/10 animate-float" style={{ animationDelay: "-2s" }} width="150" height="150" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" rx="15" fill="currentColor" />
          </svg>
          <svg className="absolute top-[40%] right-[10%] text-accent/10 animate-float" style={{ animationDelay: "-4s" }} width="80" height="80" viewBox="0 0 100 100">
            <path d="M50 10 L90 90 L10 90 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <FloatingElement className="absolute left-[10%] top-[20%] text-primary/20" delay={0.2} duration={5} distance={20}>
            <Zap size={48} />
          </FloatingElement>
          <FloatingElement className="absolute right-[15%] top-[15%] text-primary/20" delay={1} duration={6} distance={25}>
            <Rocket size={40} />
          </FloatingElement>
          <FloatingElement className="absolute left-[15%] bottom-[20%] text-primary/20" delay={0.5} duration={4} distance={15}>
            <Code size={32} />
          </FloatingElement>
          <FloatingElement className="absolute right-[10%] bottom-[25%] text-primary/20" delay={1.5} duration={5.5} distance={22}>
            <Globe size={44} />
          </FloatingElement>
        </div>

        <div className="relative mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
          >
            <Sparkles className="h-3 w-3 text-primary animate-pulse" /> Available for new projects · Q3 2026
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-[88px]"
          >
            {settings?.hero_title ?? "Designing premium digital products that move people."}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg"
          >
            {settings?.hero_subtitle ?? "Independent designer & developer building portfolios, products and services."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-glow transition-colors">
                Hire me <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/portfolio" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary">
                View work
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Playful Marquee */}
      <div className="border-y border-border/50 bg-surface/30 py-4 backdrop-blur-sm">
        <Marquee speed={30} className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          <div className="flex items-center gap-2 mx-8">
            <Rocket className="h-4 w-4 text-primary" /> 20+ Shipped
          </div>
          <div className="flex items-center gap-2 mx-8">
            <Star className="h-4 w-4 text-primary" /> 5.0 Rating
          </div>
          <div className="flex items-center gap-2 mx-8">
            <Zap className="h-4 w-4 text-primary" /> MVP in 7 Days
          </div>
          <div className="flex items-center gap-2 mx-8">
            <Heart className="h-4 w-4 text-primary" /> Client Loved
          </div>
          <div className="flex items-center gap-2 mx-8">
            <Globe className="h-4 w-4 text-primary" /> Worldwide
          </div>
        </Marquee>
      </div>

      {/* Bento featured work */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Selected work" title="Featured projects" link="/portfolio" />
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2">
            {projects[0] && <BentoProject project={projects[0]} className="md:col-span-4 md:row-span-2 md:aspect-auto aspect-[16/10]" big onPreview={() => setPreviewData({ ...projects[0], type: "project" })} />}
            {projects[1] && <BentoProject project={projects[1]} className="md:col-span-2 aspect-[4/3]" onPreview={() => setPreviewData({ ...projects[1], type: "project" })} />}
            {projects[2] && <BentoProject project={projects[2]} className="md:col-span-2 aspect-[4/3]" onPreview={() => setPreviewData({ ...projects[2], type: "project" })} />}
          </div>
        </div>
      </section>

      {/* Services + Products bento */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="What I offer" title="Services & products" />
          <div className="mt-10 grid gap-4 md:grid-cols-6">
            <motion.div
              whileHover={{ scale: 1.02, rotate: -1 }}
              className="glass-strong relative col-span-full overflow-hidden rounded-3xl p-8 md:col-span-3 border-2 border-primary/20"
            >
              <div className="absolute right-0 top-0 -mr-4 -mt-4 opacity-20 rotate-12 text-primary animate-float">
                <Code size={160} />
              </div>
              <h3 className="font-display text-3xl font-black italic">Freelance services</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground font-medium">Brand identity, product design, and bespoke websites — booked as focused engagements.</p>
              <ul className="mt-8 space-y-4">
                {services.slice(0, 3).map((s) => (
                  <li key={s.id} className="flex items-center justify-between border-b border-border/40 pb-4 text-sm">
                    <span className="font-bold text-lg">{s.title}</span>
                    <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-glow-sm">From ${Number(s.price_start).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <Link to="/services" className="group mt-8 inline-flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest">
                Browse services <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <div className="col-span-full grid gap-4 md:col-span-3 md:grid-cols-1">
              {products.map((p) => (
                <motion.div key={p.id} whileHover={{ x: 12, scale: 1.02 }} transition={{ type: "spring", damping: 12 }}>
                  <Link to="/shop/$slug" params={{ slug: p.slug }} className="glass group relative block overflow-hidden rounded-3xl p-6 border-2 border-secondary/20 hover:border-secondary/50">
                    <div className="flex items-center gap-6">
                      {p.thumbnail && (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                          <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-125" loading="lazy" />
                          <div className="absolute inset-0 bg-secondary/10 group-hover:bg-transparent transition-colors" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1">Digital Asset</div>
                        <div className="font-display text-xl font-bold">{p.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-2xl text-secondary italic">${Number(p.price).toFixed(0)}</div>
                        <div className="mt-2 flex justify-end">
                          <div className="rounded-full bg-secondary text-secondary-foreground p-2 transition-all group-hover:rotate-12 group-hover:scale-110 shadow-glow">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Kind words" title="What clients say" />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-3xl p-6"
                >
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                  <p className="mt-4 text-pretty text-sm leading-relaxed">"{t.review}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    {t.client_image && <img src={t.client_image} alt={t.client_name} className="h-9 w-9 rounded-full object-cover" />}
                    <div>
                      <div className="text-sm font-medium">{t.client_name}</div>
                      <div className="text-xs text-muted-foreground">{t.client_role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-accent-gradient p-12 text-center md:p-20">
          <div className="noise absolute inset-0" />
          <h2 className="font-display text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
            Have a project in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
            Let's build something exceptional together. Booking projects for next quarter.
          </p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-glow">
            Start a project <ArrowUpRight className="h-4 w-4" />
          </Link>
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

function SectionHeading({ eyebrow, title, link }: { eyebrow: string; title: string; link?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-10">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          {eyebrow}
        </div>
        <h2 className="font-display text-balance text-4xl font-black tracking-tight md:text-6xl italic">
          {title}<span className="text-primary not-italic">.</span>
        </h2>
      </div>
      {link && (
        <Link to={link} className="hidden items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all md:inline-flex group">
          View all <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function BentoProject({ project, className, big, onPreview }: { project: any; className?: string; big?: boolean; onPreview: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -8 }}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
      className={cn("gradient-border", className)}
      onClick={onPreview}
    >
      <div className="group relative block h-full w-full cursor-pointer overflow-hidden rounded-[calc(var(--radius)-1px)] bg-background/40 backdrop-blur-md transition-all hover:bg-background/20">
        {project.thumbnail && (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{project.category}</div>
            <div className="h-1 w-1 rounded-full bg-primary/40" />
            <div className="text-[10px] font-bold uppercase tracking-tighter text-secondary">Shipped</div>
          </div>
          <h3 className={`font-display mt-2 font-black ${big ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"}`}>
            {project.title}
          </h3>
          {big && project.description && (
            <p className="mt-3 max-w-md text-sm text-muted-foreground line-clamp-2 leading-relaxed">{project.description}</p>
          )}
        </div>
        <div className="absolute right-5 top-5 rounded-full bg-white/10 p-3 backdrop-blur-md border border-white/20 transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-12 group-hover:scale-110 shadow-glow">
          <ArrowUpRight className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
