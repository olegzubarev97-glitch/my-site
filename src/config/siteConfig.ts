import {
  Clock,
  Scale,
  Target,
  Shield,
  Heart,
  Calculator,
  Truck,
  TrendingUp,
  Leaf,
  ChefHat,
  Phone,
  MessageCircle,
  Instagram,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Star,
  User,
  Check,
  MapPin,
  Send,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Clock,
  Scale,
  Target,
  Shield,
  Heart,
  Calculator,
  Truck,
  TrendingUp,
  Leaf,
  ChefHat,
  Phone,
  MessageCircle,
  Instagram,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Star,
  User,
  Check,
  MapPin,
  Send,
};

export const TRUST_FACTORS = [
  { icon: "Shield", titleKey: "trust_1_title", textKey: "trust_1_text" },
  { icon: "Heart", titleKey: "trust_2_title", textKey: "trust_2_text" },
  { icon: "Calculator", titleKey: "trust_3_title", textKey: "trust_3_text" },
  { icon: "Truck", titleKey: "trust_4_title", textKey: "trust_4_text" },
  { icon: "Clock", titleKey: "trust_5_title", textKey: "trust_5_text" },
  { icon: "TrendingUp", titleKey: "trust_6_title", textKey: "trust_6_text" },
  { icon: "Leaf", titleKey: "trust_7_title", textKey: "trust_7_text" },
  { icon: "ChefHat", titleKey: "trust_8_title", textKey: "trust_8_text" },
];

export const PAIN_POINTS = [
  { icon: "Clock", titleKey: "pain_1_title", textKey: "pain_1_text" },
  { icon: "Scale", titleKey: "pain_2_title", textKey: "pain_2_text" },
  { icon: "Target", titleKey: "pain_3_title", textKey: "pain_3_text" },
];

export const HOW_TO_STEPS = [
  { titleKey: "howto_1_title", textKey: "howto_1_text" },
  { titleKey: "howto_2_title", textKey: "howto_2_text" },
  { titleKey: "howto_3_title", textKey: "howto_3_text" },
  { titleKey: "howto_4_title", textKey: "howto_4_text" },
];

export const FAQ_ITEMS = [
  { qKey: "faq_1_q", aKey: "faq_1_a" },
  { qKey: "faq_2_q", aKey: "faq_2_a" },
  { qKey: "faq_3_q", aKey: "faq_3_a" },
  { qKey: "faq_4_q", aKey: "faq_4_a" },
  { qKey: "faq_5_q", aKey: "faq_5_a" },
  { qKey: "faq_6_q", aKey: "faq_6_a" },
];

export const TESTIMONIALS = [
  {
    name: "Анна М.",
    text: "За 3 недели на рационе SLIM сбросила 4 кг. Еда вкусная, не похожа на диету. Доставка всегда вовремя.",
    rating: 5,
    date: "15.04.2025",
  },
  {
    name: "Дмитрий К.",
    text: "Брал MASS для набора. За месяц +3 кг чистой массы. Порции большие, сытно. Рекомендую всем, кто не успевает готовить.",
    rating: 5,
    date: "02.04.2025",
  },
  {
    name: "Елена С.",
    text: "FIT — идеально для моего режима. Тренировки + правильное питание = результат. Кожа стала лучше, пропали отеки.",
    rating: 5,
    date: "20.03.2025",
  },
  {
    name: "Игорь П.",
    text: "Работаю в офисе, некогда готовить. Заказываю на неделю. Экономит кучу времени. Меню разнообразное.",
    rating: 5,
    date: "10.03.2025",
  },
  {
    name: "Мария В.",
    text: "Начала с пробного дня, теперь заказываю постоянно. Олег подобрал калории лично. Спасибо за профессионализм!",
    rating: 5,
    date: "28.02.2025",
  },
];

export const BEFORE_AFTER = [
  { label: "-8 кг за 6 недель", name: "Анна, 29 лет" },
  { label: "+5 кг мышц за 2 месяца", name: "Дмитрий, 32 года" },
  { label: "-12 кг за 3 месяца", name: "Елена, 35 лет" },
];

export const SOCIAL_LINKS = [
  { key: "telegram", icon: "Send", label: "Telegram" },
  { key: "whatsapp", icon: "Phone", label: "WhatsApp" },
  { key: "instagram", icon: "Instagram", label: "Instagram" },
];
