import { useState } from "react";
import { useNavigate } from "react-router";
import http from "../../api/http";

export default function OrgSetupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Organization name is required.");
      return;
    }

    setSaving(true);
    try {
      await http.post("/api/orgs", { name: trimmed });

      // After org is created, user now has activeOrgId and can access app
      navigate("/", { replace: true });
    } catch (e: any) {
      setError(
        e?.response?.data?.error ??
          e?.message ??
          "Failed to create organization"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Set up your Organization
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          You must create or join an organization to use the system.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Organization Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sheraj Photography"
              className="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
              autoFocus
            />
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create Organization"}
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            If you were invited to an organization, open your invite link (ex:{" "}
            <code>/invite/&lt;token&gt;</code>).
          </div>
        </form>
      </div>
    </div>
  );
}
