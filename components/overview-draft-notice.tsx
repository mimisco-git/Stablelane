"use client";

import { useEffect, useMemo, useState } from "react";
import { readLocalInvoices } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export function OverviewDraftNotice() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [localCount, setLocalCount] = useState(0);
  const [remoteCount, setRemoteCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLocalCount(readLocalInvoices().length);

    async function loadRemote() {
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active || !session?.user) return;

      const { count } = await supabase
        .from("invoice_drafts")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", session.user.id);

      if (!active) return;
      setRemoteCount(count || 0);
    }

    loadRemote();

    return () => {
      active = false;
    };
  }, [supabase]);

  const total = remoteCount + localCount;
  if (!total) return null;

  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4 text-[0.84rem] leading-6 text-[var(--accent)]">
      You have {total} unsaved invoice {total === 1 ? "draft" : "drafts"}.{" "}
      <a href="/app/invoices" className="font-bold underline underline-offset-2">
        Open invoices to continue.
      </a>
    </div>
  );
}
