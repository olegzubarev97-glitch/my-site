import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useContentMap } from "@/hooks/useContentMap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Send, Phone } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface FinalCTAProps {
  onOrderClick: () => void;
}

export function FinalCTA({ onOrderClick }: FinalCTAProps) {
  const { getContent } = useContentMap();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-content",
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-[#6B7B5E]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center">
        <div className="cta-content">
          <h2 className="text-3xl sm:text-4xl text-white mb-4">
            {getContent("cta_title", "Начни менять тело уже с этой недели")}
          </h2>
          <p className="text-lg text-white/80 mb-8">
            {getContent("cta_subtitle", "Первый рацион со скидкой 20%. Бесплатная консультация по подбору КБЖУ.")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Button
              onClick={onOrderClick}
              className="bg-white text-[#6B7B5E] hover:bg-white/90 h-12 px-8 text-base font-semibold"
            >
              Оставить заявку
            </Button>
            <a
              href="https://t.me/inbalancenutrition"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-6 rounded-md border border-white text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
              Telegram
            </a>
            <a
              href="tel:+79171234567"
              className="h-12 px-6 rounded-md border border-white text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Позвонить
            </a>
          </div>

          <p className="text-white/60 text-sm">
            {getContent("cta_trust", "Доставка по Казани. Оплата при получении.")}
          </p>
        </div>
      </div>
    </section>
  );
}
