import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Github, Twitter, Linkedin, Dribbble } from "lucide-react";

export function SiteFooter() {
  const { data: settings } = useSiteSettings();
  const social = (settings?.social_links ?? {}) as Record<string, string>;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-border/60 px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="font-display text-2xl font-bold">
            {settings?.site_name ?? "Lacha"}<span className="text-primary">.</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Designing premium digital products, identities and services for ambitious teams worldwide.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Navigate</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/portfolio" className="hover:text-primary">Portfolio</Link></li>
            <li><Link to="/shop" className="hover:text-primary">Shop</Link></li>
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Contact</h4>
          <p className="text-sm text-muted-foreground">{settings?.contact_email ?? "hello@lacha.studio"}</p>
          <div className="mt-4 flex gap-2">
            {social.twitter && <a href={social.twitter} aria-label="Twitter" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Twitter className="h-4 w-4" /></a>}
            {social.github && <a href={social.github} aria-label="GitHub" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Github className="h-4 w-4" /></a>}
            {social.linkedin && <a href={social.linkedin} aria-label="LinkedIn" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Linkedin className="h-4 w-4" /></a>}
            {social.dribbble && <a href={social.dribbble} aria-label="Dribbble" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Dribbble className="h-4 w-4" /></a>}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <span>© {year} {settings?.site_name ?? "Lacha"}. All rights reserved.</span>
        <Link to="/admin/login" className="hover:text-primary">Admin</Link>
      </div>
    </footer>
  );
}
