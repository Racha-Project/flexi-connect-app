import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/portfolio/$slug")({
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("portfolio_projects").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  return (
    <PublicLayout>
      <article className="px-6 pb-20 pt-4">
        <div className="mx-auto max-w-4xl">
          <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to portfolio
          </Link>

          {isLoading && <div className="mt-10 h-96 animate-pulse rounded-3xl bg-surface" />}
          {project && (
            <>
              <div className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">{project.category}</div>
              <h1 className="font-display mt-2 text-balance text-5xl font-bold tracking-tight md:text-7xl">{project.title}</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{project.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.technologies_used?.map((t: string) => (
                  <span key={t} className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs">{t}</span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.project_url && <a href={project.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"><ExternalLink className="h-3.5 w-3.5" /> Live</a>}
                {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm"><Github className="h-3.5 w-3.5" /> Code</a>}
              </div>

              {project.thumbnail && (
                <img src={project.thumbnail} alt={project.title} className="mt-10 aspect-[16/10] w-full rounded-3xl object-cover shadow-card" />
              )}

              {project.full_content && (
                <div className="prose prose-invert mt-10 max-w-none text-pretty text-base leading-relaxed text-foreground/90">
                  {project.full_content.split("\n").map((p: string, i: number) => <p key={i} className="mb-4">{p}</p>)}
                </div>
              )}

              {project.gallery_images && project.gallery_images.length > 0 && (
                <div className="mt-10 grid gap-4 md:grid-cols-2">
                  {project.gallery_images.map((g: string, i: number) => (
                    <img key={i} src={g} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </article>
    </PublicLayout>
  );
}
