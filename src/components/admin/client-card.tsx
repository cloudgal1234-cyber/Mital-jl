"use client";

import { useEffect, useState, useTransition } from "react";
import { format } from "date-fns";
import { Phone, Mail, Save } from "lucide-react";
import type { Client, Service, ScheduleEntry } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatAgorot } from "@/lib/utils";
import { getClientDetail, updateClientNotes } from "@/lib/actions/admin";

type ClientDetail = Client & { entries: (ScheduleEntry & { service: Service | null })[] };

export function ClientCard({ clientId, onClose }: { clientId: string | null; onClose: () => void }) {
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setDetail(null);
      return;
    }
    getClientDetail(clientId).then((d) => {
      if (d) {
        setDetail(d as ClientDetail);
        setNotes(d.notes ?? "");
      }
    });
  }, [clientId]);

  function handleSave() {
    if (!clientId) return;
    setSaved(false);
    startTransition(async () => {
      await updateClientNotes(clientId, notes);
      setSaved(true);
    });
  }

  return (
    <Dialog open={!!clientId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        {detail && (
          <>
            <DialogHeader>
              <DialogTitle>{detail.fullName}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-4 text-sm text-ink/70">
              <span className="flex items-center gap-1.5" dir="ltr">
                <Phone className="h-4 w-4 text-gold-dark" /> {detail.phone}
              </span>
              {detail.email && (
                <span className="flex items-center gap-1.5" dir="ltr">
                  <Mail className="h-4 w-4 text-gold-dark" /> {detail.email}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-ink">הערות, אלרגיות והעדפות</p>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">היסטוריית טיפולים</p>
              <div className="max-h-56 space-y-2 overflow-y-auto pl-1">
                {detail.entries.length === 0 && <p className="text-sm text-muted-foreground">אין עדיין היסטוריית תורים</p>}
                {detail.entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl border border-nude-200 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-ink">{entry.service?.name ?? "טיפול"}</p>
                      <p className="text-xs text-muted-foreground">{format(entry.startTime, "d/M/yyyy HH:mm")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.service && <span className="text-xs text-gold-dark">{formatAgorot(entry.service.priceAgorot)}</span>}
                      <Badge variant={entry.status === "CANCELLED" ? "destructive" : "success"}>
                        {entry.status === "CANCELLED" ? "בוטל" : entry.status === "COMPLETED" ? "הושלם" : "מאושר"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSave} disabled={isPending}>
                <Save className="ml-1.5 h-4 w-4" /> {saved ? "נשמר!" : "שמירת הערות"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
