import { useContentMap } from "@/hooks/useContentMap";
import { ICONS } from "@/config/siteConfig";
import { MapPin } from "lucide-react";

export function Footer() {
  const { getContent, getConfig } = useContentMap();

  const phone = getConfig("phone", "+7 (917) 123-45-67");
  const telegram = getConfig("telegram", "https://t.me/inbalancenutrition");
  const whatsapp = getConfig("whatsapp", "https://wa.me/79171234567");
  const instagram = getConfig("instagram", "https://www.instagram.com/inbalancenutrion");
  const address = getContent("footer_address", "г. Казань");

  const socials = [
    { url: telegram, icon: "Send", label: "Telegram" },
    { url: whatsapp, icon: "Phone", label: "WhatsApp" },
    { url: instagram, icon: "Instagram", label: "Instagram" },
  ];

  return (
    <footer id="contacts" className="bg-[#1E1E1E] text-white py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="text-xl font-semibold mb-2">
              in balance <span className="text-[#6B7B5E]">nutrition</span>
            </div>
            <p className="text-white/60 text-sm">Результат через питание</p>
            <div className="flex items-center gap-2 mt-4 text-white/60 text-sm">
              <MapPin className="w-4 h-4" />
              {address}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <div className="flex flex-col gap-2 text-white/60 text-sm">
              <a href="#rations" className="hover:text-white transition-colors">Рационы</a>
              <a href="#trust" className="hover:text-white transition-colors">Преимущества</a>
              <a href="#gallery" className="hover:text-white transition-colors">Галерея</a>
              <a href="#howto" className="hover:text-white transition-colors">Как заказать</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <div className="flex flex-col gap-3 text-sm">
              <a href={`tel:${phone}`} className="text-white/60 hover:text-white transition-colors">
                {phone}
              </a>
              <div className="flex items-center gap-3 mt-2">
                {socials.map((s) => {
                  const Icon = ICONS[s.icon] || ICONS.Phone;
                  return (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#6B7B5E] transition-colors"
                      aria-label={s.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-white/40 text-sm">
          © 2025 in balance nutrition. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
