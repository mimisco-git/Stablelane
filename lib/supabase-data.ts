import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type {
  ClientRecord,
  InvoiceDraft,
  InvoiceHistoryRecord,
  ReleaseApprovalRequest,
  RemoteInvoiceDraftRow,
  WorkspaceMember,
  WorkspaceProfile,
} from "@/lib/types";

function toRemoteDraftPayload(draft: InvoiceDraft, ownerId: string) {
  return {
    owner_id: ownerId,
    client_id: draft.clientId || null,
    workspace_name: draft.workspaceName || null,
    title: draft.title,
    client_name: draft.clientName,
    client_email: draft.clientEmail,
    amount: Number(draft.amount || 0),
    currency: draft.currency,
    payment_mode: draft.paymentMode,
    due_date: draft.dueDate && draft.dueDate !== "Not set" ? draft.dueDate : null,
    reference: draft.reference || null,
    description: draft.description || null,
    milestones: draft.milestones,
    splits: draft.splits,
    status: draft.status,
    escrow_status: draft.escrowStatus || "draft",
    escrow_address: draft.escrowAddress || null,
    funding_tx_hash: draft.fundingTxHash || null,
    release_tx_hash: draft.releaseTxHash || null,
  };
}

async function getSignedInUser() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { supabase: null, user: null };
  const { data: auth } = await supabase.auth.getUser();
  return { supabase, user: auth.user };
}

export async function appendInvoiceHistory(
  invoiceId: string,
  eventType: string,
  detail: string,
  metadata?: Record<string, unknown>
) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const { data, error } = await supabase
    .from("invoice_history_logs")
    .insert({
      invoice_id: invoiceId,
      owner_id: user.id,
      event_type: eventType,
      detail,
      metadata: metadata || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as InvoiceHistoryRecord;
}

export async function fetchInvoiceHistory(invoiceId: string) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return [];

  const { data } = await supabase
    .from("invoice_history_logs")
    .select("*")
    .eq("invoice_id", invoiceId)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (data as InvoiceHistoryRecord[] | null) || [];
}

export async function ensureWorkspaceProfile() {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const { data: existing } = await supabase
    .from("workspace_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return existing as WorkspaceProfile;

  const inferredName =
    (user.email?.split("@")[0] || "stablelane")
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase()) + " Workspace";

  const { data, error } = await supabase
    .from("workspace_profiles")
    .insert({
      user_id: user.id,
      workspace_name: inferredName,
      role_type: "Freelancer",
      default_currency: "USDC",
      wallet_address: null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as WorkspaceProfile;
}

export async function fetchWorkspaceProfile() {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const { data } = await supabase
    .from("workspace_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (data as WorkspaceProfile | null) || null;
}

export async function saveWorkspaceProfile(payload: {
  workspace_name: string;
  role_type: "Freelancer" | "Agency";
  default_currency: "USDC" | "EURC";
  wallet_address: string | null;
}) {
  const { supabase } = await getSignedInUser();
  if (!supabase) return null;

  const existing = await ensureWorkspaceProfile();
  if (!existing) return null;

  const { data, error } = await supabase
    .from("workspace_profiles")
    .update(payload)
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as WorkspaceProfile;
}

export async function fetchClients() {
  const { supabase } = await getSignedInUser();
  if (!supabase) return [];

  const workspace = await ensureWorkspaceProfile();
  if (!workspace) return [];

  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("workspace_name", workspace.workspace_name)
    .order("created_at", { ascending: false });

  return (data as ClientRecord[] | null) || [];
}

export async function createClient(input: {
  client_name: string;
  client_email: string;
  client_wallet?: string;
  notes?: string;
}) {
  const { supabase } = await getSignedInUser();
  if (!supabase) return null;

  const workspace = await ensureWorkspaceProfile();
  if (!workspace) return null;

  const { data, error } = await supabase
    .from("clients")
    .insert({
      workspace_name: workspace.workspace_name,
      client_name: input.client_name,
      client_email: input.client_email,
      client_wallet: input.client_wallet || null,
      notes: input.notes || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ClientRecord;
}

export async function deleteClientRecord(clientId: string) {
  const { supabase } = await getSignedInUser();
  if (!supabase) return false;

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);

  if (error) throw error;
  return true;
}

export async function fetchRemoteInvoiceDrafts() {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return [];

  const { data } = await supabase
    .from("invoice_drafts")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (data as RemoteInvoiceDraftRow[] | null) || [];
}

export async function fetchRemoteInvoiceDraftById(id: string) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const { data } = await supabase
    .from("invoice_drafts")
    .select("*")
    .eq("owner_id", user.id)
    .eq("id", id)
    .maybeSingle();

  return (data as RemoteInvoiceDraftRow | null) || null;
}

export async function saveRemoteInvoiceDraft(draft: InvoiceDraft) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const payload = toRemoteDraftPayload(draft, user.id);

  const { data, error } = await supabase
    .from("invoice_drafts")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  await appendInvoiceHistory(data.id, "invoice_created", "Invoice draft created.", {
    clientName: data.client_name,
    amount: data.amount,
    currency: data.currency,
  });

  return data as RemoteInvoiceDraftRow;
}

export async function updateRemoteInvoiceDraft(draftId: string, draft: InvoiceDraft) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const payload = toRemoteDraftPayload(draft, user.id);

  const { data, error } = await supabase
    .from("invoice_drafts")
    .update(payload)
    .eq("id", draftId)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) throw error;

  await appendInvoiceHistory(draftId, "invoice_updated", "Invoice draft updated.", {
    clientName: data.client_name,
    amount: data.amount,
    currency: data.currency,
  });

  return data as RemoteInvoiceDraftRow;
}

