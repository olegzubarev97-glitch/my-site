import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, Send } from "lucide-react";

interface NavigationProps {
  onOrderClick: () => void;
}

const NAV_LINKS = [
  { label: "Рационы", href: "#rations" },
  { label: "Преимущества", href: "#trust" },
  { label: "Галерея", href: "#gallery" },
  { label: "Как заказать", href: "#howto" },
  { label: "FAQ", href: "#faq" },
  { label: "Контакты", href: "#contacts" },
];

export function Navigation({ onOrderClick }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FAF9F7]/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-[#1E1E1E] font-semibold text-lg tracking-tight"
          >
            in balance <span className="text-[#6B7B5E]">nutrition</span>
          </a>

          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-sm text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              onClick={onOrderClick}
              className="bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white text-sm h-9"
            >
              Заказать рацион
            </Button>
            <a
              href="https://t.me/inbalancenutrition"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#F5F1EB] flex items-center justify-center text-[#6B7B5E] hover:bg-[#6B7B5E] hover:text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </a>
            <a
              href="tel:+79171234567"
              className="w-9 h-9 rounded-full bg-[#F5F1EB] flex items-center justify-center text-[#6B7B5E] hover:bg-[#6B7B5E] hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="p-2 text-[#1E1E1E]">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#FAF9F7]">
              <div className="flex flex-col gap-6 mt-8">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    className="text-left text-lg text-[#1E1E1E] hover:text-[#6B7B5E] transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    onOrderClick();
                  }}
                  className="bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white mt-4"
                >
                  Заказать рацион
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
