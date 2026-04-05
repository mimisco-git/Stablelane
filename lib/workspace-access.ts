import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export type RealWorkspaceRole = "Owner" | "Admin" | "Operator" | "Viewer";
export type RealAccessSource = "workspace_owner" | "workspace_member" | "signed_in_no_workspace" | "preview";

export type MembershipRow = {
  id: string;
  workspace_name: string;
  member_name: string;
  member_email: string;
  role: RealWorkspaceRole;
  owner_id: string;
  created_at: string;
};

export type AccessContext = {
  email: string;
  role: RealWorkspaceRole;
  source: RealAccessSource;
  workspaceName: string;
  memberships: MembershipRow[];
  hasDatabaseWorkspace: boolean;
};

export async function fetchRealAccessContext(): Promise<AccessContext> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return {
      email: "",
      role: "Viewer",
      source: "preview",
      workspaceName: "",
      memberships: [],
      hasDatabaseWorkspace: false,
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  const email = user?.email || "";
  if (!user || !email) {
    return {
      email: "",
      role: "Viewer",
      source: "preview",
      workspaceName: "",
      memberships: [],
      hasDatabaseWorkspace: false,
    };
  }

  const { data: ownedWorkspace } = await supabase
    .from("workspace_profiles")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (ownedWorkspace) {
    return {
      email,
      role: "Owner",
      source: "workspace_owner",
      workspaceName: ownedWorkspace.workspace_name || "",
      memberships: [],
      hasDatabaseWorkspace: true,
    };
  }

  const { data: memberRows } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("member_email", email)
    .order("created_at", { ascending: false });

  const memberships = ((memberRows || []) as MembershipRow[]);
  if (memberships.length) {
    return {
      email,
      role: memberships[0].role || "Viewer",
      source: "workspace_member",
      workspaceName: memberships[0].workspace_name || "",
      memberships,
      hasDatabaseWorkspace: true,
    };
  }

  return {
    email,
    role: "Viewer",
    source: "signed_in_no_workspace",
    workspaceName: "",
    memberships: [],
    hasDatabaseWorkspace: false,
  };
}

export function canCreateApprovalsReal(role: RealWorkspaceRole) {
  return role === "Owner" || role === "Admin";
}

export function canFinalizeReleaseReal(role: RealWorkspaceRole) {
  return role === "Owner" || role === "Admin";
}

export function canPrepareFundingReal(role: RealWorkspaceRole) {
  return role === "Owner" || role === "Admin" || role === "Operator";
}

export function labelForAccessSource(source: RealAccessSource) {
  if (source === "workspace_owner") return "Workspace owner";
  if (source === "workspace_member") return "Workspace member";
  if (source === "signed_in_no_workspace") return "Signed in, no workspace";
  return "Preview mode";
}
