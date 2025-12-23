import http from "../../api/http";
import type { Client, ClientCreateInput, ClientUpdateInput } from "./types";

export async function listClients(params?: { q?: string }) {
  const { data } = await http.get<Client[]>("/api/clients", { params });
  return data;
}

export async function getClient(id: string) {
  const { data } = await http.get<Client>(`/api/clients/${id}`);
  return data;
}

export async function createClient(payload: ClientCreateInput) {
  const { data } = await http.post<Client>("/api/clients", payload);
  return data;
}

export async function updateClient(id: string, payload: ClientUpdateInput) {
  const { data } = await http.put<Client>(`/api/clients/${id}`, payload);
  return data;
}

export async function deleteClient(id: string) {
  const { data } = await http.delete<{ ok: boolean }>(`/api/clients/${id}`);
  return data;
}
