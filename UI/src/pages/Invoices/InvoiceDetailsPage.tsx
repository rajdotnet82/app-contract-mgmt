import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { getInvoice, updateInvoice } from "./api";
import type { Invoice } from "./types";
import InvoicePreview from "./InvoicePreview";
import InvoiceEditForm from "./InvoiceEditForm";

type Tab = "Preview" | "Edit";

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [tab, setTab] = useState<Tab>("Preview");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => invoice?.number ?? "Invoice", [invoice]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    getInvoice(id)
      .then(setInvoice)
      .catch((e: any) => setError(e?.message ?? "Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async (patch: Partial<Invoice>) => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await updateInvoice(id, patch);
      setInvoice(updated);
      setTab("Preview");
    } catch (e: any) {
      alert(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-sm text-gray-600 dark:text-gray-300">Loading…</div>
    );
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!invoice) return null;

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm ${
      active
        ? "bg-black text-white dark:bg-white dark:text-black"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/invoices"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Invoices
          </Link>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={tabClass(tab === "Preview")}
            onClick={() => setTab("Preview")}
          >
            Preview
          </button>
          <button
            className={tabClass(tab === "Edit")}
            onClick={() => setTab("Edit")}
          >
            Edit
          </button>

          <button
            className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm"
            onClick={() => window.print()}
            title="Print/PDF (basic)"
          >
            PDF
          </button>

          <button
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            onClick={() => alert("Email invoice: coming next")}
          >
            Email Invoice
          </button>
        </div>
      </div>

      {tab === "Preview" ? (
        <InvoicePreview invoice={invoice} />
      ) : (
        <InvoiceEditForm invoice={invoice} saving={saving} onSave={onSave} />
      )}
    </div>
  );
}
