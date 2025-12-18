import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClient } from "./api";
import { Client } from "./types";

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Client | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const c = await getClient(id);
      setItem(c);
    }
    void load();
  }, [id]);

  if (!item) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{item.displayName}</h1>
        <Link
          className="rounded-lg border px-4 py-2 text-sm"
          to={`/clients/${item._id}/edit`}
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-4 text-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <span className="text-gray-500">Type:</span> {item.clientType}
          </div>
          <div>
            <span className="text-gray-500">Status:</span> {item.status}
          </div>
          <div>
            <span className="text-gray-500">Contact:</span>{" "}
            {item.primaryContactName}
          </div>
          <div>
            <span className="text-gray-500">Email:</span> {item.primaryEmail}
          </div>
          <div>
            <span className="text-gray-500">Phone:</span>{" "}
            {item.primaryPhone || "-"}
          </div>
          <div>
            <span className="text-gray-500">Category:</span>{" "}
            {item.category || "-"}
          </div>
        </div>

        {item.tags?.length ? (
          <div className="mt-3">
            <div className="text-gray-500">Tags</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {item.notes ? (
          <div className="mt-3">
            <div className="text-gray-500">Notes</div>
            <div className="mt-1 whitespace-pre-wrap">{item.notes}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
