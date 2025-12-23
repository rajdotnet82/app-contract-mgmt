import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteClient, listClients } from "./api";
import type { Client } from "./types";
import { useNavigate } from "react-router-dom";

function clientLabel(c: Client) {
  // Prefer fullName. If it’s generic, fall back to first+last.
  const n = (c.fullName || "").trim();
  if (n && n.toLowerCase() !== "client") return n;

  const alt = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return alt || n || "Client";
}

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  async function load(query: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await listClients({ q: query.trim() || undefined });
      setItems(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load clients"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // small debounce for typing
    const t = setTimeout(() => load(q), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = useMemo(() => items.length, [items]);

  async function onDelete(c: Client) {
    const ok = window.confirm(`Delete client "${clientLabel(c)}"?`);
    if (!ok) return;

    await deleteClient(c._id);
    await load(q);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <div className="mt-1 text-sm text-gray-500">
            {loading ? "Loading…" : `Showing ${count}`}
          </div>
        </div>

        <Link
          to="/clients/new"
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          New Client
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, phone…"
          className="w-full max-w-xl rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No clients yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((c) => (
              <div
                key={c._id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer"
                onClick={() => navigate(`/clients/${c._id}`)}
              >
                <div className="min-w-0">
                  <Link
                    to={`/clients/${c._id}`}
                    className="block truncate font-semibold text-gray-900 hover:underline"
                    title="Open details"
                  ></Link>
                  <div className="block font-semibold">{clientLabel(c)}</div>
                  <div className="mt-1 truncate text-sm text-gray-600">
                    {[
                      c.email ? `Email: ${c.email}` : null,
                      c.phone ? `Phone: ${c.phone}` : null,
                    ]
                      .filter(Boolean)
                      .join(" • ") || "—"}
                  </div>

                  <div className="mt-1 truncate text-xs text-gray-400">
                    {c.city || c.state || c.country
                      ? [c.city, c.state, c.country].filter(Boolean).join(", ")
                      : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => navigate(`/clients/${c._id}/edit`)}
                  >
                    Edit
                  </button> */}

                  <button
                    onClick={() => onDelete(c)}
                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
