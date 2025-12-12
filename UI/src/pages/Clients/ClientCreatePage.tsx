import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientForm from "./ClientForm";
import { createClient } from "./api";
import { Client } from "./types";

export default function ClientCreatePage() {
  const nav = useNavigate();
  const [value, setValue] = useState<Partial<Client>>({
    clientType: "individual",
    status: "Lead",
  });
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Add Client</h1>
      <ClientForm
        value={value}
        onChange={setValue}
        submitting={saving}
        submitLabel="Create"
        onSubmit={async () => {
          setSaving(true);
          try {
            const created = await createClient(value);
            nav(`/clients/${created._id}`);
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
