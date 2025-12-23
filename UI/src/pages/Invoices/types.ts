// UI/src/pages/Invoices/types.ts
export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Void";

export type InvoiceTab = "All" | "Outstanding" | "Paid";

export type InvoiceSearchCriteria = {
  q: string;
  tab: InvoiceTab;
};

export type InvoiceLineItem = {
  description: string;
  rate: number;
  qty: number;
  amount?: number;
};

export type InvoiceParty = {
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
  logoUrl?: string;
};

export type Invoice = {
  _id: string;
  orgId: string;

  // legacy, keep optional (backend may still store it)
  fromUserId?: string;
  clientId?: string;

  number: string;
  status: InvoiceStatus;

  currency: string;
  invoiceDate: string;
  dueDate?: string;
  terms?: string;

  // ✅ optional so list endpoints / older docs don't break build
  from?: InvoiceParty;
  billTo?: InvoiceParty;
  lineItems?: InvoiceLineItem[];

  taxPercent?: number;
  subtotal: number;
  taxAmount: number;
  total: number;

  paidAmount: number;
  balanceDue: number;

  notes?: string;

  createdAt?: string;
  updatedAt?: string;
};
