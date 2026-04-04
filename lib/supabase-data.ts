import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { ClientRecord, InvoiceDraft, RemoteInvoiceDraftRow, WorkspaceProfile } from "@/lib/types";

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
  };
}

export async function ensureWorkspaceProfile() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

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
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

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
  const supabase = createSupabaseBrowserClient();
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
  const supabase = createSupabaseBrowserClient();
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
  const supabase = createSupabaseBrowserClient();
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

export async function fetchRemoteInvoiceDrafts() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return [];

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return [];

  const { data } = await supabase
    .from("invoice_drafts")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (data as RemoteInvoiceDraftRow[] | null) || [];
}

export async function fetchRemoteInvoiceDraftById(id: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data } = await supabase
    .from("invoice_drafts")
    .select("*")
    .eq("owner_id", user.id)
    .eq("id", id)
    .maybeSingle();

  return (data as RemoteInvoiceDraftRow | null) || null;
}

export async function saveRemoteInvoiceDraft(draft: InvoiceDraft) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const payload = toRemoteDraftPayload(draft, user.id);

  const { data, error } = await supabase
    .from("invoice_drafts")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as RemoteInvoiceDraftRow;
}

export async function updateRemoteInvoiceDraft(draftId: string, draft: InvoiceDraft) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const payload = toRemoteDraftPayload(draft, user.id);

  const { data, error } = await supabase
    .from("invoice_drafts")
    .update(payload)
    .eq("id", draftId)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as RemoteInvoiceDraftRow;
}

export async function fetchInvoiceDraftsCount() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return 0;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return 0;

  const { count } = await supabase
    .from("invoice_drafts")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  return count || 0;
}

export async function fetchDashboardStatsDetailed() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

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


export async function deleteRemoteInvoiceDraft(draftId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return false;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return false;

  const { error } = await supabase
    .from("invoice_drafts")
    .delete()
    .eq("id", draftId)
    .eq("owner_id", user.id);

  if (error) throw error;
  return true;
}

export async function deleteClientRecord(clientId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);

  if (error) throw error;
  return true;
}
