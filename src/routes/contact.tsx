import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Lacha" },
      { name: "description", content: "Let's collaborate on your next project." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert(form);
    setSending(false);
    if (error) return toast.error("Couldn't send. Try again.");
    toast.success("Message sent! I'll reply soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <PublicLayout>
      <section className="px-6 pb-20 pt-8">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Contact</div>
            <h1 className="font-display mt-2 text-balance text-5xl font-bold tracking-tight md:text-7xl">Let's talk.</h1>
            <p className="mt-6 max-w-md text-muted-foreground">For projects, collaborations or product questions — drop a note and I'll reply within 48 hours.</p>

            <div className="mt-10 space-y-4">
              <Item icon={Mail} label="Email" value={settings?.contact_email ?? "hello@lacha.studio"} />
              {settings?.contact_phone && <Item icon={Phone} label="Phone" value={settings.contact_phone} />}
              <Item icon={MapPin} label="Based in" value="Stockholm · Remote worldwide" />
            </div>
          </div>

          <form onSubmit={submit} className="glass-strong h-fit rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold">Send a message</h2>
            <div className="mt-5 space-y-3">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <textarea required rows={6} placeholder="What's on your mind?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <button disabled={sending} className="mt-5 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background shadow-glow disabled:opacity-60">
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}

function Item({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-xl border border-border bg-surface/60 p-3"><Icon className="h-4 w-4 text-primary" /></div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm">{value}</div>
      </div>
    </div>
  );
}
