import http from "../../api/http";

export type OrgProfile = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  businessNumber?: string;
  website?: string;
  logoUrl?: string;
};

export async function getActiveOrg() {
  const { data } = await http.get<OrgProfile>("/api/orgs/active");
  return data;
}

export async function updateActiveOrg(payload: Partial<OrgProfile>) {
  const { data } = await http.put<OrgProfile>("/api/orgs/active", payload);
  return data;
}
