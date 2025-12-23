import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { createInvoice, listOrgAdminsForInvoiceFrom } from "./api";
import type { InvoiceParty, OrgAdminUser } from "./types";

function adminToFromParty(admin: OrgAdminUser): InvoiceParty {
  const a = admin.address ?? {};
  return {
    name: admin.fullName || admin.email || "Me",
    email: admin.email,
    phone: admin.phone,
    addressLine1: a.line1,
    addressLine2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
  };
}

export default function InvoiceCreatePage() {
  const nav = useNavigate();
  const [creating, setCreating] = useState(false);
  const [defaultFrom, setDefaultFrom] = useState<InvoiceParty | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const admins = await listOrgAdminsForInvoiceFrom();
        if (cancelled) return;
        if (admins?.length) {
          setDefaultFrom(adminToFromParty(admins[0]));
        }
      } catch {
        if (!cancelled) setDefaultFrom(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const create = async () => {
    setCreating(true);
    try {
      // Let the backend generate safe defaults (number, invoiceDate, from/billTo names)
      // so UI doesn’t need hardcoded values.
      const inv = await createInvoice({
        status: "Draft",
        currency: "USD",
        from: defaultFrom ?? undefined,
        lineItems: [{ description: "", rate: 0, qty: 1 }],
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
