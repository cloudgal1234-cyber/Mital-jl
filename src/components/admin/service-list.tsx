"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import type { Service } from "@prisma/client";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatAgorot, formatDurationHe } from "@/lib/utils";
import { deleteService, toggleServiceActive } from "@/lib/actions/services";
import { ServiceFormDialog } from "./service-form-dialog";

export function ServiceList({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setDialogOpen(true);
  }

  function handleToggle(service: Service) {
    startTransition(async () => {
      const res = await toggleServiceActive(service.id, !service.active);
      if (res.success) {
        setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, active: !service.active } : s)));
      }
    });
  }

  function handleDelete(service: Service) {
    if (!confirm(`למחוק את "${service.name}" לצמיתות?`)) return;
    startTransition(async () => {
      const res = await deleteService(service.id);
      if (res.success) {
        setServices((prev) => prev.filter((s) => s.id !== service.id));
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> טיפול חדש
        </Button>
      </div>

      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <motion.div key={service.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <Card className={`p-4 ${!service.active ? "opacity-50" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: service.colorTag }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{service.name}</p>
                  {service.category && <p className="text-xs text-muted-foreground">{service.category}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDurationHe(service.durationMin)} · {formatAgorot(service.priceAgorot)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-1.5 border-t border-nude-200 pt-3">
                <Button variant="ghost" size="icon" disabled={isPending} onClick={() => handleToggle(service)} title={service.active ? "הסתרה מהאתר" : "הצגה באתר"}>
                  {service.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(service)} title="עריכה">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled={isPending} onClick={() => handleDelete(service)} title="מחיקה" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        {services.length === 0 && <p className="text-sm text-muted-foreground">אין עדיין טיפולים — לחצי על &quot;טיפול חדש&quot;</p>}
      </motion.div>

      <ServiceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} service={editing} />
    </div>
  );
}
