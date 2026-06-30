"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#gallery", label: "גלריה" },
  { href: "#pricing", label: "מחירון" },
  { href: "#about", label: "אודות" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "bg-pearl-50/85 shadow-soft backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <Sparkles className="h-5 w-5 text-gold" />
          מיטל <span className="text-primary">ג&apos;ל</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-ink/70 transition-colors hover:text-primary">
              {link.label}
            </a>
          ))}
        </nav>

        <Button asChild size="default">
          <Link href="/booking">קביעת תור</Link>
        </Button>
      </div>
    </motion.header>
  );
}
