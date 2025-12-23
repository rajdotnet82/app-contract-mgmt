// UI/src/pages/Invoices/InvoiceEditForm.tsx
import { useEffect, useMemo, useState } from "react";
import type { Client } from "../Clients/types";
import { listClients } from "../Clients/api";
import type { Invoice, InvoiceLineItem, InvoiceParty } from "./types";

function toNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clean(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : undefined;
}

function normalizeParty(p?: Partial<InvoiceParty>): InvoiceParty {
  return {
    name: String(p?.name ?? "").trim(),
    email: clean(p?.email),
    phone: clean(p?.phone),
    addressLine1: clean(p?.addressLine1),
    addressLine2: clean(p?.addressLine2),
    city: clean(p?.city),
    state: clean(p?.state),
    postalCode: clean(p?.postalCode),
    country: clean(p?.country),
    businessNumber: clean(p?.businessNumber),
    logoUrl: clean(p?.logoUrl),
  };
}

function clientToBillToParty(client: Client): InvoiceParty {
  return normalizeParty({
    name: (client.fullName || "").trim(),
    email: (client.email || "").trim(),
    phone: (client.phone || "").trim(),
    addressLine1: client.addressLine1,
    addressLine2: client.addressLine2,
    city: client.city,
    state: client.state,
    postalCode: client.postalCode,
    country: client.country,
  });
}

function ensureInvoiceDefaults(inv: Invoice): Invoice {
  return {
    ...inv,
    from: inv.from ? normalizeParty(inv.from) : normalizeParty({ name: "" }),
    billTo: inv.billTo
      ? normalizeParty(inv.billTo)
      : normalizeParty({ name: "" }),
    lineItems: Array.isArray(inv.lineItems) ? inv.lineItems : [],
    taxPercent: inv.taxPercent ?? 0,
    paidAmount: inv.paidAmount ?? 0,
  };
}

