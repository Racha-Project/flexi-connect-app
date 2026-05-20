import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/testimonials")({
  component: TestimonialsAdmin,
});

function TestimonialsAdmin() {
  return (
    <CrudManager
      title="Testimonials"
      table="testimonials"
      fields={[
        { key: "client_name", label: "Client Name" },
        { key: "client_role", label: "Client Role/Company" },
        { key: "client_image", label: "Client Image", type: "image" },
        { key: "review", label: "Review", type: "textarea" },
        { key: "rating", label: "Rating (1-5)", type: "number" },
        { key: "featured", label: "Featured", type: "boolean" },
        { key: "order_position", label: "Order Position", type: "number" },
      ]}
      display={(r) => ({ primary: r.client_name, secondary: `${r.rating} stars - ${r.client_role}` })}
      defaults={{
        client_name: "",
        client_role: "",
        client_image: null,
        review: "",
        rating: 5,
        featured: true,
        order_position: 0,
      }}
    />
  );
}
