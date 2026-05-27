import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, Home, Briefcase, ShoppingBag, Zap, User, MessageSquare, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const nav = [
  { id: "00", to: "/", label: "Hi", icon: <Home size={18} /> },
  { id: "01", to: "/portfolio", label: "Work", icon: <Briefcase size={18} /> },
  { id: "02", to: "/about", label: "About", icon: <User size={18} /> },
  { id: "03", to: "/services", label: "Services", icon: <Zap size={18} /> },
  { id: "04", to: "/shop", label: "Shop", icon: <ShoppingBag size={18} /> },
  { id: "05", to: "/blog", label: "Journal", icon: <MessageSquare size={18} /> },
  { id: "06", to: "/contact", label: "Hire me", icon: <MessageSquare size={18} /> },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [time, setTime] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "dark"
      | "light"
      | null;
    const initial = stored ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    localStorage.setItem("theme", next);
  };

  return (
    <>
      {/* Desktop Sidebar Exact Match */}
      <div className="hidden lg:block">
        <aside className="fixed left-6 top-6 bottom-6 z-50 flex w-[220px] flex-col overflow-hidden rounded-[2.5rem] border border-border/40 bg-background/40 backdrop-blur-xl shadow-2xl p-6">
          <div className="flex flex-col items-start gap-1 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-base">L</div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-widest">Lacha Studio</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Worldwide</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              1 Slot ✦ Q1 '26
            </div>
          </div>
          
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 scrollbar-hide">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-300",
                  pathname === n.to
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                )}
              >
                <span className="text-xs font-black opacity-40 group-hover:opacity-100">{n.id}</span>
                <span className="text-base font-black uppercase tracking-widest">{n.label}</span>
                {pathname === n.to && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -right-1 h-5 w-1.5 rounded-l-full bg-primary"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-border/20 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                {time} · BKK <Globe size={10} />
              </div>
              <div className="text-[9px] font-bold text-muted-foreground/60 uppercase">Bangkok, Thailand</div>
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={toggleTheme}
                className="glass h-11 w-11 flex items-center justify-center rounded-2xl text-muted-foreground hover:text-primary transition-all"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="h-11 w-11 rounded-2xl glass flex items-center justify-center text-primary font-bold">✦</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Top Bar (Remains similar but cleaned up) */}
      <header className="fixed inset-x-0 top-0 z-[70] px-4 pt-4 lg:hidden">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5">
          <Link to="/" className="font-display text-xl font-bold">
            Lacha<span className="text-primary">.</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass mx-auto mt-2 max-w-6xl rounded-[2rem] p-4"
            >
              <div className="grid grid-cols-2 gap-2">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl py-6 transition-all",
                      pathname === n.to
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface/40 text-muted-foreground"
                    )}
                  >
                    {n.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{n.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
