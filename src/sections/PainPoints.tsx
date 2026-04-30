import { useEffect, useRef } from "react";
import { useContentMap } from "@/hooks/useContentMap";
import { PAIN_POINTS, ICONS } from "@/config/siteConfig";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function PainPoints() {
  const { getContent } = useContentMap();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".pain-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-[#F5F1EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl text-center text-[#1E1E1E] mb-12">
          {getContent("pain_title", "Почему до сих пор нет результата?")}
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {PAIN_POINTS.map((point, i) => {
            const Icon = ICONS[point.icon] || ICONS.Target;
            return (
              <div
                key={i}
                className="pain-card bg-white rounded-2xl p-8 border border-[#E8E5E0] hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#6B7B5E]/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#6B7B5E]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                  {getContent(point.titleKey, "")}
                </h3>
                <p className="text-[#6B6B6B]">{getContent(point.textKey, "")}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-[#6B7B5E] rounded-3xl p-8 sm:p-10 text-center text-white">
          <p className="text-xl sm:text-2xl font-medium leading-relaxed">
            {getContent("pain_solution", "Мы уже всё приготовили за тебя. Точное КБЖУ. Вкусные блюда. Доставка каждый день.")}
          </p>
        </div>
      </div>
    </section>
  );
}
