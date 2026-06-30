"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBlock } from "@/lib/actions/admin";

const TYPE_LABELS = { BREAK: "הפסקה", VACATION: "חופשה", BLOCKED: "חסימה ידנית" } as const;

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function BlockSlotDialog({
  open,
  onOpenChange,
  initialStart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStart: Date | null;
}) {
  const [type, setType] = useState<keyof typeof TYPE_LABELS>("BREAK");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialStart) {
      setStart(toLocalInput(initialStart));
      setEnd(toLocalInput(new Date(initialStart.getTime() + 30 * 60 * 1000)));
      setError(null);
    }
  }, [initialStart]);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await createBlock({
        type,
        startTime: new Date(start),
        endTime: new Date(end),
        notes: notes || undefined,
      });
      if (res.success) {
        onOpenChange(false);
        setNotes("");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>חסימת זמן ביומן</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            {(Object.keys(TYPE_LABELS) as Array<keyof typeof TYPE_LABELS>).map((key) => (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  type === key ? "border-primary bg-powder-50 text-primary" : "border-nude-200 text-ink/70 hover:bg-nude-50"
                }`}
              >
                {TYPE_LABELS[key]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="block-start">מתאריך/שעה</Label>
              <Input id="block-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block-end">עד תאריך/שעה</Label>
              <Input id="block-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="block-notes">הערה (אופציונלי)</Label>
            <Textarea id="block-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="לדוגמה: חופשה משפחתית" />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "חוסם..." : "חסימת הזמן"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
