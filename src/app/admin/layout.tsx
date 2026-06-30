import Link from "next/link";
import { CalendarDays, LogOut, Sparkles, Users } from "lucide-react";
import { logoutAdmin } from "@/lib/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-pearl-100">
      <aside className="hidden w-64 flex-col border-l border-nude-200 bg-pearl-50 p-6 md:flex">
        <div className="mb-10 flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <Sparkles className="h-5 w-5 text-gold" /> מיטל ג&apos;ל
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold-dark">ניהול</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:bg-nude-100">
            <CalendarDays className="h-4 w-4" /> יומן
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:bg-nude-100">
            <Users className="h-4 w-4" /> לקוחות
          </Link>
        </nav>

        <form action={logoutAdmin}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-nude-100 hover:text-destructive">
            <LogOut className="h-4 w-4" /> התנתקות
          </button>
        </form>
      </aside>

      <div className="flex-1 p-6 md:p-10">{children}</div>
    </div>
  );
}
