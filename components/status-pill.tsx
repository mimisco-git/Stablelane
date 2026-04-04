type StatusPillProps = {
  label: string;
  tone?: "done" | "lock" | "live" | "neutral";
};

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  const styles =
    tone === "done"
      ? "bg-[rgba(201,255,96,.11)] text-[var(--accent)]"
      : tone === "lock"
        ? "bg-[rgba(216,196,139,.12)] text-[var(--accent-3)]"
        : tone === "live"
          ? "bg-[rgba(103,213,138,.12)] text-[var(--accent-2)]"
          : "bg-white/8 text-[var(--muted)]";

  return (
    <span className={`rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${styles}`}>
      {label}
    </span>
  );
}
