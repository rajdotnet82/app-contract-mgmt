// src/api/me.ts
import http from "./http";

export type Me = {
  userId: string;
  email?: string;
  name?: string;

  activeOrgId?: string | null;
  orgId?: string | null; // some backends use orgId instead
};

export async function getMe() {
  const { data } = await http.get<Me>("/api/me");
  return data;
}
