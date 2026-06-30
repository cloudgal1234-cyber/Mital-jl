"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const PLACEHOLDER_ITEMS = Array.from({ length: 9 }, (_, i) => ({
  id: `placeholder-${i}`,
  src: `/images/gallery-${i + 1}.svg`,
  title: [
    "מניקור ג'ל קלאסי",
    "פדיקור ספא",
    "אומברה עדינה",
    "בניית ציפורניים",
    "לק חלבי",
    "עיצוב מיוחד",
    "פרנץ' מודרני",
    "גימור פנינה",
    "ציפורניים זהובות",
  ][i],
}));

export function Gallery({ images }: { images: { id: string; title: string | null; dataUrl: string }[] }) {
  const items =
    images.length > 0
      ? images.map((img) => ({ id: img.id, src: img.dataUrl, title: img.title ?? "" }))
      : PLACEHOLDER_ITEMS;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? null : (i + 1) % items.length));
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  return (
    <section id="gallery" className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">תיק עבודות</span>
        <h2 className="mt-3 font-display text-4xl font-semibold text-ink">העבודות שלנו</h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      >
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -6 }}
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-2xl shadow-soft"
          >
            <motion.img
              src={item.src}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {item.title && (
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/60 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-sm font-medium text-pearl-50">{item.title}</span>
              </div>
            )}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
            onClick={() => setOpenIndex(null)}
          >
            <motion.div
              key={items[openIndex].id}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-2xl bg-pearl-50 shadow-soft"
            >
              <img src={items[openIndex].src} alt={items[openIndex].title} className="max-h-[75vh] w-full object-cover" />
              <div className="flex items-center justify-between p-4">
                <span className="font-display text-lg font-semibold text-ink">{items[openIndex].title}</span>
                <button
                  onClick={() => setOpenIndex(null)}
                  className="rounded-full p-2 text-ink/60 transition-colors hover:bg-nude-100 hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
