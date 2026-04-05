import { AuthPanel } from "@/components/auth-panel";

export default function AuthPage() {
  return (
    <main className="mx-auto w-[min(calc(100%-36px),1360px)] py-12">
      <AuthPanel />
    </main>
  );
}
