import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Phone } from "lucide-react";
import { useContentMap } from "@/hooks/useContentMap";
import gsap from "gsap";

interface HeroProps {
  onOrderClick: () => void;
}

export function Hero({ onOrderClick }: HeroProps) {
  const { getContent } = useContentMap();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const img1Ref = useRef<HTMLImageElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current?.querySelectorAll(".animate-item") || [],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(
        [img1Ref.current, img2Ref.current],
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.5 }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      if (img1Ref.current) {
        gsap.to(img1Ref.current, { x: -x, y: -y, duration: 1, ease: "power2.out" });
      }
      if (img2Ref.current) {
        gsap.to(img2Ref.current, { x: x, y: y, duration: 1, ease: "power2.out" });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAF9F7] pt-16"
    >
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#6B7B5E]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E07B3A]/10 rounded-full blur-3xl" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left image */}
          <div className="hidden lg:block">
            <img
              ref={img1Ref}
              src="/images/hero_food_1.jpg"
              alt="Healthy meal"
              className="w-64 h-64 object-cover rounded-3xl shadow-xl mx-auto"
            />
          </div>

          {/* Center text */}
          <div ref={textRef} className="text-center lg:col-span-1">
            <div className="animate-item inline-block px-4 py-2 bg-[#6B7B5E] text-white text-sm rounded-full mb-6">
              {getContent("hero_trust", "Создано фитнес тренером и нутрициологом")}
            </div>
            <h1 className="animate-item text-4xl sm:text-5xl lg:text-[56px] font-normal text-[#1E1E1E] leading-tight mb-6">
              {getContent("hero_title", "Рационы питания, которые меняют тело")}
            </h1>
            <p className="animate-item text-lg text-[#6B6B6B] mb-8 max-w-md mx-auto">
              {getContent("hero_subtitle", "Готовая вкусная еда с точным КБЖУ и доставкой каждый день в Казани")}
            </p>
            <div className="animate-item flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={onOrderClick}
                className="bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white h-12 px-6 text-base"
              >
                Заказать рацион
              </Button>
              <a
                href="https://t.me/inbalancenutrition"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#F5F1EB] flex items-center justify-center text-[#6B7B5E] hover:bg-[#6B7B5E] hover:text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href="tel:+79171234567"
                className="w-12 h-12 rounded-full bg-[#F5F1EB] flex items-center justify-center text-[#6B7B5E] hover:bg-[#6B7B5E] hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right image */}
          <div className="hidden lg:block">
            <img
              ref={img2Ref}
              src="/images/hero_food_2.jpg"
              alt="Healthy breakfast"
              className="w-64 h-64 object-cover rounded-3xl shadow-xl mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
