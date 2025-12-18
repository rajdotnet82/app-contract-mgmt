export type ClientType = "individual" | "couple" | "business";
export type ClientStatus = "Lead" | "Active" | "Past" | "VIP" | "Cold";

export type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type SecondaryContact = {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
};

export type SearchCriteria = {
  q: string;
  status?: ClientStatus | "";
};

export type Client = {
  _id: string;

  clientType: ClientType;

  displayName: string;

  primaryContactName: string;
  primaryEmail: string;
  primaryPhone?: string;

  partnerName?: string; // couple
  companyName?: string; // business

  billingName?: string;
  billingEmail?: string;
  billingPhone?: string;

  address?: Address;
  secondaryContacts?: SecondaryContact[];

  category?: string;
  referralSource?: string;
  communicationPreference?: string;
  instagramHandle?: string;
  preferredLanguage?: string;

  status: ClientStatus;
  tags?: string[];
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
};
