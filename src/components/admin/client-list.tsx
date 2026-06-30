"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, User2 } from "lucide-react";
import type { Client } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getClients } from "@/lib/actions/admin";
import { ClientCard } from "./client-card";

export function ClientList({ initialClients }: { initialClients: Client[] }) {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState(initialClients);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      getClients(query || undefined).then(setClients);
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  return (
    <div>
      <div className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש לפי שם או טלפון..." className="pr-10" />
      </div>

      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <motion.div key={client.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <Card
              role="button"
              onClick={() => setSelectedId(client.id)}
              className="flex cursor-pointer items-center gap-3 p-4 transition-shadow hover:shadow-gold"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-powder-100 text-primary">
                <User2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{client.fullName}</p>
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                  {client.phone}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}

        {clients.length === 0 && <p className="text-sm text-muted-foreground">לא נמצאו לקוחות</p>}
      </motion.div>

      <ClientCard clientId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
