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
