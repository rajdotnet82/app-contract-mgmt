import axios from "axios";
import type { Template, TemplateSearchCriteria } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

const http = axios.create({
  baseURL: API_BASE,
});

export async function fetchTemplates(criteria: TemplateSearchCriteria) {
  const params: any = {};
  if (criteria.q?.trim()) params.q = criteria.q.trim();

  const { data } = await http.get<Template[]>("/api/templates", { params });
  return data;
}

export async function getTemplateById(id: string) {
  const { data } = await http.get<Template>(`/api/templates/${id}`);
  return data;
}

export async function createTemplate(payload: Partial<Template>) {
  const { data } = await http.post<Template>("/api/templates", payload);
  return data;
}

export async function updateTemplate(id: string, payload: Partial<Template>) {
  const { data } = await http.put<Template>(`/api/templates/${id}`, payload);
  return data;
}

export async function deleteTemplate(id: string) {
  const { data } = await http.delete<{ ok: true }>(`/api/templates/${id}`);
  return data;
}

export async function listTemplates(
  criteria: { q?: string } = {}
): Promise<Template[]> {
  const params = new URLSearchParams();

  if (criteria.q) {
    params.set("q", criteria.q);
  }

  const qs = params.toString();
  const url = qs ? `/api/templates?${qs}` : "/api/templates";

  const { data } = await http.get<Template[]>(url);
  return data;
}
