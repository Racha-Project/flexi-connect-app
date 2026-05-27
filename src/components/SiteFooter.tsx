import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Github, Twitter, Linkedin, Dribbble, Heart } from "lucide-react";
import { motion } from "framer-motion";

export function SiteFooter() {
  const { data: settings } = useSiteSettings();
  const social = (settings?.social_links ?? {}) as Record<string, string>;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-border/60 px-6 py-16 overflow-hidden">
      <div className="absolute right-0 top-0 -mr-20 -mt-20 opacity-5 pointer-events-none">
        <Heart size={400} className="text-primary" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4 relative">
        <div className="md:col-span-2">
          <Link to="/" className="font-display text-2xl font-bold group">
            {settings?.site_name ?? "Lacha"}<span className="text-primary transition-all group-hover:ml-1">.</span>
          </Link>
          <p className="mt-4 max-w-sm text-base text-muted-foreground leading-relaxed">
            Designing premium digital products, identities and services for ambitious teams worldwide. <span className="text-primary italic font-bold italic">Shipped with care.</span>
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Navigate</h4>
          <ul className="space-y-3 text-sm font-medium">
            <li><Link to="/portfolio" className="hover:text-primary transition-colors">Portfolio</Link></li>
            <li><Link to="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Contact</h4>
          <p className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">{settings?.contact_email ?? "hello@lacha.studio"}</p>
          <div className="mt-6 flex gap-3">
            {social.twitter && (
              <motion.a whileHover={{ scale: 1.2, rotate: 12 }} href={social.twitter} aria-label="Twitter" className="rounded-full border border-border p-2.5 hover:border-primary hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </motion.a>
            )}
            {social.github && (
              <motion.a whileHover={{ scale: 1.2, rotate: -12 }} href={social.github} aria-label="GitHub" className="rounded-full border border-border p-2.5 hover:border-primary hover:text-primary transition-colors">
                <Github className="h-4 w-4" />
              </motion.a>
            )}
            {social.linkedin && (
              <motion.a whileHover={{ scale: 1.2, rotate: 12 }} href={social.linkedin} aria-label="LinkedIn" className="rounded-full border border-border p-2.5 hover:border-primary hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </motion.a>
            )}
            {social.dribbble && (
              <motion.a whileHover={{ scale: 1.2, rotate: -12 }} href={social.dribbble} aria-label="Dribbble" className="rounded-full border border-border p-2.5 hover:border-primary hover:text-primary transition-colors">
                <Dribbble className="h-4 w-4" />
              </motion.a>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
        <div className="flex items-center gap-2">
          <span>© {year} {settings?.site_name ?? "Lacha"}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>Handcrafted with <Heart size={10} className="inline text-primary animate-pulse" /></span>
        </div>
        <Link to="/admin/login" className="hover:text-primary transition-colors">Admin Access</Link>
      </div>
    </footer>
  );
}
