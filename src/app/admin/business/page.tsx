import { BusinessForm } from "@/components/admin/business-form";
import { getBusinessInfo } from "@/lib/actions/business";

export const dynamic = "force-dynamic";

export default async function AdminBusinessPage() {
  const info = await getBusinessInfo();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl font-semibold text-ink">פרטי העסק</h1>
      <p className="mb-8 text-sm text-muted-foreground">שם, כתובת, טלפון ורשתות חברתיות — מוצג באתר ובאישורי התורים</p>
      <BusinessForm initial={info} />
    </div>
  );
}
