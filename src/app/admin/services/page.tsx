import { ServiceList } from "@/components/admin/service-list";
import { getAllServicesAdmin } from "@/lib/actions/services";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await getAllServicesAdmin();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl font-semibold text-ink">טיפולים ומחירים</h1>
      <p className="mb-8 text-sm text-muted-foreground">הוספה, עריכה, הסתרה ומחיקה של טיפולים — משפיע מיידית על אתר ההזמנות</p>
      <ServiceList initialServices={services} />
    </div>
  );
}
