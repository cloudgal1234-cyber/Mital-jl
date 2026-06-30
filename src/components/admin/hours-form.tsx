"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateBusinessHours } from "@/lib/actions/hours";

const WEEKDAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

type Day = { weekday: number; openTime: string; closeTime: string; isClosed: boolean };

export function HoursForm({ initialHours }: { initialHours: Day[] }) {
  const [days, setDays] = useState<Day[]>(initialHours);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function update(weekday: number, patch: Partial<Day>) {
    setSaved(false);
    setDays((prev) => prev.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)));
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateBusinessHours(days);
      if (res.success) {
        setSaved(true);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <Card className="divide-y divide-nude-200 p-2">
        {days.map((day) => (
          <div key={day.weekday} className="flex flex-wrap items-center gap-3 p-3">
            <span className="w-14 shrink-0 text-sm font-semibold text-ink">{WEEKDAY_LABELS[day.weekday]}</span>

            <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={day.isClosed}
                onChange={(e) => update(day.weekday, { isClosed: e.target.checked })}
              />
              סגור
            </label>

            <div className="flex items-center gap-1.5">
              <Input
                type="time"
                className="w-28"
                value={day.openTime}
                disabled={day.isClosed}
                onChange={(e) => update(day.weekday, { openTime: e.target.value })}
              />
              <span className="text-xs text-muted-foreground">עד</span>
              <Input
                type="time"
                className="w-28"
                value={day.closeTime}
                disabled={day.isClosed}
                onChange={(e) => update(day.weekday, { closeTime: e.target.value })}
              />
            </div>
          </div>
        ))}
      </Card>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      {saved && !error && <p className="mt-3 text-xs text-emerald-600">השעות נשמרו בהצלחה</p>}

      <Button className="mt-4" onClick={handleSave} disabled={isPending}>
        {isPending ? "שומר..." : "שמירת שעות פעילות"}
      </Button>
    </div>
  );
}
