import http from "../../api/http";
import { OrgAdminUser } from "./types";

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

export async function listOrgAdminsForInvoiceFrom(): Promise<OrgAdminUser[]> {
  try {
    // If you already have an endpoint for org admins, use it:
    // const { data } = await http.get<OrgAdminForInvoiceFrom[]>("/api/orgs/admins");
    // return data;

    // Safe fallback: just return the current user as the "From" option
    const { data } = await http.get<any>("/api/me");
    const orgData = await http.get<any>("/api/orgs/active");

    //can we wait here?
    const orgName = orgData?.data?.name || "My Org";

    const user = data?.user || data;
    const name = orgName || user?.fullName || "Me";

    const result = [
      {
        id: String(user?._id || user?.id || "me"),
        fullName:name,
        email: user?.email,
        phone: user?.phone,
        address: {
          line1: user?.address?.line1,
          line2: user?.address?.line2,
          city: user?.address?.city,
          state: user?.address?.state,
          postalCode: user?.address?.postalCode,
          country: user?.address?.country,
        },
      },
    ];

    return result;
  } catch {
    return [];
  }
}