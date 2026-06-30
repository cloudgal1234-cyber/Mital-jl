import { HoursForm } from "@/components/admin/hours-form";
import { getBusinessHours } from "@/lib/actions/hours";

export const dynamic = "force-dynamic";

export default async function AdminHoursPage() {
  const hours = await getBusinessHours();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl font-semibold text-ink">שעות פעילות</h1>
      <p className="mb-8 text-sm text-muted-foreground">קביעת שעות פתיחה וסגירה לכל יום בשבוע — משפיע מיידית על הזמינות באתר ההזמנות</p>
      <HoursForm initialHours={hours} />
    </div>
  );
}
