import type { ReactNode } from "react";

type BaseProps = {
  title: string;
  detail: string;
  action?: ReactNode;
};

export function LoadingState({ title, detail, action }: BaseProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
      <div className="mb-3 h-2 w-24 rounded-full bg-white/10" />
      <div className="mb-2 text-[0.94rem] font-semibold text-[var(--text)]">{title}</div>
      <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{detail}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ title, detail, action }: BaseProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-5">
      <div className="mb-2 text-[0.96rem] font-semibold text-[var(--text)]">{title}</div>
      <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{detail}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function InlineNotice({
  title,
  detail,
  tone = "neutral",
}: {
  title: string;
  detail: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const styles =
    tone === "success"
      ? "border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
      : tone === "warning"
        ? "border-white/8 bg-white/3 text-[var(--accent-3)]"
        : "border-white/8 bg-white/3 text-[var(--muted)]";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles}`}>
      <div className="mb-1 text-[0.86rem] font-semibold">{title}</div>
      <div className="text-[0.82rem] leading-6">{detail}</div>
    </div>
  );
}
