import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Calendar, Tag, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    title: string;
    description: string;
    thumbnail?: string;
    category?: string;
    slug: string;
    type: "project" | "blog";
    date?: string;
    author?: string;
  } | null;
}

export function PreviewModal({ isOpen, onClose, data }: PreviewModalProps) {
  if (!data) return null;

  const fullPath = data.type === "project" ? `/portfolio/${data.slug}` : `/blog/${data.slug}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 px-6 h-[90vh] overflow-y-auto scrollbar-hide"
          >
            <div className="glass-strong overflow-hidden rounded-[3rem] border-2 border-border/40 shadow-2xl bg-background">
              {/* Header Image */}
              <div className="relative aspect-video w-full overflow-hidden">
                {data.thumbnail ? (
                  <img
                    src={data.thumbnail}
                    alt={data.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                    <Tag size={48} className="text-primary/20" />
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-primary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 md:p-12">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
                  <span>{data.type === "project" ? "Case Study" : "Journal"}</span>
                  <span>✦</span>
                  <span className="text-muted-foreground">{data.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2">
                    <h2 className="font-display text-5xl md:text-6xl font-black italic leading-[0.9] tracking-tighter mb-4">
                      {data.title}<span className="text-primary not-italic">.</span>
                    </h2>
                    <p className="text-xl font-bold text-primary italic mb-8 opacity-80">{data.category} Organizer</p>
                    
                    <div className="flex flex-wrap gap-2 mb-10">
                      {["React", "Next.js", "Tailwind", "Supabase"].map(tag => (
                        <span key={tag} className="rounded-full border border-border px-3 py-1 text-[8px] font-black uppercase tracking-widest text-muted-foreground">{tag}</span>
                      ))}
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">The Brief</h4>
                        <p className="text-muted-foreground leading-relaxed font-medium">
                          {data.description}. I built this to solve a specific problem in the {data.category} space, focusing on speed and user experience.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">What I Built</h4>
                        <ul className="space-y-3">
                          {["Custom design system from scratch", "Advanced AI-powered filtering logic", "Real-time synchronization with Supabase", "Fully responsive and accessible UI"].map(item => (
                            <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground font-medium">
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="rounded-[2rem] border border-border/60 bg-surface/30 p-6 space-y-6">
                      {[
                        { label: "Client", value: "Confidential" },
                        { label: "Timeline", value: "14 Days" },
                        { label: "Stack", value: "Next.js + AI" },
                        { label: "Type", value: data.type === "project" ? "Product Design" : "Article" },
                        { label: "Status", value: "Shipped" },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                          <span className="text-xs font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-border/20 flex flex-wrap items-center gap-4">
                  <Link
                    to={data.type === "project" ? "/portfolio/$slug" : "/blog/$slug"}
                    params={{ slug: data.slug }}
                    onClick={onClose}
                    className="group inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-black uppercase tracking-widest text-background shadow-glow transition-all hover:scale-105 active:scale-95"
                  >
                    {data.type === "project" ? "Full Case Study" : "Read Full Article"} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Link>
                  <button
                    onClick={onClose}
                    className="rounded-full border-2 border-border px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-surface transition-all"
                  >
                    Back to Work
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
