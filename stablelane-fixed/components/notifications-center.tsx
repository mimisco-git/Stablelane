"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchApprovalOverview, fetchWorkspaceInvitations } from "@/lib/supabase-data";
import { readActivityFeed, type ActivityItem } from "@/lib/activity-feed";
import type { WorkspaceInvitation } from "@/lib/types";
import { EmptyState, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  href?: string;
  kind: "approval" | "invitation" | "activity";
  state: "attention" | "update" | "confirmed";
  createdAt: string;
};

const READ_STORAGE_KEY = "stablelane_notifications_read_v1";

function readDismissedIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeDismissedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
}

function toneFor(item: NotificationItem) {
  if (item.state === "confirmed") return "done" as const;
  if (item.state === "attention") return "lock" as const;
  return "live" as const;
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [approvals, invitations] = await Promise.all([
          fetchApprovalOverview(),
          fetchWorkspaceInvitations(),
        ]);

        const activity = readActivityFeed();

        const approvalItems: NotificationItem[] =
          (approvals?.recent || []).slice(0, 10).map((item) => ({
            id: `approval_${item.id}`,
            title: item.status === "Pending" ? "Approval needs attention" : "Approval state changed",
            detail: `${item.approver_email} · ${item.status}`,
            href: `/app/invoices/${item.invoice_id}`,
            kind: "approval",
            state: item.status === "Pending" ? "attention" : item.status === "Approved" ? "confirmed" : "update",
            createdAt: item.created_at,
          })) || [];

        const invitationItems: NotificationItem[] = invitations.slice(0, 10).map((item: WorkspaceInvitation) => ({
          id: `invite_${item.id}`,
          title: item.status === "Pending" ? "Invitation still pending" : "Invitation updated",
          detail: `${item.invite_email} · ${item.status}`,
          href: "/app/invitations",
          kind: "invitation",
          state: item.status === "Pending" ? "attention" : item.status === "Accepted" ? "confirmed" : "update",
          createdAt: item.created_at,
        }));

        const activityItems: NotificationItem[] = activity.slice(0, 12).map((item: ActivityItem) => ({
          id: `activity_${item.id}`,
          title: item.title,
          detail: item.detail,
          href: item.invoiceId ? `/app/invoices/${item.invoiceId}` : "/app/activity",
          kind: "activity",
          state: item.status === "confirmed" ? "confirmed" : item.status === "submitted" ? "update" : "attention",
          createdAt: item.createdAt,
        }));

        const merged = [...approvalItems, ...invitationItems, ...activityItems].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (!mounted) return;
        setNotifications(merged);
        setDismissedIds(readDismissedIds());
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const unreadItems = useMemo(
    () => notifications.filter((item) => !dismissedIds.includes(item.id)),
    [notifications, dismissedIds]
  );

  function markRead(notificationId: string) {
    const next = Array.from(new Set([...dismissedIds, notificationId]));
    setDismissedIds(next);
    writeDismissedIds(next);
  }

  function markAllRead() {
    const next = Array.from(new Set([...dismissedIds, ...notifications.map((item) => item.id)]));
    setDismissedIds(next);
    writeDismissedIds(next);
  }

  if (loading) {
    return (
      <LoadingState
        title="Loading notifications"
        detail="Stablelane is collecting approvals, invitations, and recent workspace signals into a single center."
      />
    );
  }

  if (!notifications.length) {
    return (
      <EmptyState
        title="No notifications yet"
        detail="As approvals, invitations, and settlement events happen, they will surface here in a cleaner notification view."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Workspace notifications</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            A cleaner alert stream for approvals, invitations, and operational events.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={`${unreadItems.length} unread`} tone={unreadItems.length ? "lock" : "done"} />
          <button
            type="button"
            onClick={markAllRead}
            className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-[0.82rem] font-semibold text-[var(--text)]"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {notifications.map((item) => {
          const unread = !dismissedIds.includes(item.id);
          return (
            <div key={item.id} className={`rounded-2xl border p-4 ${unread ? "border-[var(--line)] bg-[rgba(201,255,96,.06)]" : "border-white/8 bg-white/3"}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-[var(--text)]">{item.title}</div>
                  <div className="text-[0.8rem] text-[var(--muted)]">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill label={item.kind} tone={toneFor(item)} />
                  {unread ? <StatusPill label="unread" tone="lock" /> : <StatusPill label="read" tone="neutral" />}
                </div>
              </div>

              <p className="mb-3 text-[0.84rem] leading-6 text-[var(--muted)]">{item.detail}</p>

              <div className="flex flex-wrap gap-3">
                {item.href ? (
                  <Link href={item.href} className="text-[0.82rem] font-semibold text-[var(--accent)]">
                    Open
                  </Link>
                ) : null}
                {unread ? (
                  <button
                    type="button"
                    onClick={() => markRead(item.id)}
                    className="text-[0.82rem] font-semibold text-[var(--text)]"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
