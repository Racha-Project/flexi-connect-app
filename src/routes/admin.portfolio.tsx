import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/portfolio")({
  component: PortfolioAdmin,
});

function PortfolioAdmin() {
  return (
    <CrudManager
      title="Portfolio"
      table="portfolio_projects"
      fields={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug", placeholder: "project-slug" },
        { key: "category", label: "Category" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "thumbnail", label: "Thumbnail", type: "image" },
        { key: "project_url", label: "Project URL", type: "url" },
        { key: "github_url", label: "GitHub URL", type: "url" },
        { key: "technologies_used", label: "Technologies", type: "tags" },
        { key: "featured", label: "Featured", type: "boolean" },
        { key: "order_position", label: "Order Position", type: "number" },
      ]}
      display={(r) => ({ primary: r.title, secondary: r.category })}
      defaults={{
        title: "",
        slug: "",
        category: "",
        description: "",
        thumbnail: null,
        project_url: "",
        github_url: "",
        technologies_used: [],
        featured: false,
        order_position: 0,
      }}
    />
  );
}
