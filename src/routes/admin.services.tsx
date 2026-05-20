import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/services")({
  component: ServicesAdmin,
});

function ServicesAdmin() {
  return (
    <CrudManager
      title="Services"
      table="freelance_services"
      fields={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "price_start", label: "Starting Price", type: "number" },
        { key: "estimated_delivery", label: "Delivery Time" },
        { key: "features", label: "Features (List)", type: "tags" },
        { key: "status", label: "Status" },
        { key: "featured", label: "Featured", type: "boolean" },
        { key: "order_position", label: "Order Position", type: "number" },
      ]}
      display={(r) => ({ primary: r.title, secondary: `${r.category} - From ${r.price_start} THB` })}
      defaults={{
        title: "",
        category: "",
        description: "",
        price_start: 0,
        estimated_delivery: "",
        features: [],
        status: "active",
        featured: false,
        order_position: 0,
      }}
    />
  );
}
