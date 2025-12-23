import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ClientForm from "./ClientForm";
import { createClient } from "./api";
import type { ClientCreateInput } from "./types";

export default function ClientCreatePage() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);

  async function onSubmit(payload: ClientCreateInput) {
    setSaving(true);
    try {
      const created = await createClient(payload);
      nav(`/clients/${created._id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Client</h1>
          <div className="mt-1 text-sm text-gray-500">
            Create a new client record.
          </div>
        </div>

        <Link
          to="/clients"
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back
        </Link>
      </div>

      <div className="max-w-4xl">
        <ClientForm
          mode="create"
          submitting={saving}
          onCancel={() => nav("/clients")}
          onSubmit={onSubmit}
          submitLabel="Create Client"
        />
      </div>
    </div>
  );
}
