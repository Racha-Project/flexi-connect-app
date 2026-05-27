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
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-6"
          >
            <div className="glass-strong overflow-hidden rounded-[2.5rem] border-2 border-primary/20 shadow-glow">
              <button
                onClick={onClose}
                className="absolute right-6 top-6 z-10 rounded-full bg-background/80 p-2 text-muted-foreground backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <X size={20} />
              </button>

              <div className="relative aspect-video overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>

              <div className="p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  {data.category && (
                    <span className="rounded-full bg-primary/10 px-3 py-1">
                      {data.category}
                    </span>
                  )}
                  {data.date && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar size={12} /> {data.date}
                    </span>
                  )}
                  {data.author && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <User size={12} /> {data.author}
                    </span>
                  )}
                </div>

                <h2 className="font-display mt-4 text-3xl font-black italic md:text-4xl">
                  {data.title}<span className="text-primary not-italic">.</span>
                </h2>
                
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {data.description}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    to={fullPath}
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-glow transition-all hover:scale-105 active:scale-95"
                  >
                    Full Case Study <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Link>
                  <button
                    onClick={onClose}
                    className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Maybe later
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
