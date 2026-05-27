import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { PublicLayout } from "@/components/PublicLayout";
import { FloatingElement } from "@/components/FloatingElement";
import { Sparkles, Star, Zap, Code, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Lacha" },
      { name: "description", content: "Learn about my journey and approach to digital design." },
    ],
  }),
  component: AboutPage,
});

const skills = [
  "Brand identity", "UX research", "UI design", "Design systems",
  "Front-end engineering", "Motion design", "Art direction", "Prototyping",
];

const timeline = [
  { year: "2026", title: "Independent practice", body: "Launched Lacha — full-time freelance for product & brand work.", icon: <Rocket size={16} /> },
  { year: "2024", title: "Senior Product Designer · Orbit", body: "Led design system and dashboard suite shipped to thousands of teams.", icon: <Code size={16} /> },
  { year: "2022", title: "Design Lead · Northwind", body: "Built the internal operator console used daily by 400+ staff.", icon: <Star size={16} /> },
  { year: "2019", title: "Studied design & CS", body: "Combined visual design and engineering from the start.", icon: <Heart size={16} /> },
];

import { Rocket } from "lucide-react";

function AboutPage() {
  const { data: settings } = useSiteSettings();
  return (
    <PublicLayout>
      <section className="px-6 pb-20 pt-8 relative overflow-hidden">
        {/* Playful backgrounds */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <FloatingElement className="absolute left-[5%] top-[15%]" distance={30} duration={6}>
            <Sparkles size={120} className="text-primary" />
          </FloatingElement>
          <FloatingElement className="absolute right-[5%] bottom-[20%]" distance={40} duration={8} delay={1}>
            <Zap size={100} className="text-primary" />
          </FloatingElement>
        </div>

        <div className="mx-auto max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs uppercase tracking-widest text-primary font-bold flex items-center gap-2 mb-4"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            About Me
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-balance text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl"
          >
            Designing & <span className="text-primary italic">coding</span> things with care.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 max-w-2xl text-xl text-muted-foreground leading-relaxed"
          >
            {settings?.about_text ?? "I'm a multidisciplinary designer and engineer focused on crafting modern interfaces, identity systems, and digital products."}
          </motion.p>

          <div className="mt-20">
            <h2 className="font-display text-3xl font-bold">The Toolkit</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {skills.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 2 : -2 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-surface/40 px-6 py-3 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-surface"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <h2 className="font-display text-3xl font-bold italic text-primary">The Journey</h2>
            <div className="mt-10 relative">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-border md:left-1/2" />
              <div className="space-y-12">
                {timeline.map((t, i) => (
                  <motion.div
                    key={t.year}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative flex flex-col md:flex-row gap-8 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                  >
                    <div className="absolute left-4 top-2 -ml-2.5 h-5 w-5 rounded-full bg-background border-2 border-primary z-10 md:left-1/2" />
                    <div className="flex-1 md:text-right md:pr-12 group">
                      <div className={`flex flex-col ${i % 2 === 0 ? "md:items-start" : "md:items-end"}`}>
                        <div className="text-xs font-black uppercase tracking-widest text-primary mb-1 bg-primary/10 px-3 py-1 rounded-full inline-block">
                          {t.year}
                        </div>
                        <h3 className="font-display text-2xl font-bold group-hover:text-primary transition-colors">{t.title}</h3>
                        <p className={`mt-2 text-muted-foreground leading-relaxed max-w-md ${i % 2 === 0 ? "md:text-left" : "md:text-right ml-auto"}`}>{t.body}</p>
                      </div>
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
