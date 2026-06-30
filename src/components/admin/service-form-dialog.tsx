"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createService, updateService } from "@/lib/actions/services";

const COLOR_PRESETS = ["#cf6a85", "#a87f50", "#c9a961", "#7a8c6f", "#6a7fcf"];

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMin, setDurationMin] = useState("60");
  const [priceShekel, setPriceShekel] = useState("");
  const [category, setCategory] = useState("");
  const [colorTag, setColorTag] = useState(COLOR_PRESETS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (service) {
      setName(service.name);
      setDescription(service.description ?? "");
      setDurationMin(String(service.durationMin));
      setPriceShekel(String(service.priceAgorot / 100));
      setCategory(service.category ?? "");
      setColorTag(service.colorTag);
    } else {
      setName("");
      setDescription("");
      setDurationMin("60");
      setPriceShekel("");
      setCategory("");
      setColorTag(COLOR_PRESETS[0]);
    }
  }, [open, service]);

  function handleSubmit() {
    setError(null);
    const priceAgorot = Math.round(Number(priceShekel) * 100);
    const input = {
      name,
      description: description || undefined,
      durationMin: Number(durationMin),
      priceAgorot,
      category: category || undefined,
      colorTag,
    };

    startTransition(async () => {
      const res = service ? await updateService(service.id, input) : await createService(input);
      if (res.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "עריכת טיפול" : "טיפול חדש"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="service-name">שם הטיפול</Label>
            <Input id="service-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: מניקור ג'ל" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-description">תיאור (אופציונלי)</Label>
            <Textarea id="service-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="service-duration">משך (דקות)</Label>
              <Input id="service-duration" type="number" min={5} value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service-price">מחיר (₪)</Label>
              <Input id="service-price" type="number" min={0} value={priceShekel} onChange={(e) => setPriceShekel(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-category">קטגוריה (אופציונלי)</Label>
            <Input id="service-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="לדוגמה: מניקור" />
          </div>

          <div className="space-y-1.5">
            <Label>צבע לסימון ביומן</Label>
            <div className="flex gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorTag(color)}
                  className="h-8 w-8 rounded-full transition-transform"
                  style={{
                    backgroundColor: color,
                    outline: colorTag === color ? "2px solid #1a1a1a" : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "שומר..." : "שמירה"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
