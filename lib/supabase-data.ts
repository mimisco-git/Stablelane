import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { ClientRecord, WorkspaceProfile } from "@/lib/types";

export async function ensureWorkspaceProfile() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data: existing } = await supabase
    .from("workspace_profiles")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (existing) return existing as WorkspaceProfile;

  const inferredName =
    (user.email?.split("@")[0] || "stablelane").replace(/[._-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) +
    " Workspace";

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
    .eq("owner_id", user.id)
    .single();

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

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

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

export async function fetchDashboardStats() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const [{ count: invoiceCount }, { count: clientCount }, workspace] = await Promise.all([
    supabase.from("invoice_drafts").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    fetchWorkspaceProfile(),
  ]);

  return {
    invoiceCount: invoiceCount || 0,
    clientCount: clientCount || 0,
    workspaceName: workspace?.workspace_name || "Workspace",
    defaultCurrency: workspace?.default_currency || "USDC",
  };
}
