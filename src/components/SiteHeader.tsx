import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/shop", label: "Shop" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
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
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5">
        <Link to="/" className="font-display text-xl font-bold">
          Lacha<span className="text-primary">.</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm transition-colors hover:text-foreground",
                pathname === n.to
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/contact"
            className="hidden rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 md:inline-flex"
          >
            Hire me
          </Link>
          <button
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl rounded-3xl p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm",
                  pathname === n.to
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50",
                )}
              >
                {n.label}
              </Link>
            ))}
            <Link to="/admin/login" className="mt-2 rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
              Admin login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
