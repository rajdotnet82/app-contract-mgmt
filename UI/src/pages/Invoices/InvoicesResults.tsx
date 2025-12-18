import { Link } from "react-router";
import type { Invoice } from "./types";

function fmtMoney(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(n ?? 0);
  } catch {
    return `$${(n ?? 0).toFixed(2)}`;
  }
}

function yearOf(d: string) {
  const dt = new Date(d);
  return Number.isFinite(dt.getTime()) ? dt.getFullYear() : 0;
}

export default function InvoicesResults({
  items,
  loading,
  error,
  onDelete,
}: {
  items: Invoice[];
  loading: boolean;
  error: string;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-300">Loading…</div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
  );

  const groups = new Map<number, Invoice[]>();
  for (const inv of sorted) {
    const y = yearOf(inv.invoiceDate);
    groups.set(y, [...(groups.get(y) ?? []), inv]);
  }

  const years = Array.from(groups.keys()).sort((a, b) => b - a);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {years.map((y) => {
          const rows = groups.get(y) ?? [];
          const yearTotal = rows.reduce((s, x) => s + (x.balanceDue ?? 0), 0);
          const currency = rows[0]?.currency ?? "USD";

          return (
            <div key={y}>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-950">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {y}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {fmtMoney(yearTotal, currency)}
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {rows.map((inv) => (
                  <div
                    key={inv._id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-950"
                  >
                    <Link
                      to={`/invoices/${inv._id}`}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {inv.number}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {inv.billTo?.name ?? "—"}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(inv.invoiceDate).toLocaleDateString()} •{" "}
                        {inv.status}
                      </div>
                    </Link>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-28 text-right">
                        {fmtMoney(inv.balanceDue ?? 0, inv.currency)}
                      </div>

                      <div className="relative">
                        <button
                          className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => onDelete(inv._id)}
                          title="Delete"
                        >
                          ⋯
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {years.length === 0 && (
          <div className="px-4 py-8 text-sm text-gray-600 dark:text-gray-300">
            No invoices found.
          </div>
        )}
      </div>
    </div>
  );
}
