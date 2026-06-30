"use client";

import { useMemo, useState, useTransition } from "react";
import { addDays, addMinutes, differenceInMinutes, format, isSameDay, setHours, setMinutes, startOfDay } from "date-fns";
import { he } from "date-fns/locale";
import { motion } from "framer-motion";
import { CalendarOff, Phone, ShieldOff, User2, X } from "lucide-react";
import type { AppointmentStatus, Client, EntryType, Service } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatAgorot, formatTimeHe } from "@/lib/utils";
import { cancelEntry, createBlock } from "@/lib/actions/admin";
import { BlockSlotDialog } from "./block-slot-dialog";

type EntryWithRelations = {
  id: string;
  type: EntryType;
  status: AppointmentStatus;
  startTime: Date;
  endTime: Date;
  notes: string | null;
  client: Client | null;
  service: Service | null;
};

const WINDOW_START_HOUR = 8;
const WINDOW_END_HOUR = 20;
const PX_PER_MIN = 1.4;
const BLOCK_LABELS: Record<string, string> = { BREAK: "הפסקה", VACATION: "חופשה", BLOCKED: "חסימה" };

export function CalendarView({
  entries,
  services,
  weekStart,
}: {
  entries: EntryWithRelations[];
  services: Service[];
  weekStart: Date;
}) {
  const [blockDialogStart, setBlockDialogStart] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<EntryWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const hours = useMemo(
    () => Array.from({ length: WINDOW_END_HOUR - WINDOW_START_HOUR }, (_, i) => WINDOW_START_HOUR + i),
    [],
  );
  const totalHeight = (WINDOW_END_HOUR - WINDOW_START_HOUR) * 60 * PX_PER_MIN;

  function windowStartFor(day: Date) {
    return setMinutes(setHours(startOfDay(day), WINDOW_START_HOUR), 0);
  }

  function entriesForDay(day: Date) {
    return entries.filter((e) => isSameDay(e.startTime, day) || isSameDay(e.endTime, day));
  }

  async function handleBlockFullDay(day: Date) {
    const start = setMinutes(setHours(day, WINDOW_START_HOUR), 0);
    const end = setMinutes(setHours(day, WINDOW_END_HOUR), 0);
    startTransition(async () => {
      await createBlock({ type: "VACATION", startTime: start, endTime: end, notes: "יום חופש מלא" });
    });
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      await cancelEntry(id);
      setSelectedEntry(null);
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">קוד צבעים:</span>
        {services.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5 text-xs text-ink/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.colorTag }} />
            {s.name}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-ink/70">
          <span className="h-2.5 w-2.5 rounded-full bg-nude-400" /> חסימה / חופשה
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-nude-200 bg-pearl-50 shadow-soft">
        <div className="grid min-w-[900px] grid-cols-[64px_repeat(7,1fr)]">
          <div className="border-b border-nude-200 p-2" />
          {days.map((day) => (
            <div key={day.toISOString()} className="flex flex-col items-center gap-1 border-b border-r border-nude-200 p-2 last:border-l">
              <span className="text-xs font-medium text-muted-foreground">{format(day, "EEEE", { locale: he })}</span>
              <span className={cn("font-display text-sm font-semibold", isSameDay(day, new Date()) && "text-primary")}>
                {format(day, "d/M")}
              </span>
              <button
                onClick={() => handleBlockFullDay(day)}
                disabled={isPending}
                title="חסום יום שלם"
                className="mt-1 rounded-full p-1 text-ink/30 transition-colors hover:bg-nude-100 hover:text-destructive"
              >
                <CalendarOff className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <div className="relative border-r border-nude-200" style={{ height: totalHeight }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-0 left-0 -translate-y-1/2 px-1 text-[10px] text-muted-foreground"
                style={{ top: (h - WINDOW_START_HOUR) * 60 * PX_PER_MIN }}
              >
                {h}:00
              </div>
            ))}
          </div>

          {days.map((day) => {
            const windowStart = windowStartFor(day);
            const dayEntries = entriesForDay(day);
            const slotCount = ((WINDOW_END_HOUR - WINDOW_START_HOUR) * 60) / 30;

            return (
              <div key={day.toISOString()} className="relative border-r border-nude-200 last:border-l" style={{ height: totalHeight }}>
                {Array.from({ length: slotCount }, (_, i) => {
                  const slotStart = addMinutes(windowStart, i * 30);
                  return (
                    <button
                      key={i}
                      onClick={() => setBlockDialogStart(slotStart)}
                      className="absolute inset-x-0 border-b border-dashed border-nude-100 transition-colors hover:bg-powder-50/60"
                      style={{ top: i * 30 * PX_PER_MIN, height: 30 * PX_PER_MIN }}
                    />
                  );
                })}

                {dayEntries.map((entry) => {
                  const top = Math.max(0, differenceInMinutes(entry.startTime, windowStart)) * PX_PER_MIN;
                  const height = Math.max(differenceInMinutes(entry.endTime, entry.startTime) * PX_PER_MIN, 20);
                  const isAppointment = entry.type === "APPOINTMENT";
                  const color = isAppointment ? entry.service?.colorTag ?? "#cf6a85" : "#c69b6a";

                  return (
                    <motion.button
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntry(entry);
                      }}
                      className="absolute inset-x-1 z-10 overflow-hidden rounded-lg border px-2 py-1 text-right shadow-sm transition-shadow hover:shadow-soft"
                      style={{ top, height, backgroundColor: `${color}26`, borderColor: `${color}80` }}
                    >
                      <p className="truncate text-[11px] font-semibold" style={{ color }}>
                        {isAppointment ? entry.client?.fullName ?? "לקוחה" : BLOCK_LABELS[entry.type] ?? entry.type}
                      </p>
                      <p className="truncate text-[10px] text-ink/60">{formatTimeHe(entry.startTime)}</p>
                    </motion.button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <BlockSlotDialog open={!!blockDialogStart} onOpenChange={(o) => !o && setBlockDialogStart(null)} initialStart={blockDialogStart} />

      <Dialog open={!!selectedEntry} onOpenChange={(o) => !o && setSelectedEntry(null)}>
        <DialogContent>
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEntry.type === "APPOINTMENT" ? "פרטי תור" : BLOCK_LABELS[selectedEntry.type]}</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-right">
                <Badge variant="outline">
                  {formatTimeHe(selectedEntry.startTime)} – {formatTimeHe(selectedEntry.endTime)} ·{" "}
                  {format(selectedEntry.startTime, "d/M/yyyy")}
                </Badge>

                {selectedEntry.type === "APPOINTMENT" ? (
                  <>
                    <p className="flex items-center gap-2 text-sm text-ink">
                      <User2 className="h-4 w-4 text-gold-dark" /> {selectedEntry.client?.fullName}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-ink/70" dir="ltr">
                      <Phone className="h-4 w-4 text-gold-dark" /> {selectedEntry.client?.phone}
                    </p>
                    {selectedEntry.service && (
                      <p className="text-sm text-ink/70">
                        {selectedEntry.service.name} · {formatAgorot(selectedEntry.service.priceAgorot)}
                      </p>
                    )}
                    {selectedEntry.notes && <p className="rounded-xl bg-nude-50 p-3 text-sm text-ink/70">{selectedEntry.notes}</p>}
                  </>
                ) : (
                  selectedEntry.notes && <p className="text-sm text-ink/70">{selectedEntry.notes}</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => handleCancel(selectedEntry.id)} disabled={isPending}>
                  <ShieldOff className="ml-1.5 h-4 w-4" />
                  {selectedEntry.type === "APPOINTMENT" ? "ביטול תור" : "ביטול חסימה"}
                </Button>
                <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
                  <X className="ml-1.5 h-4 w-4" /> סגירה
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
