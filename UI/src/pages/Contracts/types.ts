export type ContractStatus =
  | "Draft"
  | "Sent"
  | "Signed"
  | "Completed"
  | "Cancelled";

export type Contract = {
  _id: string;
  contractNumber: string;
  clientName: string;
  eventType: string;
  eventDate?: string;
  status: ContractStatus;
  packageName?: string;
  totalPrice: number;
  retainerAmount: number;
  signed: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SearchCriteria = {
  q: string;
  status?: ContractStatus | "";
};
