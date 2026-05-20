import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Atelier freelance design & development" },
      { name: "description", content: "Brand identity, product design, and bespoke websites — booked as focused engagements." },
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
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Services</div>
          <h1 className="font-display mt-2 text-balance text-5xl font-bold tracking-tight md:text-7xl">Freelance engagements</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">Focused packages with clear deliverables and timelines. Custom scopes welcome.</p>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-3xl bg-surface" />)}
            {services.map((s) => (
              <div key={s.id} className="glass-strong flex flex-col rounded-3xl p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.category}</div>
                <h3 className="font-display mt-2 text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold">${Number(s.price_start).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">starting</span>
                </div>
                <div className="text-xs text-muted-foreground">Delivery: {s.estimated_delivery}</div>

                <ul className="mt-5 space-y-2.5 border-t border-border/60 pt-5">
                  {s.features?.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-primary" /> {f}
                    </li>
                  ))}
                </ul>

                <a href="#hire" className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground py-2.5 text-sm font-medium text-background">
                  Request quote <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
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
