import Link from "next/link";
import { addDays, endOfDay, format, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarView } from "@/components/admin/calendar-view";
import { getEntriesForRange } from "@/lib/actions/admin";
import { getActiveServices } from "@/lib/actions/services";

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const anchor = searchParams.week ? new Date(searchParams.week) : new Date();
  const weekStart = startOfWeek(anchor, { weekStartsOn: 0 });
  const weekEnd = endOfDay(addDays(weekStart, 6));

  const [entries, services] = await Promise.all([getEntriesForRange(weekStart, weekEnd), getActiveServices()]);

  const prevWeek = format(addDays(weekStart, -7), "yyyy-MM-dd");
  const nextWeek = format(addDays(weekStart, 7), "yyyy-MM-dd");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">יומן תורים</h1>
          <p className="text-sm text-muted-foreground">
            {format(weekStart, "d/M/yyyy")} – {format(addDays(weekStart, 6), "d/M/yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin?week=${prevWeek}`} className="rounded-full border border-nude-200 p-2 transition-colors hover:bg-nude-100">
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link href="/admin" className="rounded-full border border-nude-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-nude-100">
            השבוע
          </Link>
          <Link href={`/admin?week=${nextWeek}`} className="rounded-full border border-nude-200 p-2 transition-colors hover:bg-nude-100">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <CalendarView entries={entries} services={services} weekStart={weekStart} />
    </div>
  );
}
