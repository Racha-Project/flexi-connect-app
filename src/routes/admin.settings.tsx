import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  return (
    <CrudManager
      title="Site Settings"
      table="site_settings"
      fields={[
        { key: "site_name", label: "Site Name" },
        { key: "logo", label: "Logo", type: "image" },
        { key: "hero_title", label: "Hero Title" },
        { key: "hero_subtitle", label: "Hero Subtitle" },
        { key: "hero_image", label: "Hero Image", type: "image" },
        { key: "about_text", label: "About Text", type: "textarea" },
        { key: "contact_email", label: "Contact Email" },
        { key: "contact_phone", label: "Contact Phone" },
      ]}
      display={(r) => ({ primary: r.site_name || "General Settings", secondary: r.contact_email })}
      defaults={{
        site_name: "",
        logo: null,
        hero_title: "",
        hero_subtitle: "",
        hero_image: null,
        about_text: "",
        contact_email: "",
        contact_phone: "",
      }}
    />
  );
}
