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

export type Contract = {
  _id: string;

  // stable core fields (grid)
  contractNumber: string;
  clientName: string;
  eventType: string;
  eventDate?: string;
  status: ContractStatus;
  totalPrice?: number;
  retainerAmount?: number;
  signed?: boolean;

  // new flexible architecture
  templateId?: string;
  details?: Record<string, any>;

  createdAt?: string;
  updatedAt?: string;
};
