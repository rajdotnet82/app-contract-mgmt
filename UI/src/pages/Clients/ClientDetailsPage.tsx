import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClient } from "./api";
import type { Client } from "./types";

function clientLabel(c: Client) {
  const n = (c.fullName || "").trim();
  if (n && n.toLowerCase() !== "client") return n;
  const alt = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return alt || n || "Client";
}

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
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

  const title = useMemo(() => (item ? clientLabel(item) : "Client"), [item]);

  if (loading) {
    return <div className="text-sm text-gray-600">Loading…</div>;
  }

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
        <div className="flex items-center gap-3">
          <Link
            to="/clients"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Clients
          </Link>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/clients"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back
          </Link>
          <Link
            to={`/clients/${item._id}/edit`}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="max-w-4xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-gray-500">Full Name</div>
            <div className="mt-1 text-sm text-gray-900">
              {item.fullName || "—"}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500">
              First / Last
            </div>
            <div className="mt-1 text-sm text-gray-900">
              {[item.firstName, item.lastName].filter(Boolean).join(" ") || "—"}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500">Email</div>
            <div className="mt-1 text-sm text-gray-900">
              {item.email || "—"}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500">Phone</div>
            <div className="mt-1 text-sm text-gray-900">
              {item.phone || "—"}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t pt-5">
          <div className="text-sm font-semibold text-gray-900">Address</div>
          <div className="mt-2 text-sm text-gray-700">
            {[
              item.addressLine1,
              item.addressLine2,
              [item.city, item.state, item.postalCode]
                .filter(Boolean)
                .join(" "),
              item.country,
            ]
              .filter(Boolean)
              .join(", ") || "—"}
          </div>
        </div>

        {item.notes ? (
          <div className="mt-5 border-t pt-5">
            <div className="text-sm font-semibold text-gray-900">Notes</div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {item.notes}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
