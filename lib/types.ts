export type InvoiceWorkflowStatus = "Draft" | "Sent" | "In escrow" | "Completed";

export type InvoiceDraft = {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientId?: string | null;
  workspaceName?: string | null;
  amount: string;
  escrowStatus?: "draft" | "created" | "awaiting_funding" | "funded" | "release_requested" | "released";
  escrowAddress?: string | null;
  fundingTxHash?: string | null;
  releaseTxHash?: string | null;
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
  status: InvoiceWorkflowStatus;
  freelancerWallet?: string | null;
};

export type RemoteInvoiceDraftRow = {
  id: string;
  owner_id: string;
  client_id?: string | null;
  workspace_name?: string | null;
  escrow_status?: "draft" | "created" | "awaiting_funding" | "funded" | "release_requested" | "released";
  escrow_address?: string | null;
  funding_tx_hash?: string | null;
  release_tx_hash?: string | null;
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
  status: InvoiceWorkflowStatus;
  freelancer_wallet?: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceHistoryRecord = {
  id: string;
  invoice_id: string;
  owner_id: string;
  event_type: string;
  detail: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type ClientRecord = {
  id: string;
  workspace_name: string;
  client_name: string;
  client_email: string;
  client_wallet: string | null;
  notes: string | null;
  created_at: string;
};

export type WorkspaceProfile = {
  id: string;
  user_id: string;
  workspace_name: string;
  role_type: "Freelancer" | "Agency";
  default_currency: "USDC" | "EURC";
  wallet_address: string | null;
  created_at: string;
};


export type WorkspaceMemberRole = "Owner" | "Admin" | "Operator" | "Viewer";

export type WorkspaceMember = {
  id: string;
  workspace_name: string;
  owner_id: string;
  member_name: string;
  member_email: string;
  role: WorkspaceMemberRole;
  created_at: string;
};

export type ReleaseApprovalRequest = {
  id: string;
  invoice_id: string;
  owner_id: string;
  approver_email: string;
  approver_role: WorkspaceMemberRole;
  status: "Pending" | "Approved" | "Rejected";
  note: string | null;
  created_at: string;
  decided_at: string | null;
};


export type WorkspaceInvitationStatus = "Pending" | "Accepted" | "Revoked" | "Declined";

export type WorkspaceInvitation = {
  id: string;
  workspace_name: string;
  owner_id: string;
  invite_email: string;
  invite_role: WorkspaceMemberRole;
  status: WorkspaceInvitationStatus;
  invite_note: string | null;
  created_at: string;
  responded_at: string | null;
};


export type WorkspaceAuditEvent = {
  id: string;
  owner_id: string;
  workspace_name: string;
  event_type: string;
  title: string;
  detail: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type NotificationPreferences = {
  id: string;
  owner_id: string;
  workspace_name: string;
  email_approvals: boolean;
  email_invitations: boolean;
  email_releases: boolean;
  in_app_activity: boolean;
  weekly_summary: boolean;
  created_at: string;
  updated_at: string;
};


export type SettlementLedgerEntryType =
  | "gateway_deposit"
  | "escrow_funding"
  | "release"
  | "crosschain"
  | "manual";

export type SettlementLedgerEntry = {
  id: string;
  owner_id: string;
  workspace_name: string;
  invoice_id: string | null;
  entry_type: SettlementLedgerEntryType;
  amount: number | null;
  currency: "USDC" | "EURC";
  tx_hash: string | null;
  target_address: string | null;
  note: string | null;
  created_at: string;
};


export type IdentityMethod =
  | "email_password"
  | "email_magic_link"
  | "google_oauth"
  | "apple_oauth"
  | "x_oauth"
  | "wallet_hint"
  | "wallet_siwe";

export type IdentitySummary = {
  workspace_name: string;
  role_type: string;
  default_currency: "USDC" | "EURC";
  linked_wallet_address: string | null;
  linked_auth_methods: IdentityMethod[];
  email: string | null;
};


export type VerifiedWalletSession = {
  address: string;
  issued_at: string;
};
