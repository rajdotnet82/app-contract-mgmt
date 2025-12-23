// UI/src/pages/Invoices/InvoicesPage.tsx
import { useEffect, useState } from "react";
import { listInvoices, deleteInvoice } from "./api";
import type { Invoice } from "./types";
import InvoicesSearch from "./InvoicesSearch";
import InvoicesResults from "./InvoicesResults";

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listInvoices({ q });
      setItems(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      await deleteInvoice(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <InvoicesSearch q={q} onChange={setQ} onSearch={load} />
      <InvoicesResults
        items={items}
        loading={loading}
        error={error}
        onDelete={onDelete}
      />
    </div>
  );
}
