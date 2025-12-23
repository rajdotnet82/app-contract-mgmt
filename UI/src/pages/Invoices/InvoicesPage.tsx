import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listInvoices, type Invoice } from "./api";
import { isOrgRequiredError } from "../../api/errors";

export default function InvoicesPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [orgRequired, setOrgRequired] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setOrgRequired(false);

        const data = await listInvoices({
          sortBy: "invoiceDate",
          sortDir: "desc",
        });
        if (cancelled) return;

        setItems(data);
      } catch (e: any) {
        if (cancelled) return;

        if (isOrgRequiredError(e)) {
          setOrgRequired(true);
          setItems([]);
          return;
        }

        setError(
          e?.response?.data?.message || e?.message || "Failed to load invoices"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Invoices</h2>
        <div>Loading…</div>
      </div>
    );
  }

  if (orgRequired) {
    return (
      <div style={{ padding: 24, maxWidth: 720 }}>
        <h2 style={{ marginBottom: 8 }}>Organization Required</h2>
        <p style={{ marginBottom: 16 }}>
          You must create or join an organization before viewing invoices.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/profile")}>Go to Profile</button>
          <button onClick={() => navigate("/invites")}>Accept Invite</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Invoices</h2>
        <div style={{ marginTop: 12, marginBottom: 12 }}>{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const statusOptions = Array.from(
    new Set(items.map((inv) => inv.status).filter(Boolean))
  ).sort();
  const visibleItems = statusFilter
    ? items.filter((inv) => (inv.status || "") === statusFilter)
    : items;

  return (
    <div className="space-y-4">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 className="text-lg font-semibold">Invoices</h1>
        <button
          className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-60"
          onClick={() => navigate("/invoices/new")}
        >
          New Invoice
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by status"
          style={{
            width: "100%",
            maxWidth: 320,
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 16 }}>
        {visibleItems.length === 0 ? (
          <div>
            {items.length === 0
              ? "No invoices yet."
              : "No invoices match that status."}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {visibleItems.map((inv) => (
              <div
                key={inv._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 12,
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/invoices/${inv._id}`)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{inv.number}</div>
                  <div>{inv.status}</div>
                </div>

                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                  Date: {new Date(inv.invoiceDate).toLocaleDateString()}
                  {inv.dueDate
                    ? ` • Due: ${new Date(inv.dueDate).toLocaleDateString()}`
                    : ""}
                </div>

                <div style={{ marginTop: 6 }}>
                  Total: {inv.currency} {inv.total.toFixed(2)} • Balance:{" "}
                  {inv.currency} {inv.balanceDue.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
