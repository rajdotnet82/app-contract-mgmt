import { useState } from "react";
import { useNavigate } from "react-router";
import { createInvoice } from "./api";

export default function InvoiceCreatePage() {
  const nav = useNavigate();
  const [creating, setCreating] = useState(false);

  const create = async () => {
    setCreating(true);
    try {
      const now = new Date();
      const num = `INV${Math.floor(1000 + Math.random() * 9000)}`;
      const inv = await createInvoice({
        number: num,
        status: "Draft",
        currency: "USD",
        invoiceDate: now.toISOString(),
        from: { name: "Rajendran Thiagarajan" },
        billTo: { name: "" },
        lineItems: [{ description: "Photography", rate: 0, qty: 1 }],
        taxPercent: 0,
        paidAmount: 0,
        notes: "",
      });
      nav(`/invoices/${inv._id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        New invoice
      </div>
      <div className="mt-4">
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={create}
          disabled={creating}
        >
          {creating ? "Creating…" : "Create draft invoice"}
        </button>
      </div>
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
        This creates a Draft invoice, then opens it so you can edit and send.
      </div>
    </div>
  );
}
