"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { cn, formatTimeHe } from "@/lib/utils";
import { getAvailableSlots, type TimeSlot } from "@/lib/actions/booking";

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function StepDateTime({
  service,
  onSelect,
  onBack,
}: {
  service: Service;
  onSelect: (date: Date, time: string) => void;
  onBack: () => void;
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedTime(null);
    getAvailableSlots(service.id, toDateKey(date)).then((result) => {
      if (!cancelled) {
        setSlots(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [date, service.id]);

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink">
        <ArrowRight className="h-4 w-4" /> חזרה לבחירת טיפול
      </button>
      <h2 className="mb-1 font-display text-2xl font-semibold text-ink">בחרי תאריך ושעה</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {service.name} · {service.durationMin} דקות
      </p>

      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="rounded-2xl border border-nude-200 bg-pearl-50 p-3 shadow-soft">
          <DayPicker
            mode="single"
            dir="rtl"
            locale={he}
            selected={date}
            onSelect={(d) => d && setDate(d)}
            disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
            classNames={{
              months: "flex flex-col",
              caption: "flex justify-center py-2 relative items-center font-display text-ink",
              caption_label: "text-sm font-semibold",
              nav_button: "h-7 w-7 rounded-full hover:bg-nude-100 transition-colors",
              table: "w-full border-collapse",
              head_cell: "text-muted-foreground text-xs font-normal w-9",
              cell: "text-center text-sm p-0 relative",
              day: "h-9 w-9 rounded-full transition-colors hover:bg-powder-100 aria-selected:bg-primary aria-selected:text-primary-foreground",
              day_today: "font-bold text-gold-dark",
              day_disabled: "text-muted-foreground/40 hover:bg-transparent",
              day_outside: "text-muted-foreground/30",
            }}
          />
        </div>

        <div>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-40 items-center justify-center text-muted-foreground"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
              </motion.div>
            ) : slots.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-40 items-center justify-center text-center text-sm text-muted-foreground"
              >
                אין שעות פנויות בתאריך זה, נסי תאריך אחר
              </motion.p>
            ) : (
              <motion.div
                key={toDateKey(date)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 gap-2 sm:grid-cols-4"
              >
                {slots.map((slot) => {
                  const time = new Date(slot.startTime);
                  const isSelected = selectedTime === slot.startTime;
                  return (
                    <button
                      key={slot.startTime}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.startTime)}
                      className={cn(
                        "rounded-xl border px-2 py-2.5 text-sm font-medium transition-all",
                        !slot.available && "cursor-not-allowed border-transparent bg-nude-50 text-muted-foreground/40 line-through",
                        slot.available &&
                          !isSelected &&
                          "border-nude-200 bg-pearl-50 text-ink hover:border-primary hover:bg-powder-50",
                        isSelected && "border-primary bg-primary text-primary-foreground shadow-gold",
                      )}
                    >
                      {formatTimeHe(time)}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={!selectedTime}
            onClick={() => selectedTime && onSelect(date, selectedTime)}
          >
            המשך לפרטים אישיים
          </Button>
        </div>
      </div>
    </div>
  );
}
