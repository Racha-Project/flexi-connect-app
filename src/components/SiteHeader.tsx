import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, Home, Briefcase, ShoppingBag, Zap, User, MessageSquare, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const nav = [
  { to: "/", label: "Hi", icon: <Home size={20} /> },
  { to: "/portfolio", label: "Work", icon: <Briefcase size={20} /> },
  { to: "/shop", label: "Shop", icon: <ShoppingBag size={20} /> },
  { to: "/services", label: "Offer", icon: <Zap size={20} /> },
  { to: "/about", label: "Me", icon: <User size={20} /> },
  { to: "/contact", label: "Talk", icon: <MessageSquare size={20} /> },
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
      {/* Desktop Exact Hunter Layout */}
      <div className="hidden lg:block">
        {/* Top Header Bar */}
        <header className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-10 py-6 pointer-events-none">
          <div className="flex items-center gap-6 pointer-events-auto">
            <Link to="/" className="font-display text-lg font-bold flex items-center gap-2 group">
              Lacha <span className="text-muted-foreground/40 font-medium">✦</span> <span className="text-muted-foreground text-sm font-medium tracking-tight group-hover:text-primary transition-colors">Worldwide</span>
            </Link>
            <div className="h-4 w-px bg-border/40" />
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              <Globe size={12} className="text-primary animate-pulse" /> {time} · Bangkok, TH
            </div>
          </div>

          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-primary shadow-glow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              1 Slot ✦ Q1 '26 Open
            </div>
            <button
              onClick={toggleTheme}
              className="glass h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary transition-all"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Left Sidebar Nav */}
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-20 flex-col items-center justify-center border-r border-border/40 bg-background/20 backdrop-blur-md">
          <nav className="flex flex-col gap-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group relative flex h-12 w-12 flex-col items-center justify-center rounded-2xl transition-all duration-500",
                  pathname === n.to
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                )}
              >
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                  {n.icon}
                </motion.div>
                
                {/* Hunter style label below icon */}
                <span className={cn(
                  "mt-1 text-[8px] font-black uppercase tracking-tighter opacity-0 transition-opacity group-hover:opacity-100",
                  pathname === n.to && "opacity-100"
                )}>
                  {n.label}
                </span>

                {/* Vertical active indicator */}
                {pathname === n.to && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -left-1 h-8 w-1 rounded-r-full bg-primary"
                  />
                )}
              </Link>
            ))}
          </nav>
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
