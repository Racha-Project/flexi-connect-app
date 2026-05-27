import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, Home, Briefcase, ShoppingBag, Zap, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const nav = [
  { to: "/", label: "Home", icon: <Home size={18} /> },
  { to: "/portfolio", label: "Portfolio", icon: <Briefcase size={18} /> },
  { to: "/shop", label: "Shop", icon: <ShoppingBag size={18} /> },
  { to: "/services", label: "Services", icon: <Zap size={18} /> },
  { to: "/about", label: "About", icon: <User size={18} /> },
  { to: "/contact", label: "Contact", icon: <MessageSquare size={18} /> },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
      {/* Desktop Vertical Sidebar */}
      <header className="fixed left-6 top-1/2 z-50 hidden -translate-y-1/2 lg:block">
        <div className="glass flex flex-col items-center gap-6 rounded-full py-8 px-3 border border-border/50">
          <Link to="/" className="font-display text-2xl font-bold mb-4">
            L<span className="text-primary">.</span>
          </Link>
          
          <nav className="flex flex-col gap-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
                  pathname === n.to
                    ? "bg-primary text-primary-foreground shadow-glow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <motion.div whileHover={{ rotate: 12, scale: 1.1 }}>
                  {n.icon}
                </motion.div>
                
                {/* Tooltip-like label */}
                <div className="absolute left-16 hidden rounded-lg bg-foreground px-3 py-1.5 text-xs font-bold text-background opacity-0 group-hover:block group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {n.label}
                  <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-foreground" />
                </div>
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-3 border-t border-border/40 pt-6">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Top Bar */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:hidden">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-xl font-bold flex items-center gap-1">
              Lacha<span className="text-primary">.</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/50 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-tighter text-primary">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Q1 '26
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="glass mx-auto mt-2 max-w-6xl rounded-3xl p-4 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                      pathname === n.to
                        ? "bg-primary text-primary-foreground shadow-glow-sm"
                        : "text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {n.icon}
                    {n.label}
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
