// UI/src/pages/Contracts/types.ts

export type ContractStatus =
  | "Draft"
  | "Sent"
  | "Signed"
  | "Completed"
  | "Cancelled";

export type SearchCriteria = {
  q: string;
  status?: ContractStatus | "";
};

export type ContractDocumentStatus = "Draft" | "Sent" | "Signed";

export type ContractDocument = {
  _id?: string;
  title: string;
  templateId?: string;
  contentHtml: string;
  status: ContractDocumentStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type Contract = {
  _id: string;

  // core fields
  contractNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;

  eventType: string;
  eventDate?: string;
  status: ContractStatus;
  totalPrice?: number;
  retainerAmount?: number;
  signed?: boolean;

  // dynamic/template-driven
  templateId?: string;
  details?: Record<string, any>;

  // generated documents (optional, for drafts)
  documents?: ContractDocument[];

  createdAt?: string;
  updatedAt?: string;
};
