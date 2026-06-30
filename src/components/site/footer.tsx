import { Instagram, MapPin, Phone, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer id="about" className="border-t border-nude-200 bg-pearl-100 py-14">
      <div className="container grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
            <Sparkles className="h-5 w-5 text-gold" />
            מיטל ג&apos;ל
          </div>
          <p className="mt-3 text-sm text-ink/60">סטודיו ציפורניים פרטי ויוקרתי, מטפלות מנוסות וחומרים איכותיים בלבד.</p>
        </div>

        <div className="space-y-2 text-sm text-ink/70">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold-dark" /> רחוב הדוגמה 12, תל אביב
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gold-dark" /> 050-0000000
          </p>
          <p className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-gold-dark" /> @mital.nails
          </p>
        </div>

        <div className="text-sm text-ink/70">
          <p className="font-medium text-ink">שעות פעילות</p>
          <p className="mt-2">א&apos;-ה&apos;: 09:00–19:00</p>
          <p>ו&apos;: 09:00–14:00</p>
          <p>שבת: סגור</p>
        </div>
      </div>

      <p className="container mt-10 text-xs text-ink/40">© {new Date().getFullYear()} מיטל ג&apos;ל. כל הזכויות שמורות.</p>
    </footer>
  );
}
