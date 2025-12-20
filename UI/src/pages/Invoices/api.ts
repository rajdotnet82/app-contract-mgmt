import http from "../../api/http";
import type { Invoice, InvoiceSearchCriteria, InvoiceStatus } from "./types";

export async function fetchInvoices(criteria: InvoiceSearchCriteria) {
  const params: any = {};
  if (criteria.q?.trim()) params.q = criteria.q.trim();

  // Map tabs → backend filters
  if (criteria.tab === "Paid") params.status = "Paid" satisfies InvoiceStatus;
  if (criteria.tab === "Outstanding") params.status = "Sent" satisfies InvoiceStatus;

  const { data } = await http.get<Invoice[]>("/api/invoices", { params });

  // “Outstanding” should only show balanceDue > 0
  if (criteria.tab === "Outstanding") {
    return data.filter((x) => (x.balanceDue ?? 0) > 0);
  }

  return data;
}

export async function getInvoice(id: string) {
  const { data } = await http.get<Invoice>(`/api/invoices/${id}`);
  return data;
}

export async function createInvoice(payload: Partial<Invoice>) {
  const { data } = await http.post<Invoice>("/api/invoices", payload);
  return data;
}

export async function updateInvoice(id: string, payload: Partial<Invoice>) {
  const { data } = await http.put<Invoice>(`/api/invoices/${id}`, payload);
  return data;
}

export async function deleteInvoice(id: string) {
  const { data } = await http.delete<{ ok: boolean }>(`/api/invoices/${id}`);
  return data;
}
