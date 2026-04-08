import { ClientPortalView } from "@/components/client-portal-view";

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="min-h-screen">
      <ClientPortalView clientId={id} />
    </main>
  );
}
