import { ClientList } from "@/components/admin/client-list";
import { getClients } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await getClients();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl font-semibold text-ink">לקוחות</h1>
      <p className="mb-8 text-sm text-muted-foreground">חיפוש מהיר, כרטיס לקוח עם הערות והיסטוריית טיפולים</p>
      <ClientList initialClients={clients} />
    </div>
  );
}
