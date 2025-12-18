import { Link } from "react-router";
import type { InvoiceSearchCriteria, InvoiceTab } from "./types";

export default function InvoicesSearch({
  criteria,
  onChange,
}: {
  criteria: InvoiceSearchCriteria;
  onChange: (next: InvoiceSearchCriteria) => void;
}) {
  const setTab = (tab: InvoiceTab) => onChange({ ...criteria, tab });
  const setQ = (q: string) => onChange({ ...criteria, q });

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm ${
      active
        ? "bg-black text-white dark:bg-white dark:text-black"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
    }`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            className={tabClass(criteria.tab === "All")}
            onClick={() => setTab("All")}
          >
            All invoices
          </button>
          <button
            className={tabClass(criteria.tab === "Outstanding")}
            onClick={() => setTab("Outstanding")}
          >
            Outstanding
          </button>
          <button
            className={tabClass(criteria.tab === "Paid")}
            onClick={() => setTab("Paid")}
          >
            Paid
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={criteria.q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by client name"
            className="w-full sm:w-80 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
          />
          <Link
            to="/invoices/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            New invoice
          </Link>
        </div>
      </div>
    </div>
  );
}
