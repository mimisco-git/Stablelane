export type ActingWorkspaceRole = "Owner" | "Admin" | "Operator" | "Viewer";

const STORAGE_KEY = "stablelane_acting_role_v1";

export function readActingRole(): ActingWorkspaceRole {
  if (typeof window === "undefined") return "Owner";
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === "Owner" || value === "Admin" || value === "Operator" || value === "Viewer") {
    return value;
  }
  return "Owner";
}

export function writeActingRole(role: ActingWorkspaceRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, role);
}

export function canCreateApprovals(role: ActingWorkspaceRole) {
  return role === "Owner" || role === "Admin";
}

export function canFinalizeRelease(role: ActingWorkspaceRole) {
  return role === "Owner" || role === "Admin";
}

export function canPrepareFunding(role: ActingWorkspaceRole) {
  return role === "Owner" || role === "Admin" || role === "Operator";
}
