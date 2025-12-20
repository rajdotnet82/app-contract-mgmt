import http from "../../api/http";

export async function updateOrg(orgId: string, payload: { name: string }) {
  const { data } = await http.put<{ ok: boolean; org: { id: string; name: string } }>(
    `/api/orgs/${orgId}`,
    payload
  );
  return data;
}
