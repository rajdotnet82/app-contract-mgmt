import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listClients, deleteClient } from "./api";
import { Client, ClientStatus } from "./types";

const STATUSES: (ClientStatus | "")[] = [
  "",
  "Lead",
  "Active",
  "Past",
  "VIP",
  "Cold",
];

export default function ClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ClientStatus | "">("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await listClients({ q, status });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Clients</h1>
        <Link
          to="/clients/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Client
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600">Search</label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, email, phone..."
            />
          </div>

          <div className="w-full md:w-56">
            <label className="text-xs font-medium text-gray-600">Status</label>
            <select
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              {STATUSES.map((s) => (
                <option key={s || "all"} value={s}>
                  {s || "All"}
                </option>
              ))}
            </select>
          </div>

          <button
            className="rounded-lg border px-4 py-2 text-sm"
            onClick={load}
          >
            Search
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No clients found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs text-gray-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="p-3 font-medium">
                    <Link
                      className="text-blue-700 hover:underline"
                      to={`/clients/${c._id}`}
                    >
                      {c.displayName}
                    </Link>
                  </td>
                  <td className="p-3">{c.primaryEmail}</td>
                  <td className="p-3">{c.primaryPhone || "-"}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3 text-right">
                    <Link
                      className="mr-3 text-blue-700 hover:underline"
                      to={`/clients/${c._id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={async () => {
                        if (!confirm("Delete this client?")) return;
                        await deleteClient(c._id);
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
