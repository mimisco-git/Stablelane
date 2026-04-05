"use client";

import { useEffect, useState } from "react";
import { fetchWorkspaceAuditEvents } from "@/lib/supabase-data";
import { EmptyState, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type AuditEvent = {
  id: string;
  event_type: string;
  title: string;
  detail: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
};

function toneFor(eventType: string) {
  if (eventType.includes("release") || eventType.includes("accepted")) return "done" as const;
  if (eventType.includes("approval") || eventType.includes("funded")) return "live" as const;
  return "neutral" as const;
}

export function AuditTrailPanel() {
  const [rows, setRows] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchWorkspaceAuditEvents(80);
        if (mounted) setRows(data as AuditEvent[]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingState title="Loading audit trail" detail="Stablelane is reading the database-backed workspace audit log." />;
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No audit events yet"
        detail="As real actions are taken in the workspace, they will be written into this database-backed audit trail."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {rows.map((item) => (
        <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[var(--text)]">{item.title}</div>
              <div className="text-[0.8rem] text-[var(--muted)]">{new Date(item.created_at).toLocaleString()}</div>
            </div>
            <StatusPill label={item.event_type} tone={toneFor(item.event_type)} />
          </div>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}