export default function InvoiceEditForm({
  invoice,
  saving,
  onSave,
}: {
  invoice: Invoice;
  saving: boolean;
  onSave: (patch: Partial<Invoice>) => void;
}) {
  const [draft, setDraft] = useState<Invoice>(() =>
    ensureInvoiceDefaults(invoice)
  );

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(ensureInvoiceDefaults(invoice));
  }, [invoice]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingLookups(true);
        setLookupError(null);

        const c = await listClients({});
        if (cancelled) return;
        setClients(c ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setLookupError(e?.message ?? "Failed to load clients");
      } finally {
        if (!cancelled) setLoadingLookups(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // best-effort: if invoice has billTo email but no clientId, match it
  useEffect(() => {
    if (loadingLookups) return;
    if (!clients.length) return;

    setDraft((d) => {
      const next = ensureInvoiceDefaults(d);

      if (!next.clientId && next.billTo?.email) {
        const target = next.billTo.email.toLowerCase();
        const match = clients.find(
          (c) => (c.email || "").toLowerCase() === target
        );
        if (match) {
          return {
            ...next,
            clientId: match._id,
            billTo: clientToBillToParty(match),
          };
        }
      }
      return next;
    });
  }, [loadingLookups, clients]);

  const computed = useMemo(() => {
    const lineItems = (draft.lineItems ?? []).map((li) => {
      const rate = toNum(li.rate, 0);
      const qty = toNum(li.qty, 0);
      const amount = Number((rate * qty).toFixed(2));
      return { ...li, amount };
    });

    const subtotal = Number(
      lineItems.reduce((s, x) => s + (x.amount ?? 0), 0).toFixed(2)
    );
    const taxPercent = toNum(draft.taxPercent, 0);
    const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));
    const paidAmount = toNum(draft.paidAmount, 0);
    const balanceDue = Number((total - paidAmount).toFixed(2));

    return { lineItems, subtotal, taxAmount, total, balanceDue };
  }, [draft.lineItems, draft.taxPercent, draft.paidAmount]);

  const updateLine = (idx: number, patch: Partial<InvoiceLineItem>) => {
    const next = [...(draft.lineItems ?? [])];
    next[idx] = { ...next[idx], ...patch };
    setDraft({ ...draft, lineItems: next });
  };

  const addLine = () => {
    setDraft({
      ...draft,
      lineItems: [
        ...(draft.lineItems ?? []),
        { description: "", rate: 0, qty: 1 },
      ],
    });
  };

  const removeLine = (idx: number) => {
    const next = [...(draft.lineItems ?? [])];
    next.splice(idx, 1);
    setDraft({ ...draft, lineItems: next });
  };

  const onSelectClient = (clientId: string) => {
    const client = clients.find((c) => c._id === clientId);
    if (!client) {
      setDraft({
        ...draft,
        clientId: clientId || undefined,
        billTo: normalizeParty(draft.billTo),
      });
      return;
    }
    setDraft({
      ...draft,
      clientId: client._id,
      billTo: clientToBillToParty(client),
    });
  };

  const save = () => {
    onSave({
      clientId: draft.clientId,
      number: draft.number,
      status: draft.status,
      invoiceDate: draft.invoiceDate,
      dueDate: draft.dueDate,
      terms: draft.terms,
      currency: draft.currency,

      // from snapshot comes from backend hydration now
      from: draft.from,
      billTo: draft.billTo,

      lineItems: computed.lineItems,
      taxPercent: toNum(draft.taxPercent, 0),
      paidAmount: toNum(draft.paidAmount, 0),
      notes: draft.notes,

      subtotal: computed.subtotal,
      taxAmount: computed.taxAmount,
      total: computed.total,
      balanceDue: computed.balanceDue,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
      {lookupError ? (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {lookupError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Invoice #
          </label>
          <input
            value={draft.number}
            onChange={(e) => setDraft({ ...draft, number: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Invoice Date
          </label>
          <input
            type="date"
            value={(draft.invoiceDate ?? "").slice(0, 10)}
            onChange={(e) =>
              setDraft({ ...draft, invoiceDate: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Due Date
          </label>
          <input
            type="date"
            value={(draft.dueDate ?? "").slice(0, 10)}
            onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            From
          </div>

          <input
            placeholder="Name"
            value={draft.from?.name ?? ""}
            readOnly
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={draft.from?.email ?? ""}
            readOnly
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Phone"
            value={draft.from?.phone ?? ""}
            readOnly
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Address"
            value={draft.from?.addressLine1 ?? ""}
            readOnly
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm"
          />
        </section>

        <section className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Bill To
          </div>

          <div>
            <label className="text-xs text-gray-600 dark:text-gray-300">
              Select client
            </label>
            <select
              value={draft.clientId ?? ""}
              onChange={(e) => onSelectClient(e.target.value)}
              disabled={saving || loadingLookups}
              className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
            >
              <option value="">Select Bill To</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          <input
            placeholder="Client name"
            value={draft.billTo?.name ?? ""}
            readOnly
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={draft.billTo?.email ?? ""}
            readOnly
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Phone"
            value={draft.billTo?.phone ?? ""}
            readOnly
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Address"
            value={draft.billTo?.addressLine1 ?? ""}
            readOnly
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm"
          />
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Line items
          </div>
          <button
            className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm"
            onClick={addLine}
            type="button"
          >
            Add line
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-950 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {(draft.lineItems ?? []).map((li, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="col-span-6">
                <textarea
                  value={li.description ?? ""}
                  onChange={(e) =>
                    updateLine(idx, { description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={li.rate ?? 0}
                  onChange={(e) =>
                    updateLine(idx, { rate: toNum(e.target.value, 0) })
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-right"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={li.qty ?? 0}
                  onChange={(e) =>
                    updateLine(idx, { qty: toNum(e.target.value, 0) })
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-right"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm"
                  onClick={() => removeLine(idx)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Tax %
          </label>
          <input
            type="number"
            value={draft.taxPercent ?? 0}
            onChange={(e) =>
              setDraft({ ...draft, taxPercent: toNum(e.target.value, 0) })
            }
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Paid amount
          </label>
          <input
            type="number"
            value={draft.paidAmount ?? 0}
            onChange={(e) =>
              setDraft({ ...draft, paidAmount: toNum(e.target.value, 0) })
            }
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Status
          </label>
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft({ ...draft, status: e.target.value as any })
            }
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          >
            <option>Draft</option>
            <option>Sent</option>
            <option>Paid</option>
            <option>Void</option>
          </select>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Total
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {computed.total.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Balance due: {computed.balanceDue.toFixed(2)}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Notes
        </div>
        <textarea
          value={draft.notes ?? ""}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          rows={4}
        />
      </section>

      <div className="flex justify-end gap-2">
        <button
          className="rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm"
          type="button"
          onClick={() => setDraft(ensureInvoiceDefaults(invoice))}
          disabled={saving}
        >
          Reset
        </button>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
          type="button"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
