"use client";

import { motion } from "framer-motion";
import type { Service } from "@prisma/client";
import { Sparkles, Footprints, Gem, RefreshCw, Paintbrush, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatAgorot, formatDurationHe } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  footprints: Footprints,
  gem: Gem,
  "refresh-cw": RefreshCw,
  paintbrush: Paintbrush,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function StepService({ services, onSelect }: { services: Service[]; onSelect: (service: Service) => void }) {
  return (
    <div>
      <h2 className="mb-1 font-display text-2xl font-semibold text-ink">בחרי טיפול</h2>
      <p className="mb-6 text-sm text-muted-foreground">בחרי את הטיפול שתרצי להזמין, ונמשיך לבחירת תאריך ושעה</p>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const Icon = ICONS[service.icon ?? ""] ?? Sparkles;
          return (
            <motion.div key={service.id} variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Card
                role="button"
                tabIndex={0}
                onClick={() => onSelect(service)}
                onKeyDown={(e) => e.key === "Enter" && onSelect(service)}
                className="group cursor-pointer overflow-hidden border-nude-200 p-5 transition-shadow hover:shadow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${service.colorTag}1f`, color: service.colorTag }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-lg font-semibold text-gold-dark">
                    {formatAgorot(service.priceAgorot)}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{service.name}</h3>
                {service.description && <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>}
                <p className="mt-3 text-xs font-medium text-nude-500">{formatDurationHe(service.durationMin)}</p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
