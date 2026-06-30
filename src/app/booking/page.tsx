import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { getActiveServices } from "@/lib/actions/services";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const services = await getActiveServices();

  return (
    <main className="min-h-screen bg-pearl-100 py-16">
      <div className="container">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2 font-display text-xl font-semibold text-ink">
          <Sparkles className="h-5 w-5 text-gold" />
          מיטל <span className="text-primary">ג&apos;ל</span>
        </Link>
        <BookingWizard services={services} />
      </div>
    </main>
  );
}
