import { useEffect, useRef } from "react";
import { useContentMap } from "@/hooks/useContentMap";
import { HOW_TO_STEPS } from "@/config/siteConfig";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HowToOrder() {
  const { getContent } = useContentMap();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".step-item",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="howto" className="py-20 bg-[#F5F1EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl text-center text-[#1E1E1E] mb-12">
          {getContent("howto_title", "Как начать питаться правильно")}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_TO_STEPS.map((step, i) => (
            <div key={i} className="step-item relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#6B7B5E] text-white flex items-center justify-center text-xl font-bold mb-4 relative z-10">
                  {i + 1}
                </div>
                {i < HOW_TO_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-[#E8E5E0]" />
                )}
                <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                  {getContent(step.titleKey, "")}
                </h3>
                <p className="text-sm text-[#6B6B6B]">{getContent(step.textKey, "")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
