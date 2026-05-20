import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/shop/$slug")({
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const [open, setOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("digital_products").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  return (
    <PublicLayout>
      <section className="px-6 pb-20 pt-4">
        <div className="mx-auto max-w-5xl">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
          </Link>

          {isLoading && <div className="mt-10 h-96 animate-pulse rounded-3xl bg-surface" />}
          {product && (
            <div className="mt-6 grid gap-10 md:grid-cols-5">
              <div className="md:col-span-3">
                {product.thumbnail && <img src={product.thumbnail} alt={product.title} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-card" />}
                {product.gallery_images && product.gallery_images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {product.gallery_images.map((g: string, i: number) => (
                      <img key={i} src={g} alt="" className="aspect-square w-full rounded-2xl object-cover" />
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{product.category}</div>
                <h1 className="font-display mt-2 text-4xl font-bold tracking-tight">{product.title}</h1>
                <div className="mt-4 flex items-baseline gap-3">
                  {product.discount_price ? (
                    <>
                      <span className="text-3xl font-semibold text-primary">${Number(product.discount_price).toFixed(0)}</span>
                      <span className="text-lg text-muted-foreground line-through">${Number(product.price).toFixed(0)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-semibold">${Number(product.price).toFixed(0)}</span>
                  )}
                </div>
                <p className="mt-6 text-pretty text-muted-foreground">{product.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.tags?.map((t: string) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs"><Tag className="h-3 w-3" /> {t}</span>
                  ))}
                </div>
                <button onClick={() => setOpen(true)} className="mt-8 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background shadow-glow transition-transform hover:scale-[1.01]">
                  Request to purchase
                </button>
                <p className="mt-3 text-center text-xs text-muted-foreground">You'll receive a checkout link via email within 24 hours.</p>
              </div>
            </div>
          )}

          {product && open && <PurchaseModal product={product} onClose={() => setOpen(false)} />}
        </div>
      </section>
    </PublicLayout>
  );
}

function PurchaseModal({ product, onClose }: { product: any; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("orders").insert({
      customer_name: form.name,
      customer_email: form.email,
      product_id: product.id,
      message: form.message,
    });
    setSending(false);
    if (error) return toast.error("Couldn't send. Try again.");
    toast.success("Request sent! Check your inbox shortly.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="glass-strong w-full max-w-md rounded-3xl p-6">
        <h3 className="font-display text-xl font-semibold">Request: {product.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">I'll email you a payment link within 24 hours.</p>
        <div className="mt-5 space-y-3">
          <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <textarea placeholder="Anything I should know? (optional)" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2.5 text-sm">Cancel</button>
          <button disabled={sending} className="flex-1 rounded-full bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-60">{sending ? "Sending…" : "Send request"}</button>
        </div>
      </form>
    </div>
  );
}
