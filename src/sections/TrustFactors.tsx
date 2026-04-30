import { useEffect, useRef } from "react";
import { useContentMap } from "@/hooks/useContentMap";
import { TRUST_FACTORS, ICONS } from "@/config/siteConfig";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function TrustFactors() {
  const { getContent } = useContentMap();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".trust-item",
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="trust" className="py-20 bg-[#F5F1EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl text-center text-[#1E1E1E] mb-12">
          Почему нам доверяют
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_FACTORS.map((factor, i) => {
            const Icon = ICONS[factor.icon] || ICONS.Shield;
            return (
              <div
                key={i}
                className="trust-item bg-white rounded-2xl p-6 border border-[#E8E5E0] hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-[#6B7B5E]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#6B7B5E]" />
                </div>
                <h3 className="text-base font-semibold text-[#1E1E1E] mb-2">
                  {getContent(factor.titleKey, "")}
                </h3>
                <p className="text-sm text-[#6B6B6B]">{getContent(factor.textKey, "")}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
