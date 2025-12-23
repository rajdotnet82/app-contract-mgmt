import http from "../../api/http";
import { OrgAdminForInvoiceFrom } from "./types";

export type Invoice = {
  _id: string;
  orgId: string;
  number: string;
  status: "Draft" | "Sent" | "Paid" | "Void";
  currency: string;
  invoiceDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function listInvoices(params?: {
  q?: string;
  status?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const { data } = await http.get<Invoice[]>("/api/invoices", { params });
  return data;
}

export async function getInvoice(id: string) {
  const { data } = await http.get<Invoice>(`/api/invoices/${id}`);
  return data;
}

export async function createInvoice(payload: any) {
  const { data } = await http.post<Invoice>("/api/invoices", payload);
  return data;
}

export async function updateInvoice(id: string, payload: any) {
  const { data } = await http.put<Invoice>(`/api/invoices/${id}`, payload);
  return data;
}

export async function deleteInvoice(id: string) {
  const { data } = await http.delete<{ ok: boolean }>(`/api/invoices/${id}`);
  return data;
}

// Optional: only if you want UI button later
export async function purgeInvoices() {
  const { data } = await http.delete<{ ok: boolean; deletedCount: number }>(`/api/invoices/purge`);
  return data;
}

export async function listOrgAdminsForInvoiceFrom(): Promise<OrgAdminForInvoiceFrom[]> {
  try {
    // If you already have an endpoint for org admins, use it:
    // const { data } = await http.get<OrgAdminForInvoiceFrom[]>("/api/orgs/admins");
    // return data;

    // Safe fallback: just return the current user as the "From" option
    const { data } = await http.get<any>("/api/me");

    const name =
      data?.name ||
      data?.fullName ||
      [data?.firstName, data?.lastName].filter(Boolean).join(" ") ||
      data?.email ||
      "Me";

    return [
      {
        id: String(data?._id || data?.id || "me"),
        name,
        email: data?.email,
      },
    ];
  } catch {
    return [];
  }
}