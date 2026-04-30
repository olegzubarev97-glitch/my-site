import { useEffect, useRef } from "react";
import { useContentMap } from "@/hooks/useContentMap";
import { FAQ_ITEMS } from "@/config/siteConfig";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function FAQ() {
  const { getContent } = useContentMap();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".faq-wrapper",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="py-20 bg-[#FAF9F7]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl text-center text-[#1E1E1E] mb-12">
          Частые вопросы
        </h2>

        <div className="faq-wrapper">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-white rounded-xl border border-[#E8E5E0] px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left text-[#1E1E1E] hover:no-underline py-5 text-base">
                  {getContent(item.qKey, "")}
                </AccordionTrigger>
                <AccordionContent className="text-[#6B6B6B] pb-5">
                  {getContent(item.aKey, "")}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
