import { Suspense } from "react";
import { InvitationAcceptanceCenter } from "@/components/invitation-acceptance-center";

function AcceptInviteFallback() {
  return (
    <main className="mx-auto w-[min(calc(100%-36px),1280px)] py-12">
      <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Invitation access
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Loading invitation
        </h1>
        <p className="max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
          Stablelane is preparing the invitation acceptance flow.
        </p>
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AcceptInviteFallback />}>
      <main className="mx-auto w-[min(calc(100%-36px),1280px)] py-12">
        <InvitationAcceptanceCenter />
      </main>
    </Suspense>
  );
}
