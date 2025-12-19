import { Client, SearchCriteria } from "./types";
import http from "../../api/http";

export async function listClients(
  criteria: Partial<SearchCriteria> = {}
): Promise<Client[]> {
  const params = new URLSearchParams();

  if (criteria.q) params.set("q", criteria.q);
  if (criteria.status && criteria.status !== "") params.set("status", criteria.status);

  const qs = params.toString();
  const url = qs ? `/api/clients?${qs}` : "/api/clients";

  const { data } = await http.get<Client[]>(url);
  return data;
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await http.get<Client>(`/api/clients/${id}`);
  return data;
}

export async function createClient(payload: Partial<Client>): Promise<Client> {
  const { data } = await http.post<Client>("/api/clients", payload);
  return data;
}

export async function updateClient(id: string, payload: Partial<Client>): Promise<Client> {
  const { data } = await http.put<Client>(`/api/clients/${id}`, payload);
  return data;
}

export async function deleteClient(id: string) {
  const { data } = await http.delete<{ ok: boolean }>(`/api/clients/${id}`);
  return data;
}
