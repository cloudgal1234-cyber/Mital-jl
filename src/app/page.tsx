import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Gallery } from "@/components/site/gallery";
import { Pricing } from "@/components/site/pricing";
import { Footer } from "@/components/site/footer";
import { getActiveServices } from "@/lib/actions/services";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await getActiveServices();

  return (
    <main>
      <Navbar />
      <Hero />
      <Gallery />
      <Pricing services={services} />
      <Footer />
    </main>
  );
}
