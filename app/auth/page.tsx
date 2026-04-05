import { Suspense } from "react";
import { AuthPanel } from "@/components/auth-panel";

function AuthPageFallback() {
  return (
    <main className="mx-auto w-[min(calc(100%-36px),1440px)] py-12">
      <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.94),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.3)]">
        <div className="mb-4 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Unified access
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-[clamp(2.8rem,5vw,4.5rem)] leading-none tracking-[-0.055em] text-[var(--text)]">
          Loading secure access
        </h1>
        <p className="max-w-2xl text-[0.96rem] leading-7 text-[var(--muted)]">
          Stablelane is preparing the unified login experience.
        </p>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <main className="mx-auto w-[min(calc(100%-36px),1440px)] py-12">
        <AuthPanel />
      </main>
    </Suspense>
  );
}
