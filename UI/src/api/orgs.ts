// src/api/orgs.ts
import http from "./http";

export type CreateOrgPayload = {
  name: string;
};

export type Org = {
  _id: string;
  name: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export async function createOrg(payload: CreateOrgPayload) {
  const { data } = await http.post<Org>("/api/orgs", payload);
  return data;
}

export async function getActiveOrg() {
  const { data } = await http.get<Org>("/api/orgs/active");
  return data;
}
