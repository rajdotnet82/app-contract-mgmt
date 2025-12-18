import { useCallback, useEffect, useState } from "react";
import InvoicesSearch from "./InvoicesSearch";
import InvoicesResults from "./InvoicesResults";
import type { Invoice, InvoiceSearchCriteria } from "./types";
import { fetchInvoices, deleteInvoice } from "./api";

export default function InvoicesPage() {
  const [criteria, setCriteria] = useState<InvoiceSearchCriteria>({
    q: "",
    tab: "All",
  });
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (c: InvoiceSearchCriteria) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInvoices(c);
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(criteria);
  }, [criteria, load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      await deleteInvoice(id);
      await load(criteria);
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <InvoicesSearch criteria={criteria} onChange={setCriteria} />
      <InvoicesResults
        items={items}
        loading={loading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  );
}
