export const CATEGORIES = [
  { slug: "landing-page", name: "Landing page", ar: "صفحة هبوط" },
  { slug: "dashboard", name: "Dashboard", ar: "لوحة تحكم" },
  { slug: "ecommerce", name: "E-commerce", ar: "تجارة إلكترونية" },
  { slug: "portfolio", name: "Portfolio", ar: "معرض أعمال" },
  { slug: "agency", name: "Agency", ar: "وكالة" },
  { slug: "marketplace", name: "Marketplace", ar: "سوق إلكتروني" },
  { slug: "blog", name: "Blog", ar: "مدونة" },
  { slug: "docs", name: "Docs", ar: "توثيق" },
  { slug: "pricing", name: "Pricing", ar: "الأسعار" },
  { slug: "checkout", name: "Checkout", ar: "إتمام الشراء" },
  { slug: "auth", name: "Login", ar: "تسجيل الدخول" },
  { slug: "onboarding", name: "Onboarding", ar: "الترحيب والإعداد" },
  { slug: "feed", name: "Feed", ar: "موجز" },
] as const;

export const INDUSTRIES = [
  { slug: "fintech", name: "Fintech", ar: "التقنية المالية" },
  { slug: "saas", name: "SaaS", ar: "البرمجيات كخدمة" },
  { slug: "ai", name: "AI", ar: "الذكاء الاصطناعي" },
  { slug: "healthcare", name: "Healthcare", ar: "الرعاية الصحية" },
  { slug: "ecommerce", name: "E-commerce", ar: "التجارة الإلكترونية" },
  { slug: "education", name: "Education", ar: "التعليم" },
  { slug: "real-estate", name: "Real estate", ar: "العقارات" },
  { slug: "travel", name: "Travel", ar: "السفر" },
  { slug: "fashion", name: "Fashion", ar: "الأزياء" },
  { slug: "food", name: "Food", ar: "الطعام" },
  { slug: "productivity", name: "Productivity", ar: "الإنتاجية" },
  { slug: "crypto", name: "Crypto", ar: "العملات الرقمية" },
] as const;

export const STYLES = [
  { slug: "minimal", name: "Minimal", ar: "بسيط" },
  { slug: "dark", name: "Dark", ar: "داكن" },
  { slug: "light", name: "Light", ar: "فاتح" },
  { slug: "editorial", name: "Editorial", ar: "تحريري" },
  { slug: "brutalist", name: "Brutalist", ar: "بروتالي" },
  { slug: "luxury", name: "Luxury", ar: "فاخر" },
  { slug: "corporate", name: "Corporate", ar: "مؤسسي" },
  { slug: "playful", name: "Playful", ar: "مرح" },
  { slug: "futuristic", name: "Futuristic", ar: "مستقبلي" },
  { slug: "glassmorphism", name: "Glassmorphism", ar: "زجاجي" },
  { slug: "retro", name: "Retro", ar: "كلاسيكي" },
] as const;

export const TECHNOLOGIES = [
  { slug: "react", name: "React" },
  { slug: "nextjs", name: "Next.js" },
  { slug: "tailwind", name: "Tailwind" },
  { slug: "vue", name: "Vue" },
  { slug: "svelte", name: "Svelte" },
  { slug: "webflow", name: "Webflow" },
  { slug: "framer", name: "Framer" },
  { slug: "shopify", name: "Shopify" },
  { slug: "swiftui", name: "SwiftUI" },
  { slug: "flutter", name: "Flutter" },
] as const;

export const COMPONENT_TYPES = [
  { slug: "navbar", name: "Navbar", ar: "شريط التنقل", group: "Navigation" },
  { slug: "sidebar", name: "Sidebar", ar: "الشريط الجانبي", group: "Navigation" },
  { slug: "tabs", name: "Tabs", ar: "علامات التبويب", group: "Navigation" },
  { slug: "breadcrumb", name: "Breadcrumb", ar: "مسار التنقل", group: "Navigation" },
  { slug: "cards", name: "Cards", ar: "البطاقات", group: "Content" },
  { slug: "table", name: "Table", ar: "الجداول", group: "Content" },
  { slug: "stats", name: "Stats", ar: "الإحصاءات", group: "Content" },
  { slug: "charts", name: "Charts", ar: "الرسوم البيانية", group: "Content" },
  { slug: "list", name: "List", ar: "القوائم", group: "Content" },
  { slug: "hero", name: "Hero", ar: "القسم الافتتاحي", group: "Marketing" },
  { slug: "pricing", name: "Pricing", ar: "الأسعار", group: "Marketing" },
  { slug: "testimonials", name: "Testimonials", ar: "آراء العملاء", group: "Marketing" },
  { slug: "logo-cloud", name: "Logo cloud", ar: "شعارات العملاء", group: "Marketing" },
  { slug: "cta", name: "CTA", ar: "دعوة لاتخاذ إجراء", group: "Marketing" },
  { slug: "faq", name: "FAQ", ar: "الأسئلة الشائعة", group: "Marketing" },
  { slug: "footer", name: "Footer", ar: "التذييل", group: "Marketing" },
  { slug: "login", name: "Login", ar: "تسجيل الدخول", group: "Forms" },
  { slug: "signup", name: "Signup", ar: "إنشاء حساب", group: "Forms" },
  { slug: "checkout", name: "Checkout", ar: "إتمام الشراء", group: "Forms" },
  { slug: "search", name: "Search", ar: "البحث", group: "Forms" },
  { slug: "filters", name: "Filters", ar: "عوامل التصفية", group: "Forms" },
  { slug: "inputs", name: "Inputs", ar: "حقول الإدخال", group: "Forms" },
  { slug: "modal", name: "Modal", ar: "النوافذ المنبثقة", group: "Interaction" },
  { slug: "dropdown", name: "Dropdown", ar: "القوائم المنسدلة", group: "Interaction" },
  { slug: "notification", name: "Notification", ar: "الإشعارات", group: "Interaction" },
  { slug: "accordion", name: "Accordion", ar: "الأقسام القابلة للطي", group: "Interaction" },
  { slug: "empty-state", name: "Empty state", ar: "الحالة الفارغة", group: "Interaction" },
] as const;

export const PLATFORMS = [
  { slug: "web", name: "Web", ar: "الويب" },
  { slug: "ios", name: "iOS" },
  { slug: "android", name: "Android" },
  { slug: "ipad", name: "iPad" },
] as const;

export const APP_CATEGORIES = [
  "Finance",
  "Productivity",
  "Social",
  "Health",
  "Shopping",
  "Travel",
  "Education",
  "Media",
] as const;

export const SORTS = [
  { slug: "trending", name: "Trending", ar: "الأكثر رواجًا" },
  { slug: "new", name: "Newest", ar: "الأحدث" },
  { slug: "saved", name: "Most saved", ar: "الأكثر حفظًا" },
  { slug: "views", name: "Most viewed", ar: "الأكثر مشاهدة" },
] as const;

export type Term = { slug: string; name: string; ar?: string };

/** A term's display name in `lang` — technology and platform names that have no Arabic form keep their own */
export const name = (list: readonly Term[], slug?: string, lang: "en" | "ar" = "en") => {
  const t = list.find((t) => t.slug === slug);
  return (lang === "ar" ? t?.ar : undefined) ?? t?.name ?? slug ?? "";
};

/** The same list with names in `lang`, for passing to a client component */
export const localTerms = (list: readonly Term[], lang: "en" | "ar") => list.map((t) => ({ slug: t.slug, name: name(list, t.slug, lang) }));
