"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState, InlineNotice } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type TeamRole = "Owner" | "Admin" | "Operator" | "Viewer";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  createdAt: string;
};

const STORAGE_KEY = "stablelane_team_members_v1";

const rolePermissions: Record<TeamRole, string[]> = {
  Owner: [
    "Full workspace control",
    "Can manage contracts and settings",
    "Can export all documents",
  ],
  Admin: [
    "Can manage clients and invoices",
    "Can update workflow states",
    "Can review analytics and exports",
  ],
  Operator: [
    "Can prepare invoices and funding actions",
    "Can use activity and receipt tools",
    "Cannot change top-level workspace config",
  ],
  Viewer: [
    "Read-only access",
    "Can review activity and receipts",
    "Cannot create or update records",
  ],
};

function readMembers(): TeamMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TeamMember[]) : [];
  } catch {
    return [];
  }
}

function writeMembers(rows: TeamMember[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function TeamRolesManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Operator");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMembers(readMembers());
  }, []);

  const permissionPreview = useMemo(() => rolePermissions[role], [role]);

  function save(next: TeamMember[]) {
    setMembers(next);
    writeMembers(next);
  }

  function addMember(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setMessage("Add both name and email before saving a team member.");
      return;
    }

    const nextMember: TeamMember = {
      id: `member_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      name: name.trim(),
      email: email.trim(),
      role,
      createdAt: new Date().toISOString(),
    };

    save([nextMember, ...members].slice(0, 24));
    setName("");
    setEmail("");
    setRole("Operator");
    setMessage("Team member saved to this workspace preview.");
  }

  function removeMember(memberId: string) {
    save(members.filter((member) => member.id !== memberId));
    setMessage("Team member removed.");
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">Workspace team roles</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Shape how a premium operations workspace should behave before full database-backed permissions land. This keeps the product closer to a real team operating system.
          </p>
        </div>

        <form onSubmit={addMember} className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
          <div className="grid gap-3">
            <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
              <span>Member name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
                placeholder="Precious Okafor"
              />
            </label>

            <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
              <span>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
                placeholder="team@example.com"
              />
            </label>

            <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
              <span>Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TeamRole)}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
              >
                <option>Owner</option>
                <option>Admin</option>
                <option>Operator</option>
                <option>Viewer</option>
              </select>
            </label>

            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
            >
              Add team member
            </button>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">{role} permissions</div>
            <div className="grid gap-2">
              {permissionPreview.map((item) => (
                <div key={item} className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-2 text-[0.82rem] text-[var(--muted)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </form>

        {message ? (
          <div className="mt-4">
            <InlineNotice title="Team workspace" detail={message} tone="success" />
          </div>
        ) : null}
      </section>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">Current team preview</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Local role preview for a more operational workspace experience.
          </p>
        </div>

        {members.length ? (
          <div className="grid gap-3">
            {members.map((member) => (
              <div key={member.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-[0.82rem] text-[var(--muted)]">{member.email}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill
                      label={member.role}
                      tone={member.role === "Owner" ? "done" : member.role === "Admin" ? "live" : member.role === "Operator" ? "lock" : "neutral"}
                    />
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.78rem] font-semibold text-[var(--text)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  {rolePermissions[member.role].map((permission) => (
                    <div key={permission} className="text-[0.8rem] text-[var(--muted)]">
                      • {permission}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No team members yet"
            detail="Add a few workspace members to preview how Stablelane could evolve into a proper multi-user operations product."
          />
        )}
      </section>
    </div>
  );
}
