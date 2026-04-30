import { Phone, MessageCircle } from "lucide-react";

interface MobileStickyBarProps {
  onOrderClick: () => void;
}

export function MobileStickyBar({ onOrderClick }: MobileStickyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E5E0] p-3 flex items-center gap-3 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <button
        onClick={onOrderClick}
        className="flex-1 bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white font-medium py-3 rounded-xl transition-colors"
      >
        Оставить заявку
      </button>
      <a
        href="tel:+79171234567"
        className="w-12 h-12 rounded-xl bg-[#F5F1EB] flex items-center justify-center text-[#6B7B5E]"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/79171234567"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
}
