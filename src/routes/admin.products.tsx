import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

function ProductsAdmin() {
  return (
    <CrudManager
      title="Digital Products"
      table="digital_products"
      fields={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "category", label: "Category" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "price", label: "Price", type: "number" },
        { key: "discount_price", label: "Discount Price", type: "number" },
        { key: "thumbnail", label: "Thumbnail", type: "image" },
        { key: "gallery_images", label: "Gallery", type: "gallery" },
        { key: "download_file", label: "Download URL", type: "url" },
        { key: "status", label: "Status" },
        { key: "tags", label: "Tags", type: "tags" },
        { key: "featured", label: "Featured", type: "boolean" },
      ]}
      display={(r) => ({ primary: r.title, secondary: `${r.price} THB - ${r.status}` })}
      defaults={{
        title: "",
        slug: "",
        category: "",
        description: "",
        price: 0,
        discount_price: null,
        thumbnail: null,
        gallery_images: [],
        download_file: "",
        status: "draft",
        tags: [],
        featured: false,
      }}
    />
  );
}
