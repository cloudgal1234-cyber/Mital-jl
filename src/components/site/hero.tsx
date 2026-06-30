"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = ["/images/hero-1.svg", "/images/hero-2.svg", "/images/hero-3.svg"];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={SLIDES[index]}
            src={SLIDES[index]}
            alt=""
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-pearl-100 via-pearl-100/40 to-transparent" />
        <div className="absolute inset-0 bg-noise opacity-40" />
      </div>

      <motion.div
        className="absolute right-[8%] top-[22%] hidden text-gold/70 md:block"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-10 w-10" />
      </motion.div>
      <motion.div
        className="absolute left-[12%] top-[38%] hidden text-primary/60 md:block"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Star className="h-6 w-6" />
      </motion.div>

      <div className="container relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="max-w-xl"
        >
          <motion.span
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-pearl-50/70 px-4 py-1.5 text-xs font-medium text-gold-dark backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" /> סטודיו ציפורניים פרטי
          </motion.span>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7 }}
            className="font-display text-5xl font-semibold leading-tight text-ink sm:text-6xl"
          >
            ידיים מטופחות,
            <br />
            <span className="text-primary">חוויה מפנקת</span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7 }}
            className="mt-6 max-w-md text-lg text-ink/70"
          >
            מניקור, פדיקור ובניית ציפורניים באווירה יוקרתית ואינטימית. קבעי תור בכמה לחיצות, בכל שעה.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Button asChild size="lg" variant="gold">
              <Link href="/booking">קביעת תור עכשיו</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#gallery">לגלריית העבודות</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
