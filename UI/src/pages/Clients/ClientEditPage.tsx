import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ClientForm from "./ClientForm";
import { getClient, updateClient } from "./api";
import type { Client, ClientUpdateInput } from "./types";

function clientLabel(c: Client) {
  const n = (c.fullName || "").trim();
  if (n && n.toLowerCase() !== "client") return n;
  const alt = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return alt || n || "Client";
}

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [item, setItem] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const c = await getClient(id);
        if (!cancelled) setItem(c);
      } catch (e: any) {
        if (!cancelled)
          setError(
            e?.response?.data?.message || e?.message || "Failed to load client"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const title = useMemo(
    () => (item ? clientLabel(item) : "Edit Client"),
    [item]
  );

  async function onSubmit(payload: ClientUpdateInput) {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await updateClient(id, payload);
      nav(`/clients/${updated._id}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-600">Loading…</div>;

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
        <Link
          to="/clients"
          className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-600">Not found.</div>
        <Link
          to="/clients"
          className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-gray-900">
            {title}
          </h1>
          <div className="mt-1 text-sm text-gray-500">
            Update client details.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/clients/${item._id}`}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>

      <div className="max-w-4xl">
        <ClientForm
          mode="edit"
          initial={item}
          submitting={saving}
          onCancel={() => nav(`/clients/${item._id}`)}
          onSubmit={onSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
