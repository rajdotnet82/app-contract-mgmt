export type OrgSummary = {
  id: string;
  name: string;
  role: string; // "Owner" | "Admin" | "Member" etc.
};

export type MeResponse = {
  user: MeUser;
  orgs: OrgSummary[];
};

export type MeUser = {
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  bio?: string;
  locale?: string;
  address?: Address;
  activeOrgId?: string;

  // If you add this later in your DB user profile:
  avatarUrl?: string;
};

export type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};