export async function patchRemoteInvoiceDraft(
  draftId: string,
  updates: Partial<{
    status: string;
    escrow_status: string;
    escrow_address: string | null;
    funding_tx_hash: string | null;
    release_tx_hash: string | null;
    client_id: string | null;
  }>
) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const { data, error } = await supabase
    .from("invoice_drafts")
    .update(updates)
    .eq("id", draftId)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as RemoteInvoiceDraftRow;
}

export async function updateInvoiceWorkflowState(
  draftId: string,
  next: {
    status?: string;
    escrow_status?: string;
    escrow_address?: string | null;
    funding_tx_hash?: string | null;
    release_tx_hash?: string | null;
  },
  history?: {
    eventType?: string;
    detail?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const updated = await patchRemoteInvoiceDraft(draftId, next);
  if (!updated) return null;

  await appendInvoiceHistory(
    draftId,
    history?.eventType || "workflow_updated",
    history?.detail || "Invoice workflow updated.",
    history?.metadata || next
  );

  return updated;
}

export async function deleteRemoteInvoiceDraft(draftId: string) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return false;

  const existing = await fetchRemoteInvoiceDraftById(draftId);
  if (existing) {
    await appendInvoiceHistory(draftId, "invoice_deleted", "Invoice draft deleted.", {
      clientName: existing.client_name,
      amount: existing.amount,
      currency: existing.currency,
    });
  }

  const { error } = await supabase
    .from("invoice_drafts")
    .delete()
    .eq("id", draftId)
    .eq("owner_id", user.id);

  if (error) throw error;
  return true;
}

export async function fetchInvoiceDraftsCount() {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return 0;

  const { count } = await supabase
    .from("invoice_drafts")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  return count || 0;
}

export async function fetchDashboardStatsDetailed() {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const workspace = await fetchWorkspaceProfile();
  if (!workspace) return null;

  const [{ data: invoiceRows }, { count: clientCount }] = await Promise.all([
    supabase
      .from("invoice_drafts")
      .select("amount,status,created_at,title,client_name,currency")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("workspace_name", workspace.workspace_name),
  ]);

  const rows = (invoiceRows || []) as Array<{
    amount: number | null;
    status: string;
    created_at: string;
    title: string;
    client_name: string;
    currency: "USDC" | "EURC";
  }>;

  const totalDraftValue = rows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const draftCount = rows.length;

  return {
    workspaceName: workspace.workspace_name,
    defaultCurrency: workspace.default_currency,
    roleType: workspace.role_type,
    clientCount: clientCount || 0,
    draftCount,
    totalDraftValue,
    recent: rows.slice(0, 5),
  };
}

