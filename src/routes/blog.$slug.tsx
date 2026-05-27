import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Tag, Share2, Clock } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} — Blog` },
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();

  // Mock blog content
  const blog = {
    title: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    description: "This is a detailed look into the topic, covering everything from design principles to implementation details.",
    category: "Design",
    date: "May 20, 2026",
    author: "Lacha",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    content: `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <h2>The Core Philosophy</h2>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <blockquote>"Design is not just what it looks like and feels like. Design is how it works."</blockquote>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    `
  };

  return (
    <PublicLayout>
      <article className="px-6 pb-20 pt-8">
        <div className="mx-auto max-w-4xl">
          <Link to="/blog" className="group mb-12 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to journal
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <span className="rounded-full bg-primary/10 px-4 py-1.5">{blog.category}</span>
              <span className="flex items-center gap-2 text-muted-foreground"><Calendar size={14} /> {blog.date}</span>
              <span className="flex items-center gap-2 text-muted-foreground"><Clock size={14} /> 5 min read</span>
            </div>

            <h1 className="font-display mt-8 text-balance text-5xl font-black tracking-tight md:text-7xl italic">
              {blog.title}<span className="text-primary not-italic">.</span>
            </h1>

            <div className="mt-12 overflow-hidden rounded-[3rem] border border-border/40 shadow-glow-sm aspect-video relative">
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Written by</div>
                      <div className="font-bold">{blog.author}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Share this</div>
                    <button className="flex items-center gap-2 rounded-xl border border-border/40 p-3 text-xs font-bold hover:border-primary/50 transition-colors">
                      <Share2 size={14} /> Copy link
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div 
                  className="prose prose-invert prose-primary max-w-none prose-p:text-lg prose-p:leading-relaxed prose-headings:font-display prose-headings:italic prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-2xl"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </article>
    </PublicLayout>
  );
}
