import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientForm from "./ClientForm";
import { getClient, updateClient } from "./api";
import { Client } from "./types";

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [value, setValue] = useState<Partial<Client>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const c = await getClient(id);
        setValue(c);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Edit Client</h1>
      <ClientForm
        value={value}
        onChange={setValue}
        submitting={saving}
        submitLabel="Save"
        onSubmit={async () => {
          if (!id) return;
          setSaving(true);
          try {
            const updated = await updateClient(id, value);
            nav(`/clients/${updated._id}`);
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
