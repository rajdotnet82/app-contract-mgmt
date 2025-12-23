import { useEffect, useState } from "react";
import { getActiveOrg, updateActiveOrg, type OrgProfile } from "./api";

export default function OrganizationProfileCard() {
  const [org, setOrg] = useState<OrgProfile | null>(null);
  const [draft, setDraft] = useState<Partial<OrgProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const o = await getActiveOrg();
        setOrg(o);
        setDraft(o);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load organization");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      const updated = await updateActiveOrg(draft);
      setOrg(updated);
      setDraft(updated);
      alert("Organization updated");
    } catch (e: any) {
      setError(e?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-sm text-gray-600 dark:text-gray-300">Loading…</div>
    );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Organization
        </div>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Name"
          value={draft.name ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
        />
        <Field
          label="Email"
          value={draft.email ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
        />

        <Field
          label="Phone"
          value={draft.phone ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
        />
        <Field
          label="Website"
          value={draft.website ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, website: v }))}
        />

        <Field
          label="Address Line 1"
          value={draft.addressLine1 ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, addressLine1: v }))}
        />
        <Field
          label="Address Line 2"
          value={draft.addressLine2 ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, addressLine2: v }))}
        />

        <Field
          label="City"
          value={draft.city ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
        />
        <Field
          label="State"
          value={draft.state ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, state: v }))}
        />

        <Field
          label="Postal Code"
          value={draft.postalCode ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, postalCode: v }))}
        />
        <Field
          label="Country"
          value={draft.country ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, country: v }))}
        />

        <Field
          label="Business Number (optional)"
          value={draft.businessNumber ?? ""}
          onChange={(v) => setDraft((d) => ({ ...d, businessNumber: v }))}
        />
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        This information is used as the **From** section on invoices and
        contracts.
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs text-gray-600 dark:text-gray-300">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
      />
    </div>
  );
}
