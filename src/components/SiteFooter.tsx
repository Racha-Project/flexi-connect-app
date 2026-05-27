import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Github, Twitter, Linkedin, Dribbble, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SiteFooter({ className = "" }: { className?: string }) {
  const { data: settings } = useSiteSettings();
  const social = (settings?.social_links ?? {}) as Record<string, string>;
  const year = new Date().getFullYear();

  return (
    <footer className={cn("relative mt-20 border-t border-border/40 px-6 py-20 overflow-hidden", className)}>
      <div className="absolute right-0 top-0 -mr-20 -mt-20 opacity-5 pointer-events-none rotate-12">
        <Heart size={400} className="text-primary animate-pulse" />
      </div>
      
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-4 relative">
        <div className="md:col-span-2">
          <Link to="/" className="font-display text-3xl font-black group italic">
            Lacha<span className="text-primary not-italic transition-all group-hover:ml-1">.</span>
          </Link>
          <p className="mt-6 max-w-sm text-lg text-muted-foreground leading-relaxed font-medium">
            Designing & coding premium digital products for ambitious teams worldwide. <span className="text-primary italic font-black">Fast & Finished.</span>
          </p>
        </div>
        
        <div>
          <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary">Navigate</h4>
          <ul className="space-y-4 text-sm font-bold uppercase tracking-widest">
            <li><Link to="/portfolio" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Work</Link></li>
            <li><Link to="/shop" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Shop</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Offer</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-all hover:translate-x-1 inline-block">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-all hover:translate-x-1 inline-block">Contact</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary">Connect</h4>
          <p className="text-sm font-black hover:text-primary transition-colors cursor-pointer mb-6">{settings?.contact_email ?? "hello@lacha.studio"}</p>
          <div className="flex gap-4">
            {social.twitter && (
              <motion.a whileHover={{ scale: 1.2, rotate: 12, y: -4 }} href={social.twitter} className="rounded-2xl glass p-3 text-muted-foreground hover:text-primary transition-colors border-2 border-primary/10">
                <Twitter className="h-5 w-5" />
              </motion.a>
            )}
            {social.github && (
              <motion.a whileHover={{ scale: 1.2, rotate: -12, y: -4 }} href={social.github} className="rounded-2xl glass p-3 text-muted-foreground hover:text-primary transition-colors border-2 border-primary/10">
                <Github className="h-5 w-5" />
              </motion.a>
            )}
            {social.linkedin && (
              <motion.a whileHover={{ scale: 1.2, rotate: 12, y: -4 }} href={social.linkedin} className="rounded-2xl glass p-3 text-muted-foreground hover:text-primary transition-colors border-2 border-primary/10">
                <Linkedin className="h-5 w-5" />
              </motion.a>
            )}
          </div>
        </div>
      </div>
      
      <div className="mx-auto mt-20 flex max-w-6xl flex-wrap items-center justify-between gap-6 border-t border-border/40 pt-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
        <div className="flex items-center gap-4">
          <span>© {year} {settings?.site_name ?? "Lacha"}</span>
          <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
          <span className="flex items-center gap-1.5 italic">
            Handcrafted with <Heart size={12} className="text-primary animate-pulse fill-primary/20" /> in Bangkok
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/admin/login" className="hover:text-primary transition-colors">Admin Access</Link>
          <div className="h-4 w-px bg-border/40" />
          <span>v2.0.26</span>
        </div>
      </div>
    </footer>
  );
}
