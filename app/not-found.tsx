import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 font-[family-name:var(--font-cormorant)] text-[8rem] leading-none tracking-[-0.08em] text-white/10">
          404
        </div>
        <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
          Page not found
        </div>
        <h1 className="mb-4 font-[family-name:var(--font-cormorant)] text-[2.5rem] tracking-[-0.05em]">
          This lane does not exist.
        </h1>
        <p className="mb-8 text-[0.95rem] text-[var(--muted)]">
          The page you are looking for may have moved or never existed.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-[0.92rem] font-bold text-[#08100b] transition hover:-translate-y-px"
          >
            Back to home
          </Link>
          <Link
            href="/app"
            className="rounded-full border border-white/8 bg-white/3 px-5 py-3 text-[0.92rem] font-bold text-[var(--text)] transition hover:bg-white/5"
          >
            Open workspace
          </Link>
        </div>
      </div>
    </main>
  );
}
