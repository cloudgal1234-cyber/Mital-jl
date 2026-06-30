"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { GalleryImage } from "@prisma/client";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addGalleryImage, deleteGalleryImage } from "@/lib/actions/gallery";

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const [images, setImages] = useState(initialImages);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    startTransition(async () => {
      try {
        const dataUrl = await resizeToDataUrl(file);
        const res = await addGalleryImage({ title: title.trim() || undefined, dataUrl });
        if (res.success) {
          setTitle("");
          router.refresh();
        } else {
          setError(res.error);
        }
      } catch {
        setError("שגיאה בעיבוד התמונה");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  function handleDelete(image: GalleryImage) {
    if (!confirm("למחוק את התמונה?")) return;
    startTransition(async () => {
      const res = await deleteGalleryImage(image.id);
      if (res.success) {
        setImages((prev) => prev.filter((img) => img.id !== image.id));
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Input
          placeholder="כותרת לתמונה (אופציונלי)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="max-w-xs"
        />
        <Button disabled={isPending} onClick={() => fileInputRef.current?.click()}>
          <ImagePlus className="h-4 w-4" /> {isPending ? "מעלה..." : "הוספת תמונה"}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {error && <p className="mb-4 text-xs text-destructive">{error}</p>}

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {images.map((image) => (
          <motion.div key={image.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <Card className="overflow-hidden p-0">
              <img src={image.dataUrl} alt={image.title ?? ""} className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2">
                <p className="truncate text-xs text-muted-foreground">{image.title || "—"}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleDelete(image)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        {images.length === 0 && <p className="text-sm text-muted-foreground">אין עדיין תמונות בגלריה — לחצי על &quot;הוספת תמונה&quot;</p>}
      </motion.div>
    </div>
  );
}
