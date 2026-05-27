import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ArrowUpRight, Sparkles, Zap, Rocket } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Lacha freelance design & development" },
      { name: "description", content: "Professional design and engineering services." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services_all"],
    queryFn: async () => (await supabase.from("freelance_services").select("*").eq("status", "active").order("order_position")).data ?? [],
  });

  return (
    <PublicLayout>
      <section className="px-6 pb-12 pt-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs uppercase tracking-widest text-primary font-bold flex items-center gap-2"
          >
            <Sparkles size={14} className="animate-pulse" />
            What I Offer
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display mt-2 text-balance text-5xl font-bold tracking-tight md:text-7xl"
          >
            Built end-to-end. <span className="text-primary italic">Shipped fast.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-muted-foreground text-lg"
          >
            Focused packages with clear deliverables and timelines. Your idea, in real working code, in a week.
          </motion.p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-[2rem] bg-surface" />)}
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-strong flex flex-col rounded-[2.5rem] p-8 border border-border/50 hover:border-primary/40 transition-all hover:shadow-glow-sm relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  {i % 3 === 0 ? <Zap size={140} /> : i % 3 === 1 ? <Rocket size={140} /> : <Sparkles size={140} />}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{s.category}</div>
                <h3 className="font-display mt-2 text-3xl font-bold">{s.title}</h3>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{s.description}</p>

                <div className="mt-8 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary italic">${Number(s.price_start).toLocaleString()}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">starting</span>
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Delivery: {s.estimated_delivery}</div>

                <ul className="mt-8 space-y-3 border-t border-border/40 pt-8">
                  {s.features?.map((f: string) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{f}</span>
                    </li>
                  ))}
                </ul>

                <a href="#hire" className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-foreground py-4 text-sm font-bold text-background transition-all hover:scale-105 active:scale-95 shadow-glow">
                  Request quote <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.div>
            ))}
          </div>

          <HireForm />
        </div>
      </section>
    </PublicLayout>
  );
}

function HireForm() {
  const [form, setForm] = useState({ client_name: "", client_email: "", company_name: "", budget: "", project_type: "", project_description: "", deadline: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("hiring_requests").insert(form);
    setSending(false);
    if (error) return toast.error("Couldn't send. Try again.");
    toast.success("Request received! I'll reply within 48 hours.");
    setForm({ client_name: "", client_email: "", company_name: "", budget: "", project_type: "", project_description: "", deadline: "" });
  };

  return (
    <div id="hire" className="mt-24 glass-strong rounded-3xl p-8 md:p-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Hire me</div>
      <h2 className="font-display mt-2 text-balance text-3xl font-bold tracking-tight md:text-5xl">Tell me about your project</h2>
      <form onSubmit={submit} className="mt-8 grid gap-4 md:grid-cols-2">
        <Input label="Your name" value={form.client_name} onChange={(v) => setForm({ ...form, client_name: v })} required />
        <Input label="Email" type="email" value={form.client_email} onChange={(v) => setForm({ ...form, client_email: v })} required />
        <Input label="Company" value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} />
        <Input label="Budget (USD)" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder="$5k–$10k" />
        <Input label="Project type" value={form.project_type} onChange={(v) => setForm({ ...form, project_type: v })} placeholder="Branding, web app…" />
        <Input label="Ideal deadline" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} placeholder="Q3 2026" />
        <div className="md:col-span-2">
          <Label>Tell me about it</Label>
          <textarea required value={form.project_description} onChange={(e) => setForm({ ...form, project_description: e.target.value })} rows={5} className="mt-1.5 w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
        <button disabled={sending} className="md:col-span-2 rounded-full bg-foreground py-3 text-sm font-medium text-background shadow-glow disabled:opacity-60">
          {sending ? "Sending…" : "Send request"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} required={required} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs uppercase tracking-widest text-muted-foreground">{children}</label>;
}
