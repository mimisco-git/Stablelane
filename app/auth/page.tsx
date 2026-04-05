import { Suspense } from "react";
import { AuthPanel } from "@/components/auth-panel";

function AuthPageFallback() {
  return (
    <main className="mx-auto w-[min(calc(100%-36px),1280px)] py-8" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 8rem)",
          borderRadius: "28px",
          border: "0.5px solid rgba(255,255,255,0.07)",
          background: "linear-gradient(180deg, rgba(16,27,20,0.94) 0%, rgba(10,18,13,0.9) 100%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c9ff60", margin: "0 auto 1rem", animation: "pulse 1.5s infinite" }} />
          <p style={{ fontSize: "0.9rem", color: "#a5b4aa" }}>Loading secure access...</p>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <main
        className="mx-auto w-[min(calc(100%-36px),1280px)]"
        style={{ paddingTop: "2rem", paddingBottom: "2rem", minHeight: "calc(100vh - 4rem)" }}
      >
        <AuthPanel />
      </main>
    </Suspense>
  );
}
