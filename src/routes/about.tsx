import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { PublicLayout } from "@/components/PublicLayout";

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
  { year: "2026", title: "Independent practice", body: "Launched Lacha — full-time freelance for product & brand work." },
  { year: "2024", title: "Senior Product Designer · Orbit", body: "Led design system and dashboard suite shipped to thousands of teams." },
  { year: "2022", title: "Design Lead · Northwind", body: "Built the internal operator console used daily by 400+ staff." },
  { year: "2019", title: "Studied design & CS", body: "Combined visual design and engineering from the start." },
];

function AboutPage() {
  const { data: settings } = useSiteSettings();
  return (
    <PublicLayout>
      <section className="px-6 pb-12 pt-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">About</div>
          <h1 className="font-display mt-2 text-balance text-5xl font-bold tracking-tight md:text-7xl">A designer & engineer building considered things.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            {settings?.about_text ?? "I'm a multidisciplinary designer and engineer focused on crafting modern interfaces, identity systems, and digital products."}
          </p>

          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="rounded-full border border-border bg-surface/60 px-4 py-1.5 text-sm">{s}</span>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold">Timeline</h2>
            <ol className="mt-6 space-y-6 border-l border-border pl-6">
              {timeline.map((t, i) => (
                <motion.li key={t.year} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="relative">
                  <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary shadow-glow" />
                  <div className="text-xs uppercase tracking-widest text-primary">{t.year}</div>
                  <h3 className="mt-1 font-display text-lg font-semibold">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
