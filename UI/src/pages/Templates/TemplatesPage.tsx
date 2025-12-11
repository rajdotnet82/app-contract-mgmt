import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Template, TemplateSearchCriteria } from "./types";
import { fetchTemplates, deleteTemplate } from "./api";

export default function TemplatesPage() {
  const nav = useNavigate();
  const [criteria, setCriteria] = useState<TemplateSearchCriteria>({ q: "" });
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (c: TemplateSearchCriteria) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTemplates(c);
      setItems(data);
    } catch {
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(criteria);
  }, [criteria, load]);

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this template?");
    if (!ok) return;
    await deleteTemplate(id);
    await load(criteria);
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap gap-3">
          <input
            className="w-full md:w-96 rounded-lg border border-stroke bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-strokedark"
            placeholder="Search templates..."
            value={criteria.q}
            onChange={(e) => setCriteria({ q: e.target.value })}
          />

          <button
            className="rounded-lg border border-stroke px-4 py-2 dark:border-strokedark"
            onClick={() => setCriteria({ q: "" })}
            type="button"
          >
            Clear
          </button>

          <div className="flex-1" />

          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => nav("/templates/new")}
          >
            Add Template
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Templates
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {items.length} total
          </span>
        </div>

        {loading && (
          <div className="py-6 text-sm text-gray-500">Loading...</div>
        )}
        {error && <div className="py-3 text-sm text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Placeholders</th>
                  <th className="px-3 py-2 font-medium">Updated</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr
                    key={t._id}
                    className="border-t border-stroke dark:border-strokedark"
                  >
                    <td className="px-3 py-2">{t.name}</td>
                    <td className="px-3 py-2">{t.description ?? "-"}</td>
                    <td className="px-3 py-2">{t.placeholders?.length ?? 0}</td>
                    <td className="px-3 py-2">
                      {t.updatedAt
                        ? new Date(t.updatedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-3">
                        <button
                          className="text-blue-600 underline"
                          onClick={() => nav(`/templates/${t._id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 underline"
                          onClick={() => handleDelete(t._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-sm text-gray-500" colSpan={5}>
                      No templates yet. Add your first template.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
