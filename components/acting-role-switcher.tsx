"use client";

import { useEffect, useState } from "react";
import { readActingRole, writeActingRole, type ActingWorkspaceRole } from "@/lib/role-session";
import { InlineNotice } from "@/components/ui-state";

export function ActingRoleSwitcher() {
  const [role, setRole] = useState<ActingWorkspaceRole>("Owner");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setRole(readActingRole());
  }, []);

  function updateRole(next: ActingWorkspaceRole) {
    setRole(next);
    writeActingRole(next);
    setMessage(`Workspace actions now preview as ${next}.`);
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Acting role preview</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          Preview how approval and release controls behave for different workspace roles before full server-enforced permissions are added.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["Owner", "Admin", "Operator", "Viewer"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => updateRole(item)}
            className={`rounded-full px-4 py-3 text-[0.9rem] font-semibold ${
              role === item
                ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
                : "border border-white/8 bg-white/3 text-[var(--muted)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice title="Role preview" detail={message} tone="success" />
        </div>
      ) : null}
    </section>
  );
}
