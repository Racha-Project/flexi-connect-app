import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/hiring")({
  component: HiringAdmin,
});

function HiringAdmin() {
  return (
    <CrudManager
      title="Hiring Requests"
      table="hiring_requests"
      fields={[
        { key: "client_name", label: "Client Name" },
        { key: "client_email", label: "Client Email" },
        { key: "company_name", label: "Company" },
        { key: "project_type", label: "Project Type" },
        { key: "project_description", label: "Description", type: "textarea" },
        { key: "budget", label: "Budget Range" },
        { key: "deadline", label: "Deadline/Timeline" },
        { key: "status", label: "Status" },
      ]}
      display={(r) => ({ primary: `${r.project_type} - ${r.client_name}`, secondary: `${r.status} - ${r.budget}` })}
      defaults={{
        client_name: "",
        client_email: "",
        company_name: "",
        project_type: "",
        project_description: "",
        budget: "",
        deadline: "",
        status: "pending",
      }}
    />
  );
}
