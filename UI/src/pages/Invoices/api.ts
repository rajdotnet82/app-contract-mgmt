// UI/src/pages/Invoices/api.ts
import http from "../../api/http";
import type { Invoice, InvoiceParty } from "./types";

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

// Optional helper if you still want org details in UI (not required after backend hydration)
export async function getActiveOrgForInvoiceFrom() {
  const { data } = await http.get<InvoiceParty>("/api/orgs/active");
  return data;
}
