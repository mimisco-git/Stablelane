"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readActivityFeed, type ActivityItem } from "@/lib/activity-feed";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { EmptyState, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

function toneFor(status: ActivityItem["status"]) {
  if (status === "confirmed") return "done" as const;
  if (status === "submitted") return "live" as const;
  return "neutral" as const;
}

export function ActivityFeedPanel() {
  const { network } = useAppEnvironment();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(readActivityFeed());
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingState title="Loading activity feed" detail="Stablelane is reading your local Arc transaction and execution activity." />;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No activity yet"
        detail="Gateway deposits, escrow funding, releases, and crosschain execution intents will appear here as you use the product."
      />
    );
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Arc activity feed</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            A live operational stream of Gateway deposits, escrow funding, release events, and crosschain execution steps.
          </p>
        </div>
        <StatusPill label={`${items.length} items`} tone="live" />
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-[var(--text)]">{item.title}</div>
                <div className="text-[0.8rem] text-[var(--muted)]">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <StatusPill label={item.status} tone={toneFor(item.status)} />
            </div>

            <p className="mb-3 text-[0.84rem] leading-6 text-[var(--muted)]">{item.detail}</p>

            <div className="grid gap-2 md:grid-cols-2">
              {item.invoiceId ? (
                <Link href={`/app/invoices/${item.invoiceId}`} className="text-[0.82rem] font-semibold text-[var(--accent)]">
                  Open invoice
                </Link>
              ) : (
                <span className="text-[0.82rem] text-[var(--muted)]">No invoice link</span>
              )}

              {item.txHash ? (
                <Link
                  href={`${network.explorerUrl}/tx/${item.txHash}`}
                  target="_blank"
                  className="text-[0.82rem] font-semibold text-[var(--accent)]"
                >
                  Open tx on explorer
                </Link>
              ) : (
                <span className="text-[0.82rem] text-[var(--muted)]">No tx hash yet</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
