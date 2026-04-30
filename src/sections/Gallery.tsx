import { useEffect, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { useContentMap } from "@/hooks/useContentMap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Gallery() {
  const { getContent } = useContentMap();
  const { data: images } = trpc.gallery.list.useQuery();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gallery-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const galleryImages = images || [];

  return (
    <section ref={sectionRef} id="gallery" className="py-20 bg-[#FAF9F7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl text-[#1E1E1E] mb-4">
            {getContent("gallery_title", "Как выглядит твое питание")}
          </h2>
          <p className="text-[#6B6B6B]">
            {getContent("gallery_subtitle", "Реальные фото наших рационов. Никакого стока.")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((img, i) => (
            <div
              key={img.id}
              className={`gallery-item relative rounded-2xl overflow-hidden group cursor-pointer ${
                i === 0 || i === 5 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <img
                src={img.url}
                alt={img.caption || "Meal photo"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-sm font-medium">{img.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
