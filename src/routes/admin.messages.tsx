import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/messages")({
  component: MessagesAdmin,
});

function MessagesAdmin() {
  return (
    <CrudManager
      title="Contact Messages"
      table="contact_messages"
      fields={[
        { key: "name", label: "Sender Name" },
        { key: "email", label: "Sender Email" },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message", type: "textarea" },
        { key: "is_read", label: "Read", type: "boolean" },
      ]}
      display={(r) => ({ primary: r.subject || "No Subject", secondary: `From: ${r.name} (${r.email})` })}
      defaults={{
        name: "",
        email: "",
        subject: "",
        message: "",
        is_read: false,
      }}
    />
  );
}
