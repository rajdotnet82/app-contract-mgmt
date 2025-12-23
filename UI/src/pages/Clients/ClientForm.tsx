import React, { useMemo, useState } from "react";
import type { Client, ClientCreateInput, ClientUpdateInput } from "./types";

type Props = {
  mode: "create" | "edit";
  initial?: Client | null;
  submitting?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (payload: ClientCreateInput | ClientUpdateInput) => Promise<void>;
};

type FormState = {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
};

function clean(v: string): string | undefined {
  const s = (v ?? "").trim();
  return s.length ? s : undefined;
}

function splitName(fullName: string): {
  firstName?: string;
  lastName?: string;
} {
  const s = (fullName || "").trim();
  if (!s) return {};
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default function ClientForm({
  mode,
  initial,
  submitting = false,
  submitLabel,
  onCancel,
  onSubmit,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  const initialState: FormState = useMemo(() => {
    const c = initial ?? ({} as Client);
    return {
      fullName: c.fullName ?? "",
      firstName: c.firstName ?? "",
      lastName: c.lastName ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      addressLine1: c.addressLine1 ?? "",
      addressLine2: c.addressLine2 ?? "",
      city: c.city ?? "",
      state: c.state ?? "",
      postalCode: c.postalCode ?? "",
      country: c.country ?? "",
      notes: c.notes ?? "",
    };
  }, [initial]);

  const [form, setForm] = useState<FormState>(initialState);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Full name required by backend; if user leaves empty, backend will default to "Client",
    // but better to keep UI consistent and require it.
    const fullName = clean(form.fullName);

    let firstName = clean(form.firstName);
    let lastName = clean(form.lastName);

    // If user typed only Full Name, infer first/last for convenience
    if (!firstName && !lastName && fullName) {
      const parts = splitName(fullName);
      firstName = parts.firstName;
      lastName = parts.lastName;
    }

    const payload: ClientCreateInput | ClientUpdateInput = {
      fullName: fullName, // allow backend fallback if undefined
      firstName,
      lastName,
      email: clean(form.email),
      phone: clean(form.phone),
      addressLine1: clean(form.addressLine1),
      addressLine2: clean(form.addressLine2),
      city: clean(form.city),
      state: clean(form.state),
      postalCode: clean(form.postalCode),
      country: clean(form.country),
      notes: clean(form.notes),
    };

    try {
      await onSubmit(payload);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to save client"
      );
    }
  }

  const primaryLabel =
    submitLabel ?? (mode === "create" ? "Create Client" : "Save Changes");

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {/* Basic */}
      <div>
        <div className="mb-3 text-sm font-semibold text-gray-900">Basic</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-800">
              Full Name{" "}
              <span className="text-xs text-gray-500">(required)</span>
            </div>
            <input
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g., Rajendran Thiagarajan"
              disabled={submitting}
              autoFocus
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <div className="mb-1 text-sm font-medium text-gray-800">
                First Name
              </div>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="Rajendran"
                disabled={submitting}
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium text-gray-800">
                Last Name
              </div>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="Thiagarajan"
                disabled={submitting}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-gray-900">Contact</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-gray-800">Email</div>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@email.com"
              disabled={submitting}
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-gray-800">Phone</div>
            <input
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="6128002866"
              disabled={submitting}
            />
          </label>
        </div>
      </div>

      {/* Address */}
      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-gray-900">Address</div>

        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-gray-800">
              Address Line 1
            </div>
            <input
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              value={form.addressLine1}
              onChange={(e) => set("addressLine1", e.target.value)}
              placeholder="15542 Lilac Dr"
              disabled={submitting}
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-gray-800">
              Address Line 2
            </div>
            <input
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              value={form.addressLine2}
              onChange={(e) => set("addressLine2", e.target.value)}
              placeholder="Apt / Suite (optional)"
              disabled={submitting}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="block md:col-span-2">
              <div className="mb-1 text-sm font-medium text-gray-800">City</div>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Eden Prairie"
                disabled={submitting}
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium text-gray-800">
                State
              </div>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                placeholder="MN"
                disabled={submitting}
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium text-gray-800">
                Postal Code
              </div>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
                placeholder="55347"
                disabled={submitting}
              />
            </label>
          </div>

          <label className="block md:max-w-md">
            <div className="mb-1 text-sm font-medium text-gray-800">
              Country
            </div>
            <input
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="United States"
              disabled={submitting}
            />
          </label>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-gray-900">Notes</div>
        <label className="block">
          <textarea
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={5}
            placeholder="Any notes about this client…"
            disabled={submitting}
          />
        </label>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
        >
          {submitting ? "Saving…" : primaryLabel}
        </button>
      </div>
    </form>
  );
}
