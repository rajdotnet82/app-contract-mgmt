export type OrgSummary = {
  id: string;
  name: string;
  role: string; // "Owner" | "Admin" | "Member" etc.
};

export type MeResponse = {
  user: MeUser;
  orgs: OrgSummary[];
};
