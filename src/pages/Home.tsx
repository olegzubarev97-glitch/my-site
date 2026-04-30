import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { OrderForm } from "@/components/OrderForm";
import { MobileStickyBar, WhatsAppButton } from "@/components/MobileStickyBar";
import { Hero } from "@/sections/Hero";
import { PainPoints } from "@/sections/PainPoints";
import { Rations } from "@/sections/Rations";
import { TrustFactors } from "@/sections/TrustFactors";
import { Gallery } from "@/sections/Gallery";
import { Founder } from "@/sections/Founder";
import { Results } from "@/sections/Results";
import { HowToOrder } from "@/sections/HowToOrder";
import { FAQ } from "@/sections/FAQ";
import { FinalCTA } from "@/sections/FinalCTA";
import { Footer } from "@/sections/Footer";

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRation, setSelectedRation] = useState<number | null>(null);

  const handleOrderClick = () => {
    setSelectedRation(null);
    setFormOpen(true);
  };

  const handleSelectRation = (id: number) => {
    setSelectedRation(id);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Navigation onOrderClick={handleOrderClick} />
      <Hero onOrderClick={handleOrderClick} />
      <PainPoints />
      <Rations onSelectRation={handleSelectRation} />
      <TrustFactors />
      <Gallery />
      <Founder />
      <Results />
      <HowToOrder />
      <FAQ />
      <FinalCTA onOrderClick={handleOrderClick} />
      <Footer />
      <MobileStickyBar onOrderClick={handleOrderClick} />
      <WhatsAppButton />
      <OrderForm open={formOpen} onOpenChange={setFormOpen} preSelectedRation={selectedRation} />
    </div>
  );
}
