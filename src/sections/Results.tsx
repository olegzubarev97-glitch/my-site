import { useEffect, useRef } from "react";
import { useContentMap } from "@/hooks/useContentMap";
import { TESTIMONIALS, BEFORE_AFTER } from "@/config/siteConfig";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function Results() {
  const { getContent } = useContentMap();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".result-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="results" className="py-20 bg-[#FAF9F7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl text-center text-[#1E1E1E] mb-12">
          {getContent("results_title", "Результаты наших клиентов")}
        </h2>

        {/* Before/After placeholders */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {BEFORE_AFTER.map((item, i) => (
            <div
              key={i}
              className="result-card bg-white rounded-2xl p-6 border border-[#E8E5E0] text-center"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="aspect-[3/4] bg-[#F5F1EB] rounded-xl flex items-center justify-center">
                  <span className="text-sm text-[#6B6B6B]">До</span>
                </div>
                <div className="aspect-[3/4] bg-[#6B7B5E]/10 rounded-xl flex items-center justify-center">
                  <span className="text-sm text-[#6B7B5E] font-medium">После</span>
                </div>
              </div>
              <div className="text-[#E07B3A] font-semibold mb-1">{item.label}</div>
              <div className="text-sm text-[#6B6B6B]">{item.name}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="result-card bg-white rounded-2xl p-6 border border-[#E8E5E0]"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#E07B3A] text-[#E07B3A]" />
                ))}
              </div>
              <p className="text-[#1E1E1E] mb-4 text-sm leading-relaxed">{t.text}</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-[#1E1E1E]">{t.name}</span>
                <span className="text-xs text-[#6B6B6B]">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
