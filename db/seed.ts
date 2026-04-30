import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { rations, siteContent, siteConfig, galleryImages, users } from "./schema";
import { hashPassword } from "../api/lib/password";

async function seed() {
  const db = getDb();

  // Seed rations
  const existingRations = await db.select().from(rations);
  if (existingRations.length === 0) {
    await db.insert(rations).values([
      {
        name: "SLIM",
        slug: "slim",
        calories: 1200,
        protein: "90",
        fat: "40",
        carbs: "110",
        priceDay: 1190,
        priceWeek: 7900,
        description: "Низкокалорийный рацион для похудения и детокса. Легкие блюда, богатые белком, с минимальным содержанием жиров и углеводов.",
        targetAudience: "Женщины и мужчины, которые хотят сбросить вес, убрать отеки и подтянуть фигуру.",
        imageUrl: "/images/ration_slim.jpg",
        sortOrder: 1,
        isActive: true,
      },
      {
        name: "FIT",
        slug: "fit",
        calories: 1800,
        protein: "120",
        fat: "60",
        carbs: "160",
        priceDay: 1290,
        priceWeek: 8400,
        description: "Сбалансированный рацион для поддержания формы и здорового образа жизни. Оптимальное соотношение КБЖУ для активных людей.",
        targetAudience: "Те, кто ведет активный образ жизни, занимается спортом и хочет поддерживать отличную форму.",
        imageUrl: "/images/ration_fit.jpg",
        sortOrder: 2,
        isActive: true,
      },
      {
        name: "SPORT",
        slug: "sport",
        calories: 2500,
        protein: "180",
        fat: "80",
        carbs: "230",
        priceDay: 1390,
        priceWeek: 9100,
        description: "Высокобелковый рацион для спортсменов и тех, кто тренируется интенсивно. Максимум энергии и строительного материала для мышц.",
        targetAudience: "Спортсмены, бодибилдеры и активные люди, которым нужно много энергии для тренировок.",
        imageUrl: "/images/ration_sport.jpg",
        sortOrder: 3,
        isActive: true,
      },
      {
        name: "MASS",
        slug: "mass",
        calories: 3200,
        protein: "200",
        fat: "100",
        carbs: "320",
        priceDay: 1550,
        priceWeek: 10150,
        description: "Максимально калорийный рацион для набора мышечной массы. Обильные порции, богатые белком и сложными углеводами.",
        targetAudience: "Мужчины, которые хотят набрать мышечную массу и силу. Для хардгейнеров и бодибилдеров в период набора.",
        imageUrl: "/images/ration_mass.jpg",
        sortOrder: 4,
        isActive: true,
      },
    ]);
    console.log("Seeded rations");
  }

  // Seed site content
  const existingContent = await db.select().from(siteContent);
  if (existingContent.length === 0) {
    await db.insert(siteContent).values([
      { key: "hero_title", section: "hero", content: "Рационы питания, которые меняют тело" },
      { key: "hero_subtitle", section: "hero", content: "Готовая вкусная еда с точным КБЖУ и доставкой каждый день в Казани" },
      { key: "hero_trust", section: "hero", content: "Создано фитнес тренером и нутрициологом" },
      { key: "pain_title", section: "pain", content: "Почему до сих пор нет результата?" },
      { key: "pain_1_title", section: "pain", content: "Нет времени готовить?" },
      { key: "pain_1_text", section: "pain", content: "Работа, тренировки, семья — у вас и так полный день. Готовка отнимает 2-3 часа, которые можно потратить на себя." },
      { key: "pain_2_title", section: "pain", content: "Переедаешь или не доедаешь?" },
      { key: "pain_2_text", section: "pain", content: "Без системы КБЖУ легко сорваться на вредное или недоедать, тормозя метаболизм." },
      { key: "pain_3_title", section: "pain", content: "Хочешь результат, но нет плана?" },
      { key: "pain_3_text", section: "pain", content: "Диеты не работают без точного расчета калорий и макронутриентов. Нужна система, а не воля." },
      { key: "pain_solution", section: "pain", content: "Мы уже всё приготовили за тебя. Точное КБЖУ. Вкусные блюда. Доставка каждый день." },
      { key: "trust_1_title", section: "trust", content: "Составлено специалистом" },
      { key: "trust_1_text", section: "trust", content: "Фитнес тренер и нутрициолог с 10+ лет опыта трансформации людей." },
      { key: "trust_2_title", section: "trust", content: "Вкусные блюда без скучной диеты" },
      { key: "trust_2_text", section: "trust", content: "Разнообразное меню без повторов за неделю. Никакой пресной курочки с капустой." },
      { key: "trust_3_title", section: "trust", content: "Точное КБЖУ" },
      { key: "trust_3_text", section: "trust", content: "Каждое блюдо взвешено и рассчитано. Знаешь точно, сколько белков, жиров и углеводов съел." },
      { key: "trust_4_title", section: "trust", content: "Ежедневная доставка" },
      { key: "trust_4_text", section: "trust", content: "Утром, к назначенному времени, в удобный для тебя интервал. Свежие блюда каждый день." },
      { key: "trust_5_title", section: "trust", content: "Экономия 10+ часов в неделю" },
      { key: "trust_5_text", section: "trust", content: "Не нужно ни готовить, ни считать калории, ни мыть гору посуды." },
      { key: "trust_6_title", section: "trust", content: "Результат по фигуре" },
      { key: "trust_6_text", section: "trust", content: "Клиенты видят изменения за 2-3 недели. Это не диета — это система питания." },
      { key: "trust_7_title", section: "trust", content: "Качественные продукты" },
      { key: "trust_7_text", section: "trust", content: "Свежие ингредиенты от проверенных поставщиков. Никаких полуфабрикатов и заменителей." },
      { key: "trust_8_title", section: "trust", content: "Обновление меню каждую неделю" },
      { key: "trust_8_text", section: "trust", content: "Разнообразие без приевшихся блюд. Пробуй новое каждую неделю." },
      { key: "founder_name", section: "founder", content: "Олег Зубарев" },
      { key: "founder_role", section: "founder", content: "Основатель in balance nutrition. Фитнес тренер и нутрициолог." },
      { key: "founder_quote", section: "founder", content: "Я создал этот сервис, потому что большинство людей не могут добиться результата не из-за лени, а из-за отсутствия удобной системы питания." },
      { key: "founder_text", section: "founder", content: "Более 10 лет я помогаю людям трансформировать тела. Знаю, что главная проблема — это не мотивация, а отсутствие готового решения, которое работает." },
      { key: "cta_title", section: "cta", content: "Начни менять тело уже с этой недели" },
      { key: "cta_subtitle", section: "cta", content: "Первый рацион со скидкой 20%. Бесплатная консультация по подбору КБЖУ." },
      { key: "cta_trust", section: "cta", content: "Доставка по Казани. Оплата при получении." },
      { key: "footer_phone", section: "footer", content: "+7 (917) 123-45-67" },
      { key: "footer_telegram", section: "footer", content: "@inbalancenutrition" },
      { key: "footer_whatsapp", section: "footer", content: "+7 (917) 123-45-67" },
      { key: "footer_instagram", section: "footer", content: "@inbalancenutrion" },
      { key: "footer_address", section: "footer", content: "г. Казань" },
      { key: "faq_1_q", section: "faq", content: "Можно ли менять блюда в рационе?" },
      { key: "faq_1_a", section: "faq", content: "Да, при составлении меню мы учитываем ваши предпочтения и аллергии. Некоторые замены возможны без изменения КБЖУ." },
      { key: "faq_2_q", section: "faq", content: "В какое время происходит доставка?" },
      { key: "faq_2_a", section: "faq", content: "Доставка осуществляется утром, в интервале 6:00-10:00. Можно выбрать удобное время при оформлении заказа." },
      { key: "faq_3_q", section: "faq", content: "Можно ли похудеть на ваших рационах?" },
      { key: "faq_3_a", section: "faq", content: "Да, рацион SLIM (1200 ккал) специально разработан для безопасного похудения. Наши клиенты теряют 3-5 кг за первый месяц." },
      { key: "faq_4_q", section: "faq", content: "Подходит ли для набора мышечной массы?" },
      { key: "faq_4_a", section: "faq", content: "Абсолютно. Рацион MASS (3200 ккал) с высоким содержанием белка и сложных углеводов — идеален для набора массы." },
      { key: "faq_5_q", section: "faq", content: "На сколько дней можно заказать?" },
      { key: "faq_5_a", section: "faq", content: "Минимальный заказ — 1 день. Рекомендуем заказывать на неделю (5-7 дней) для стабильного результата." },
      { key: "faq_6_q", section: "faq", content: "Какие продукты вы используете?" },
      { key: "faq_6_a", section: "faq", content: "Мы используем только свежие продукты от проверенных поставщиков: куриное филе, говядина, рыба, овощи, крупы, яйца, молочные продукты. Никаких полуфабрикатов." },
      { key: "results_title", section: "results", content: "Результаты наших клиентов" },
      { key: "howto_title", section: "howto", content: "Как начать питаться правильно" },
      { key: "howto_1_title", section: "howto", content: "Оставьте заявку" },
      { key: "howto_1_text", section: "howto", content: "Заполните форму на сайте или напишите нам в мессенджер." },
      { key: "howto_2_title", section: "howto", content: "Мы связываемся" },
      { key: "howto_2_text", section: "howto", content: "Перезваниваем или пишем в течение 15 минут для уточнения деталей." },
      { key: "howto_3_title", section: "howto", content: "Подбираем калории" },
      { key: "howto_3_text", section: "howto", content: "Подбираем оптимальный рацион под вашу цель, вес и активность." },
      { key: "howto_4_title", section: "howto", content: "Привозим питание" },
      { key: "howto_4_text", section: "howto", content: "Каждое утро доставляем свежие блюда. Начинаете путь к новому телу." },
      { key: "gallery_title", section: "gallery", content: "Как выглядит твое питание" },
      { key: "gallery_subtitle", section: "gallery", content: "Реальные фото наших рационов. Никакого стока." },
    ]);
    console.log("Seeded site content");
  }

  // Seed site config
  const existingConfig = await db.select().from(siteConfig);
  if (existingConfig.length === 0) {
    await db.insert(siteConfig).values([
      { key: "brand_name", value: "in balance nutrition" },
      { key: "city", value: "Казань" },
      { key: "phone", value: "+7 (917) 123-45-67" },
      { key: "telegram", value: "https://t.me/inbalancenutrition" },
      { key: "whatsapp", value: "https://wa.me/79171234567" },
      { key: "instagram", value: "https://www.instagram.com/inbalancenutrion" },
      { key: "founder_instagram", value: "https://www.instagram.com/zubarevoleg_kzn" },
    ]);
    console.log("Seeded site config");
  }

  // Seed gallery
  const existingGallery = await db.select().from(galleryImages);
  if (existingGallery.length === 0) {
    await db.insert(galleryImages).values([
      { url: "/images/gallery_1.jpg", caption: "Протеиновые панкейки", sortOrder: 1, isActive: true },
      { url: "/images/gallery_2.jpg", caption: "Цезарь с курицей", sortOrder: 2, isActive: true },
      { url: "/images/gallery_3.jpg", caption: "Грибной суп-пюре", sortOrder: 3, isActive: true },
      { url: "/images/gallery_4.jpg", caption: "Боул с нутом и авокадо", sortOrder: 4, isActive: true },
      { url: "/images/gallery_5.jpg", caption: "Рыба на гриле", sortOrder: 5, isActive: true },
      { url: "/images/hero_food_1.jpg", caption: "Курица с киноа", sortOrder: 6, isActive: true },
      { url: "/images/hero_food_2.jpg", caption: "Завтрак с ягодами", sortOrder: 7, isActive: true },
      { url: "/images/ration_fit.jpg", caption: "Лосось с бататом", sortOrder: 8, isActive: true },
    ]);
    console.log("Seeded gallery");
  }

  // Seed default admin
  const existingAdmin = await db.select().from(users).where(eq(users.unionId, "admin"));
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      unionId: "admin",
      name: "Admin",
      passwordHash: await hashPassword("admin"),
      role: "admin",
      lastSignInAt: new Date(),
    });
    console.log("Seeded default admin (admin / admin)");
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
