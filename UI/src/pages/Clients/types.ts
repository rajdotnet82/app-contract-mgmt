export type Client = {
  _id: string;
  orgId: string;

  fullName: string;
  firstName?: string;
  lastName?: string;

  email?: string;
  phone?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  notes?: string;

  createdAt?: string;
  updatedAt?: string;
};

export type ClientCreateInput = Partial<
  Omit<Client, "_id" | "orgId" | "createdAt" | "updatedAt">
> & { fullName?: string };

export type ClientUpdateInput = Partial<
  Omit<Client, "_id" | "orgId" | "createdAt" | "updatedAt">
>;
