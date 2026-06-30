import Link from "next/link";
import { Building2, CalendarDays, Clock, Images, LogOut, Scissors, Sparkles, Users } from "lucide-react";
import { logoutAdmin } from "@/lib/actions/auth";

const NAV_LINKS = [
  { href: "/admin", label: "יומן", icon: CalendarDays },
  { href: "/admin/clients", label: "לקוחות", icon: Users },
  { href: "/admin/services", label: "טיפולים ומחירים", icon: Scissors },
  { href: "/admin/hours", label: "שעות פעילות", icon: Clock },
  { href: "/admin/business", label: "פרטי העסק", icon: Building2 },
  { href: "/admin/gallery", label: "גלריה", icon: Images },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-pearl-100 md:flex-row">
      <header className="flex flex-col gap-3 border-b border-nude-200 bg-pearl-50 p-4 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Sparkles className="h-5 w-5 text-gold" /> מיטל ג&apos;ל
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold-dark">ניהול</span>
          </div>
          <form action={logoutAdmin}>
            <button className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium text-ink/60 transition-colors hover:bg-nude-100 hover:text-destructive">
              <LogOut className="h-4 w-4" /> התנתקות
            </button>
          </form>
        </div>

        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium text-ink/80 transition-colors hover:bg-nude-100"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
      </header>

      <aside className="hidden w-64 flex-col border-l border-nude-200 bg-pearl-50 p-6 md:flex">
        <div className="mb-10 flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <Sparkles className="h-5 w-5 text-gold" /> מיטל ג&apos;ל
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold-dark">ניהול</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:bg-nude-100"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>

        <form action={logoutAdmin}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-nude-100 hover:text-destructive">
            <LogOut className="h-4 w-4" /> התנתקות
          </button>
        </form>
      </aside>

      <div className="flex-1 p-4 md:p-10">{children}</div>
    </div>
  );
}
