export type InvoiceDraft = {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  currency: "USDC" | "EURC";
  paymentMode: "Milestone escrow" | "Direct payment";
  dueDate: string;
  reference: string;
  description: string;
  milestones: Array<{
    id: string;
    title: string;
    amount: string;
    detail: string;
  }>;
  splits: Array<{
    id: string;
    member: string;
    percent: number;
  }>;
  createdAt: string;
  status: "Draft";
};

export type RemoteInvoiceDraftRow = {
  id: string;
  owner_id: string;
  title: string;
  client_name: string;
  client_email: string;
  amount: number | null;
  currency: "USDC" | "EURC";
  payment_mode: "Milestone escrow" | "Direct payment";
  due_date: string | null;
  reference: string | null;
  description: string | null;
  milestones: InvoiceDraft["milestones"];
  splits: InvoiceDraft["splits"];
  status: string;
  created_at: string;
  updated_at: string;
};
