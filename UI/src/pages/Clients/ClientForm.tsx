import { useMemo } from "react";
import { Client, ClientStatus, ClientType } from "./types";

type Props = {
  value: Partial<Client>;
  onChange: (next: Partial<Client>) => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
};

const CLIENT_TYPES: ClientType[] = ["individual", "couple", "business"];
const STATUSES: ClientStatus[] = ["Lead", "Active", "Past", "VIP", "Cold"];

const CATEGORY_SUGGESTIONS = [
  "Wedding",
  "Engagement",
  "Maternity",
  "Newborn",
  "Family",
  "Portrait",
  "Graduation",
  "Birthday",
  "Corporate",
  "Headshots",
  "Real Estate",
  "Event",
];

function setField<T extends object>(obj: T, key: keyof T, val: any): T {
  return { ...obj, [key]: val };
}

export default function ClientForm({
  value,
  onChange,
  onSubmit,
  submitting,
  submitLabel = "Save",
}: Props) {
  const tagsText = useMemo(() => (value.tags ?? []).join(", "), [value.tags]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-gray-700">Client</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-gray-600">
              Client Type
            </label>
            <select
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={value.clientType ?? "individual"}
              onChange={(e) =>
                onChange(setField(value, "clientType", e.target.value))
              }
            >
              {CLIENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Status</label>
            <select
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={value.status ?? "Lead"}
              onChange={(e) =>
                onChange(setField(value, "status", e.target.value))
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Display Name *
            </label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={value.displayName ?? ""}
              onChange={(e) =>
                onChange(setField(value, "displayName", e.target.value))
              }
              placeholder='e.g. "Priya & Arjun"'
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Primary Contact Name *
            </label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={value.primaryContactName ?? ""}
              onChange={(e) =>
                onChange(setField(value, "primaryContactName", e.target.value))
              }
              placeholder="e.g. Priya"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Primary Email *
            </label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={value.primaryEmail ?? ""}
              onChange={(e) =>
                onChange(setField(value, "primaryEmail", e.target.value))
              }
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Primary Phone
            </label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={value.primaryPhone ?? ""}
              onChange={(e) =>
                onChange(setField(value, "primaryPhone", e.target.value))
              }
              placeholder="(555) 123-4567"
            />
          </div>

          {value.clientType === "couple" && (
            <div>
              <label className="text-xs font-medium text-gray-600">
                Partner Name
              </label>
              <input
                className="mt-1 w-full rounded-md border p-2 text-sm"
                value={value.partnerName ?? ""}
                onChange={(e) =>
                  onChange(setField(value, "partnerName", e.target.value))
                }
                placeholder="e.g. Arjun"
              />
            </div>
          )}

          {value.clientType === "business" && (
            <div>
              <label className="text-xs font-medium text-gray-600">
                Company Name
              </label>
              <input
                className="mt-1 w-full rounded-md border p-2 text-sm"
                value={value.companyName ?? ""}
                onChange={(e) =>
                  onChange(setField(value, "companyName", e.target.value))
                }
                placeholder="e.g. Patterson Companies"
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-gray-700">Profile</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-gray-600">
              Category
            </label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              list="client-category-suggestions"
              value={value.category ?? ""}
              onChange={(e) =>
                onChange(setField(value, "category", e.target.value))
              }
              placeholder="Start typing…"
            />
            <datalist id="client-category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-gray-400">
              You can choose a suggestion or type your own.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">
              Referral Source
            </label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={value.referralSource ?? ""}
              onChange={(e) =>
                onChange(setField(value, "referralSource", e.target.value))
              }
              placeholder="Google / Instagram / Bark..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Communication Preference
            </label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={value.communicationPreference ?? ""}
              onChange={(e) =>
                onChange(
                  setField(value, "communicationPreference", e.target.value)
                )
              }
              placeholder="WhatsApp / Text / Email"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Instagram
            </label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={value.instagramHandle ?? ""}
              onChange={(e) =>
                onChange(setField(value, "instagramHandle", e.target.value))
              }
              placeholder="@username"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Tags</label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm"
              value={tagsText}
              onChange={(e) =>
                onChange(
                  setField(
                    value,
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  )
                )
              }
              placeholder="high-budget, 2026-wedding, vip"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-600">Notes</label>
            <textarea
              className="mt-1 w-full rounded-md border p-2 text-sm"
              rows={4}
              value={value.notes ?? ""}
              onChange={(e) =>
                onChange(setField(value, "notes", e.target.value))
              }
              placeholder="Anything important about this client..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={submitting}
          onClick={onSubmit}
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
