import { useMemo, useState } from "react";
import type { Invoice, InvoiceLineItem } from "./types";

function toNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
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
  const [draft, setDraft] = useState<Invoice>(invoice);

  const computed = useMemo(() => {
    const lineItems = (draft.lineItems ?? []).map((li) => {
      const rate = toNum(li.rate, 0);
      const qty = toNum(li.qty, 0);
      const amount = Number((rate * qty).toFixed(2));
      return { ...li, amount };
    });

    return { lineItems };
  }, [draft.lineItems]);

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

  const save = () => {
    // send only fields user edits, but easiest is to send draft partial
    onSave({
      number: draft.number,
      status: draft.status,
      invoiceDate: draft.invoiceDate,
      dueDate: draft.dueDate,
      terms: draft.terms,
      currency: draft.currency,
      from: draft.from,
      billTo: draft.billTo,
      lineItems: computed.lineItems,
      taxPercent: draft.taxPercent ?? 0,
      paidAmount: draft.paidAmount ?? 0,
      notes: draft.notes,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
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
            value={draft.invoiceDate?.slice(0, 10)}
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
            onChange={(e) =>
              setDraft({
                ...draft,
                from: { ...draft.from, name: e.target.value },
              })
            }
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={draft.from?.email ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                from: { ...draft.from, email: e.target.value },
              })
            }
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Phone"
            value={draft.from?.phone ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                from: { ...draft.from, phone: e.target.value },
              })
            }
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Address"
            value={draft.from?.addressLine1 ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                from: { ...draft.from, addressLine1: e.target.value },
              })
            }
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
        </section>

        <section className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Bill To
          </div>
          <input
            placeholder="Client name"
            value={draft.billTo?.name ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                billTo: { ...draft.billTo, name: e.target.value },
              })
            }
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={draft.billTo?.email ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                billTo: { ...draft.billTo, email: e.target.value },
              })
            }
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Phone"
            value={draft.billTo?.phone ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                billTo: { ...draft.billTo, phone: e.target.value },
              })
            }
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <input
            placeholder="Address"
            value={draft.billTo?.addressLine1 ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                billTo: { ...draft.billTo, addressLine1: e.target.value },
              })
            }
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
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

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          onClick={() => setDraft(invoice)}
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
