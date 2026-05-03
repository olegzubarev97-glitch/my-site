import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flame, ArrowRight, Eye } from "lucide-react";
import { RationMenuDialog } from "@/components/RationMenuDialog";

gsap.registerPlugin(ScrollTrigger);

interface RationsProps {
  onSelectRation: (id: number) => void;
}

const DAY_OPTIONS = [
  { label: "1 день", days: 1, key: "price1Day" as const },
  { label: "5 дней", days: 5, key: "price5Days" as const },
  { label: "7 дней", days: 7, key: "price7Days" as const },
  { label: "14 дней", days: 14, key: "price14Days" as const },
];

export function Rations({ onSelectRation }: RationsProps) {
  const { data: rations, isLoading } = trpc.ration.list.useQuery();
  const sectionRef = useRef<HTMLElement>(null);
  const [menuSlug, setMenuSlug] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!rations || isLoading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".ration-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [rations, isLoading]);

  const getPrice = (ration: any, days: number) => {
    if (days === 1) return ration.price1Day;
    if (days === 5) return ration.price5Days;
    if (days === 7) return ration.price7Days;
    if (days === 14) return ration.price14Days;
    return ration.price1Day;
  };

  if (isLoading) {
    return (
      <section ref={sectionRef} id="rations" className="py-20 bg-[#FAF9F7]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-96 bg-[#F5F1EB] rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="rations" className="py-20 bg-[#FAF9F7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl text-[#1E1E1E] mb-4">Выберите свой рацион</h2>
          <p className="text-[#6B6B6B] max-w-lg mx-auto">
            5 программ питания для любой цели — от похудения до набора массы
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {rations?.map((ration) => {
            const days = selectedDays[ration.id] ?? 1;
            const price = getPrice(ration, days);
            return (
              <div
                key={ration.id}
                className="ration-card bg-white rounded-2xl overflow-hidden border border-[#E8E5E0] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={ration.imageUrl || "/images/hero_food_1.jpg"}
                    alt={ration.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-[#E07B3A] text-white text-sm font-semibold rounded-full flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    {ration.calories} ккал
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold text-[#1E1E1E] mb-1">{ration.name}</h3>
                  <p className="text-sm text-[#6B6B6B] mb-3">{ration.calories} ккал в день</p>

                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <span className="bg-[#F5F1EB] px-2 py-1 rounded text-[#1E1E1E]">
                      Б {ration.protein}г
                    </span>
                    <span className="bg-[#F5F1EB] px-2 py-1 rounded text-[#1E1E1E]">
                      Ж {ration.fat}г
                    </span>
                    <span className="bg-[#F5F1EB] px-2 py-1 rounded text-[#1E1E1E]">
                      У {ration.carbs}г
                    </span>
                  </div>

                  <p className="text-sm text-[#6B6B6B] mb-2 flex-1">
                    {ration.targetAudience || ration.description}
                  </p>

                  {/* Day selector tabs */}
                  <div className="flex gap-1 mb-3">
                    {DAY_OPTIONS.map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() =>
                          setSelectedDays((prev) => ({ ...prev, [ration.id]: opt.days }))
                        }
                        className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors ${
                          days === opt.days
                            ? "bg-[#6B7B5E] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 border-t border-[#E8E5E0]">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-[#1E1E1E]">
                        {price.toLocaleString("ru-RU")} ₽
                      </span>
                      <span className="text-sm text-[#6B6B6B]">
                        / {DAY_OPTIONS.find((d) => d.days === days)?.label.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#6B7B5E] text-[#6B7B5E] hover:bg-[#6B7B5E]/5"
                        onClick={() => {
                          setMenuSlug(ration.slug);
                          setMenuOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Меню
                      </Button>
                      <Button
                        onClick={() => onSelectRation(ration.id)}
                        className="flex-1 bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white"
                      >
                        Выбрать
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <RationMenuDialog
        slug={menuSlug}
        open={menuOpen}
        onOpenChange={setMenuOpen}
      />
    </section>
  );
}
