"use client";

import { motion } from "framer-motion";
import type { Service } from "@prisma/client";
import Link from "next/link";
import { Sparkles, Footprints, Gem, RefreshCw, Paintbrush, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatAgorot, formatDurationHe } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  footprints: Footprints,
  gem: Gem,
  "refresh-cw": RefreshCw,
  paintbrush: Paintbrush,
};

export function Pricing({ services }: { services: Service[] }) {
  return (
    <section id="pricing" className="bg-pearl-200/60 py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">מחירון</span>
          <h2 className="mt-3 font-display text-4xl font-semibold text-ink">הטיפולים שלנו</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => {
            const Icon = ICONS[service.icon ?? ""] ?? Sparkles;
            return (
              <motion.div
                key={service.id}
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -6 }}
              >
                <Card className="flex h-full flex-col p-6">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${service.colorTag}1f`, color: service.colorTag }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">{service.name}</h3>
                  {service.description && <p className="mt-2 flex-1 text-sm text-muted-foreground">{service.description}</p>}
                  <div className="mt-5 flex items-center justify-between border-t border-nude-200 pt-4">
                    <span className="text-xs font-medium text-nude-500">{formatDurationHe(service.durationMin)}</span>
                    <span className="font-display text-xl font-semibold text-gold-dark">{formatAgorot(service.priceAgorot)}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="gold">
            <Link href="/booking">קביעת תור</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
