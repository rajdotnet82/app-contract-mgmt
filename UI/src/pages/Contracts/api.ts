import axios from "axios";
import type { Contract, SearchCriteria } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

const http = axios.create({
  baseURL: API_BASE,
});

export async function fetchContracts(criteria: SearchCriteria) {
  const params: any = {};
  if (criteria.q?.trim()) params.q = criteria.q.trim();
  if (criteria.status) params.status = criteria.status;

  const { data } = await http.get<Contract[]>("/api/contracts", { params });
  return data;
}

export async function getContractById(id: string) {
  const { data } = await http.get<Contract>(`/api/contracts/${id}`);
  return data;
}

export async function createContract(payload: Partial<Contract>) {
  const { data } = await http.post<Contract>("/api/contracts", payload);
  return data;
}

export async function updateContract(id: string, payload: Partial<Contract>) {
  const { data } = await http.put<Contract>(`/api/contracts/${id}`, payload);
  return data;
}

export async function deleteContract(id: string) {
  const { data } = await http.delete<{ ok: boolean }>(`/api/contracts/${id}`);
  return data;
}

export async function getContract(id: string): Promise<Contract> {
  const { data } = await http.get<Contract>(`/api/contracts/${id}`);
  return data;
}

export async function generateDraft(
  contractId: string,
  payload: {
    templateId: string;
    details: Record<string, any>;
  }
): Promise<Contract> {
  const { data } = await http.post<Contract>(
    `/api/contracts/${contractId}/generate-draft`,
    payload
  );
  return data;
}