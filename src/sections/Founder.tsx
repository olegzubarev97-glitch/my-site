import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useContentMap } from "@/hooks/useContentMap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, Quote } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function Founder() {
  const { getContent, getConfig } = useContentMap();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".founder-img",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
      gsap.fromTo(
        ".founder-text",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-[#F5F1EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="founder-img">
            <img
              src="/images/founder.jpg"
              alt={getContent("founder_name", "Олег Зубарев")}
              className="w-full max-w-md mx-auto lg:mx-0 rounded-3xl shadow-xl object-cover aspect-[3/4]"
            />
          </div>
          <div className="founder-text">
            <Quote className="w-10 h-10 text-[#6B7B5E]/30 mb-4" />
            <blockquote className="text-xl sm:text-2xl text-[#1E1E1E] leading-relaxed mb-6 italic">
              {getContent("founder_quote", "Правильное питание — это фундамент, на котором строится всё: здоровье, энергия, спортивные результаты и качество жизни.")}
            </blockquote>
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-1">
              {getContent("founder_name", "Олег Зубарев")}
            </h3>
            <p className="text-[#6B6B6B] mb-4">
              {getContent("founder_role", "Основатель in balance nutrition. Фитнес-тренер и нутрициолог.")}
            </p>
            <p className="text-[#6B6B6B] mb-6 leading-relaxed">
              {getContent("founder_text", "Много лет я работаю в сфере фитнеса, и спорт — моё главное призвание. Я убеждён: питание — ключевой элемент нашей жизнедеятельности, особенно когда мы ведём активный образ жизни. Именно поэтому я принял решение не просто составлять рационы, но и организовывать их доставку. Чтобы вы не тратили силы и время на готовку, подсчёт калорий и прочие рутинные задачи. Мы разработали сбалансированное питание, которое подходит под любые цели — будь то набор массы, похудение или поддержание формы.")}
            </p>
            <a
              href={getConfig("founder_instagram", "https://www.instagram.com/zubarevoleg_kzn")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-[#6B7B5E] text-[#6B7B5E] hover:bg-[#6B7B5E] hover:text-white">
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
