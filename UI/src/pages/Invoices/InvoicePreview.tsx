import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import type { Invoice } from "./types";
import { toAssetUrl } from "../../utils/assetUrl";

/**
 * InvoicePreview
 * - Uses active org branding: GET /api/orgs/active => { name, logoUrl }
 * - Renders a printable invoice preview that also works for "PDF" (window.print / print-to-pdf)
 */

type OrgBranding = {
  _id?: string;
  name: string;
  logoUrl?: string;
};

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    // fallback
    return `${currency} ${n.toFixed(2)}`;
  }
}

function fmtDate(isoOrDate?: string) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return isoOrDate;
  return d.toLocaleDateString();
}

export default function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const [org, setOrg] = useState<OrgBranding | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setOrgError(null);
        const res = await http.get<OrgBranding>("/api/orgs/active");
        if (!cancelled) setOrg(res.data);
      } catch (e: any) {
        if (!cancelled)
          setOrgError(
            e?.response?.data?.error ??
              e?.message ??
              "Failed to load organization"
          );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const computed = useMemo(() => {
    const items = (invoice.lineItems ?? []).map((li) => {
      const rate = Number(li.rate ?? 0);
      const qty = Number(li.qty ?? 0);
      const amount = Number.isFinite(li.amount as any)
        ? Number(li.amount)
        : rate * qty;
      return { ...li, rate, qty, amount };
    });

    const subtotal = Number(
      invoice.subtotal ?? items.reduce((s, x) => s + (x.amount ?? 0), 0)
    );
    const taxAmount = Number(invoice.taxAmount ?? 0);
    const total = Number(invoice.total ?? subtotal + taxAmount);
    const paid = Number(invoice.paidAmount ?? 0);
    const balanceDue = Number(invoice.balanceDue ?? Math.max(0, total - paid));

    return { items, subtotal, taxAmount, total, paid, balanceDue };
  }, [invoice]);

  const headerName = org?.name?.trim()
    ? org.name
    : invoice.from?.name || "Invoice";
  const logoUrl = org?.logoUrl?.trim() ? org.logoUrl : invoice.from?.logoUrl;

  return (
    <div className="bg-white text-gray-900 p-8 rounded-xl border border-gray-200">
      {/* Minimal print tweaks */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      {orgError ? (
        <div className="no-print mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {orgError} (Using invoice header fallback)
        </div>
      ) : null}

      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {logoUrl ? (
              <img
                src={toAssetUrl(logoUrl)}
                alt="Logo"
                className="h-16 w-auto object-contain"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                Logo
              </div>
            )}
          </div>

          <div>
            <div className="text-xl font-semibold">{headerName}</div>

            {/* From snapshot (contact details) */}
            <div className="mt-1 space-y-1 text-sm text-gray-700">
              {invoice.from?.addressLine1 ? (
                <div>{invoice.from.addressLine1}</div>
              ) : null}
              {invoice.from?.addressLine2 ? (
                <div>{invoice.from.addressLine2}</div>
              ) : null}

              {invoice.from?.city ||
              invoice.from?.state ||
              invoice.from?.postalCode ? (
                <div>
                  {[
                    invoice.from?.city,
                    invoice.from?.state,
                    invoice.from?.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              ) : null}

              {invoice.from?.phone ? <div>{invoice.from.phone}</div> : null}
              {invoice.from?.email ? <div>{invoice.from.email}</div> : null}
            </div>
          </div>
        </div>

        <div className="text-right min-w-[220px]">
          <div className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Invoice
          </div>
          <div className="mt-1 text-lg font-semibold">{invoice.number}</div>

          <div className="mt-3 text-xs uppercase tracking-wide text-gray-500">
            Date
          </div>
          <div className="text-sm">{fmtDate(invoice.invoiceDate)}</div>

          <div className="mt-3 text-xs uppercase tracking-wide text-gray-500">
            Due
          </div>
          <div className="text-sm">
            {invoice.dueDate
              ? fmtDate(invoice.dueDate)
              : invoice.terms || "On receipt"}
          </div>

          <div className="mt-3 text-xs uppercase tracking-wide text-gray-500">
            Balance Due
          </div>
          <div className="text-sm font-semibold">
            {money(computed.balanceDue, invoice.currency)}
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* Bill To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Bill To
          </div>
          <div className="mt-2 text-lg font-semibold">
            {invoice.billTo?.name || "-"}
          </div>

          <div className="mt-2 space-y-1 text-sm text-gray-700">
            {invoice.billTo?.addressLine1 ? (
              <div>{invoice.billTo.addressLine1}</div>
            ) : null}
            {invoice.billTo?.addressLine2 ? (
              <div>{invoice.billTo.addressLine2}</div>
            ) : null}
            {invoice.billTo?.city ||
            invoice.billTo?.state ||
            invoice.billTo?.postalCode ? (
              <div>
                {[
                  invoice.billTo?.city,
                  invoice.billTo?.state,
                  invoice.billTo?.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            ) : null}
            {invoice.billTo?.phone ? <div>{invoice.billTo.phone}</div> : null}
            {invoice.billTo?.email ? <div>{invoice.billTo.email}</div> : null}
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* Line Items */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {computed.items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500">No line items</div>
        ) : (
          computed.items.map((li, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-gray-200 text-sm"
            >
              <div className="col-span-6 whitespace-pre-wrap">
                {li.description}
              </div>
              <div className="col-span-2 text-right">
                {money(li.rate, invoice.currency)}
              </div>
              <div className="col-span-2 text-right">{li.qty}</div>
              <div className="col-span-2 text-right">
                {money(li.amount ?? 0, invoice.currency)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <div className="text-gray-600">Subtotal</div>
            <div className="font-medium">
              {money(computed.subtotal, invoice.currency)}
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-gray-600">Tax</div>
            <div className="font-medium">
              {money(computed.taxAmount, invoice.currency)}
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-2">
            <div className="text-gray-800 font-semibold">Total</div>
            <div className="text-gray-900 font-semibold">
              {money(computed.total, invoice.currency)}
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-gray-600">Paid</div>
            <div className="font-medium">
              {money(computed.paid, invoice.currency)}
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-2">
            <div className="text-gray-800 font-semibold">Balance Due</div>
            <div className="text-lg font-semibold">
              {money(computed.balanceDue, invoice.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Notes / Payment instructions */}
      {(invoice.notes ?? "").trim() ? (
        <div className="mt-10 text-sm text-gray-700 whitespace-pre-wrap">
          {invoice.notes}
        </div>
      ) : null}
    </div>
  );
}