export async function fetchWorkspaceAnalytics() {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const workspace = await fetchWorkspaceProfile();
  if (!workspace) return null;

  const [{ data: invoiceRows }, { data: clientRows }] = await Promise.all([
    supabase
      .from("invoice_drafts")
      .select("id,title,client_name,client_id,amount,currency,status,escrow_status,created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("*")
      .eq("workspace_name", workspace.workspace_name)
      .order("created_at", { ascending: false }),
  ]);

  const invoices = (invoiceRows || []) as Array<{
    id: string;
    title: string;
    client_name: string;
    client_id: string | null;
    amount: number | null;
    currency: "USDC" | "EURC";
    status: string;
    escrow_status: string | null;
    created_at: string;
  }>;
  const clients = (clientRows || []) as ClientRecord[];

  const clientTotals = invoices.reduce<Record<string, { count: number; value: number }>>((acc, row) => {
    const key = row.client_name || "Unnamed client";
    if (!acc[key]) acc[key] = { count: 0, value: 0 };
    acc[key].count += 1;
    acc[key].value += Number(row.amount || 0);
    return acc;
  }, {});

  const statusTotals = invoices.reduce<Record<string, number>>((acc, row) => {
    const key = row.status || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const escrowTotals = invoices.reduce<Record<string, number>>((acc, row) => {
    const key = row.escrow_status || "draft";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    workspaceName: workspace.workspace_name,
    roleType: workspace.role_type,
    defaultCurrency: workspace.default_currency,
    totalInvoices: invoices.length,
    totalClients: clients.length,
    totalValue: invoices.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    linkedInvoices: invoices.filter((row) => Boolean(row.client_id)).length,
    unlinkedInvoices: invoices.filter((row) => !row.client_id).length,
    clientTotals: Object.entries(clientTotals)
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.value - a.value),
    statusTotals,
    escrowTotals,
    recentInvoices: invoices.slice(0, 6),
  };
}


export async function fetchInvoiceStatusSummary() {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const { data } = await supabase
    .from("invoice_drafts")
    .select("status,amount")
    .eq("owner_id", user.id);

  const rows = (data || []) as Array<{
    status: string;
    amount: number | null;
  }>;

  return {
    total: rows.length,
    draft: rows.filter((row) => row.status === "Draft").length,
    sent: rows.filter((row) => row.status === "Sent").length,
    escrow: rows.filter((row) => row.status === "In escrow").length,
    completed: rows.filter((row) => row.status === "Completed").length,
    totalValue: rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
  };
}


export async function fetchWorkspaceMembers() {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return [];

  const workspace = await ensureWorkspaceProfile();
  if (!workspace) return [];

  const { data } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("owner_id", user.id)
    .eq("workspace_name", workspace.workspace_name)
    .order("created_at", { ascending: false });

  return (data as WorkspaceMember[] | null) || [];
}

export async function createWorkspaceMember(input: {
  member_name: string;
  member_email: string;
  role: "Owner" | "Admin" | "Operator" | "Viewer";
}) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const workspace = await ensureWorkspaceProfile();
  if (!workspace) return null;

  const { data, error } = await supabase
    .from("workspace_members")
    .insert({
      workspace_name: workspace.workspace_name,
      owner_id: user.id,
      member_name: input.member_name,
      member_email: input.member_email,
      role: input.role,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as WorkspaceMember;
}

export async function deleteWorkspaceMember(memberId: string) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return false;

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId)
    .eq("owner_id", user.id);

  if (error) throw error;
  return true;
}

export async function fetchReleaseApprovals(invoiceId: string) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return [];

  const { data } = await supabase
    .from("release_approval_requests")
    .select("*")
    .eq("owner_id", user.id)
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: false });

  return (data as ReleaseApprovalRequest[] | null) || [];
}

export async function createReleaseApprovalRequests(
  invoiceId: string,
  requests: Array<{ approver_email: string; approver_role: "Owner" | "Admin" | "Operator" | "Viewer" }>
) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user || !requests.length) return [];

  const payload = requests.map((item) => ({
    invoice_id: invoiceId,
    owner_id: user.id,
    approver_email: item.approver_email,
    approver_role: item.approver_role,
    status: "Pending",
    note: null,
  }));

  const { data, error } = await supabase
    .from("release_approval_requests")
    .insert(payload)
    .select("*");

  if (error) throw error;

  await appendInvoiceHistory(invoiceId, "release_approvals_requested", "Release approvals requested.", {
    approverCount: requests.length,
    approvers: requests.map((item) => item.approver_email),
  });

  return (data as ReleaseApprovalRequest[] | null) || [];
}

export async function updateReleaseApprovalRequest(
  requestId: string,
  invoiceId: string,
  nextStatus: "Approved" | "Rejected",
  note?: string
) {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const { data, error } = await supabase
    .from("release_approval_requests")
    .update({
      status: nextStatus,
      note: note || null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) throw error;

  await appendInvoiceHistory(
    invoiceId,
    nextStatus === "Approved" ? "release_approval_approved" : "release_approval_rejected",
    nextStatus === "Approved" ? "A release approval was approved." : "A release approval was rejected.",
    {
      approver: data.approver_email,
      role: data.approver_role,
      note: data.note,
    }
  );

  return data as ReleaseApprovalRequest;
}



export async function fetchApprovalOverview() {
  const { supabase, user } = await getSignedInUser();
  if (!supabase || !user) return null;

  const { data } = await supabase
    .from("release_approval_requests")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data as ReleaseApprovalRequest[] | null) || [];

  return {
    total: rows.length,
    pending: rows.filter((row) => row.status === "Pending").length,
    approved: rows.filter((row) => row.status === "Approved").length,
    rejected: rows.filter((row) => row.status === "Rejected").length,
    recent: rows.slice(0, 12),
  };
}

export async function fetchInvoiceApprovalGate(invoiceId: string) {
  const rows = await fetchReleaseApprovals(invoiceId);
  const total = rows.length;
  const pending = rows.filter((row) => row.status === "Pending").length;
  const approved = rows.filter((row) => row.status === "Approved").length;
  const rejected = rows.filter((row) => row.status === "Rejected").length;

  return {
    total,
    pending,
    approved,
    rejected,
    allApproved: total > 0 && approved === total,
    hasRejection: rejected > 0,
  };
}
