"use client";

import { motion } from "framer-motion";
import type { Service } from "@prisma/client";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatAgorot, formatDateHe, formatTimeHe } from "@/lib/utils";

type SubmitResult = { success: true; appointmentId: string } | { success: false; error: string };

export function StepConfirm({
  service,
  time,
  isPending,
  result,
  onRestart,
  onBackToDateTime,
}: {
  service: Service;
  time: string;
  isPending: boolean;
  result: SubmitResult | null;
  onRestart: () => void;
  onBackToDateTime: () => void;
}) {
  const date = new Date(time);

  return (
    <div className="text-center">
      {isPending && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">שומרים את התור שלך...</p>
        </motion.div>
      )}

      {!isPending && result?.success && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          >
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          </motion.div>
          <h2 className="font-display text-2xl font-semibold text-ink">התור נקבע בהצלחה!</h2>
          <Card className="w-full max-w-sm p-5 text-right">
            <p className="font-medium text-ink">{service.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{formatDateHe(date)}</p>
            <p className="text-sm text-muted-foreground">בשעה {formatTimeHe(date)}</p>
            <p className="mt-2 font-display text-lg font-semibold text-gold-dark">{formatAgorot(service.priceAgorot)}</p>
          </Card>
          <Button size="lg" variant="gold" onClick={onRestart}>
            קביעת תור נוסף
          </Button>
        </motion.div>
      )}

      {!isPending && result && !result.success && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-6">
          <XCircle className="h-16 w-16 text-destructive" />
          <h2 className="font-display text-2xl font-semibold text-ink">לא הצלחנו לשמור את התור</h2>
          <p className="max-w-sm text-sm text-muted-foreground">{result.error}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBackToDateTime}>
              נסי שעה אחרת
            </Button>
            <Button variant="gold" onClick={onRestart}>
              התחלה מחדש
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
