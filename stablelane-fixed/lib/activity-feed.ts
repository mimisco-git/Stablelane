export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  kind:
    | "gateway_deposit"
    | "escrow_funding"
    | "release"
    | "crosschain_intent"
    | "crosschain_broadcast"
    | "crosschain_settled";
  status: "planned" | "submitted" | "confirmed";
  txHash?: string;
  invoiceId?: string;
  targetAddress?: string;
  createdAt: string;
};

const STORAGE_KEY = "stablelane_activity_feed_v1";

export function readActivityFeed(): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActivityItem[]) : [];
  } catch {
    return [];
  }
}

export function pushActivityItem(item: Omit<ActivityItem, "id" | "createdAt">) {
  if (typeof window === "undefined") return null;

  const entry: ActivityItem = {
    ...item,
    id: `act_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  const current = readActivityFeed();
  const next = [entry, ...current].slice(0, 60);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return entry;
}

export function replaceActivityItem(activityId: string, updates: Partial<ActivityItem>) {
  if (typeof window === "undefined") return;
  const current = readActivityFeed();
  const next = current.map((item) => (item.id === activityId ? { ...item, ...updates } : item));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
