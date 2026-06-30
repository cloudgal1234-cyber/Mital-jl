import { Instagram, MapPin, Navigation, Phone, Sparkles } from "lucide-react";
import { getGoogleMapsUrl, getWazeUrl } from "@/lib/business";
import { getBusinessInfo } from "@/lib/actions/business";
import { getBusinessHours } from "@/lib/actions/hours";

const DAY_LABELS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "שבת"];

export async function Footer() {
  const [info, hours] = await Promise.all([getBusinessInfo(), getBusinessHours()]);

  return (
    <footer id="about" className="border-t border-nude-200 bg-pearl-100 py-14">
      <div className="container grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
            <Sparkles className="h-5 w-5 text-gold" />
            {info.name}
          </div>
          <p className="mt-3 text-sm text-ink/60">סטודיו ציפורניים פרטי ויוקרתי, מטפלות מנוסות וחומרים איכותיים בלבד.</p>
        </div>

        <div className="space-y-2 text-sm text-ink/70">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold-dark" /> {info.address}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gold-dark" /> {info.phone}
          </p>
          {info.instagram && (
            <p className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-gold-dark" /> {info.instagram}
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href={getWazeUrl(info.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Navigation className="h-3.5 w-3.5" /> ניווט ב-Waze
            </a>
            <a
              href={getGoogleMapsUrl(info.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Navigation className="h-3.5 w-3.5" /> ניווט ב-Google Maps
            </a>
          </div>
        </div>

        <div className="text-sm text-ink/70">
          <p className="font-medium text-ink">שעות פעילות</p>
          <div className="mt-2 space-y-0.5">
            {hours.map((h) => (
              <p key={h.weekday}>
                {DAY_LABELS[h.weekday]}: {h.isClosed ? "סגור" : `${h.openTime}–${h.closeTime}`}
              </p>
            ))}
          </div>
        </div>
      </div>

      <p className="container mt-10 text-xs text-ink/40">
        © {new Date().getFullYear()} {info.name}. כל הזכויות שמורות.
      </p>
    </footer>
  );
}
