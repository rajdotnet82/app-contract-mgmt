import type { Invoice } from "./types";

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(n ?? 0);
  } catch {
    return `$${(n ?? 0).toFixed(2)}`;
  }
}

export default function InvoicePreview({ invoice }: { invoice: Invoice }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-1">
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {invoice.from?.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {invoice.from?.addressLine1}
            {invoice.from?.city ? `, ${invoice.from.city}` : ""}{" "}
            {invoice.from?.state ? invoice.from.state : ""}{" "}
            {invoice.from?.postalCode ? invoice.from.postalCode : ""}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {invoice.from?.phone}{" "}
            {invoice.from?.email ? ` • ${invoice.from.email}` : ""}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 w-full sm:w-[320px]">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Invoice</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {invoice.number}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600 dark:text-gray-300">Date</span>
            <span className="text-gray-900 dark:text-gray-100">
              {new Date(invoice.invoiceDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600 dark:text-gray-300">Due</span>
            <span className="text-gray-900 dark:text-gray-100">
              {invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString()
                : "—"}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-3">
            <span className="text-gray-600 dark:text-gray-300">
              Balance Due
            </span>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {money(invoice.balanceDue ?? 0, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Bill To
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
          <div className="font-medium">{invoice.billTo?.name}</div>
          <div>
            {invoice.billTo?.phone}{" "}
            {invoice.billTo?.email ? ` • ${invoice.billTo.email}` : ""}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-950 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {invoice.lineItems?.map((li, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 px-4 py-3 text-sm border-t border-gray-200 dark:border-gray-800"
          >
            <div className="col-span-6 whitespace-pre-line text-gray-900 dark:text-gray-100">
              {li.description}
            </div>
            <div className="col-span-2 text-right text-gray-700 dark:text-gray-300">
              {money(li.rate ?? 0, invoice.currency)}
            </div>
            <div className="col-span-2 text-right text-gray-700 dark:text-gray-300">
              {li.qty ?? 0}
            </div>
            <div className="col-span-2 text-right font-semibold text-gray-900 dark:text-gray-100">
              {money(
                (li.amount ?? (li.rate ?? 0) * (li.qty ?? 0)) as number,
                invoice.currency
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:justify-end">
        <div className="w-full sm:w-[320px] space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
            <span className="text-gray-900 dark:text-gray-100">
              {money(invoice.subtotal ?? 0, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Tax</span>
            <span className="text-gray-900 dark:text-gray-100">
              {money(invoice.taxAmount ?? 0, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-gray-900 dark:text-gray-100">
              {money(invoice.total ?? 0, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Paid</span>
            <span className="text-gray-900 dark:text-gray-100">
              {money(invoice.paidAmount ?? 0, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-gray-900 dark:text-gray-100">
              Balance Due
            </span>
            <span className="text-gray-900 dark:text-gray-100">
              {money(invoice.balanceDue ?? 0, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      {invoice.notes ? (
        <div className="mt-6 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {invoice.notes}
        </div>
      ) : null}
    </div>
  );
}
