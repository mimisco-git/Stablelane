import { AppEntryPanel } from "@/components/app-entry-panel";

export default function StartPage() {
  return (
    <main className="mx-auto w-[min(calc(100%-36px),1280px)] py-12">
      <AppEntryPanel />
    </main>
  );
}
