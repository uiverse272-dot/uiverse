import type { Item } from "@/lib/data";
import { COMPONENT_TYPES, name } from "@/lib/taxonomy";
import type { Lang } from "./config";
import { plural, type Plural } from "./format";

/**
 * Arabic for the catalogue's own words — screen titles, block labels, the design facts lib/spec
 * derives — kept apart from lib/spec so the prompt generator stays English (coding tools follow
 * English best) while the Breakdown and Responsive tabs read in the page's language.
 *
 * Every lookup falls back to the English, so a new title or rule shows up untranslated rather
 * than missing. Reflow rules keep the " → " steps of the English: <Flow> isolates each step so
 * "48px → 36px" reads in order inside Arabic text.
 */

const TITLES: Record<string, string> = {
  /* real captures' other page types */
  About: "من نحن", Features: "الميزات", Pro: "النسخة الاحترافية", Business: "للأعمال", Solutions: "الحلول", Partnership: "الشراكات", "Online store": "المتجر الإلكتروني",
  "Accept payments": "قبول المدفوعات", "Payment methods": "طرق الدفع", "Careem for Business": "كريم للأعمال",
  Homepage: "الصفحة الرئيسية", "Spend overview": "نظرة على الإنفاق", Pricing: "الأسعار", "Sign in": "تسجيل الدخول",
  Documentation: "التوثيق", Plans: "الخطط", "Care schedule": "جدول الرعاية", "Model evaluations": "تقييمات النماذج",
  "API reference": "مرجع API", "Shop all": "تسوّق الكل", Lookbook: "كتالوج الإطلالات", Checkout: "إتمام الشراء",
  Workspace: "مساحة العمل", Inbox: "صندوق الوارد", Journal: "المجلة", Expeditions: "الرحلات الاستكشافية",
  "Weekly menu": "قائمة الأسبوع", Welcome: "الترحيب", Basket: "السلة", "Class insights": "إحصاءات الفصل",
  "Trading desk": "منصة التداول", Portfolio: "المحفظة", Funnels: "مسارات التحويل", "Listings journal": "مجلة العقارات",
  "Featured homes": "منازل مميزة", "Reading view": "وضع القراءة", Accounts: "الحسابات", "Get started": "ابدأ الآن",
  Profile: "الملف الشخصي", Matching: "المطابقة", "Build log": "سجل البناء", "CLI reference": "مرجع سطر الأوامر",
  Storefront: "واجهة المتجر", Today: "اليوم", Membership: "العضوية", "Training week": "أسبوع التدريب",
  Athlete: "الرياضي", Routes: "المسارات", Gear: "المعدات", "Token library": "مكتبة الرموز", Guidelines: "الإرشادات",
  "Contract queue": "قائمة العقود", "Log in": "تسجيل الدخول", "Seed shop": "متجر البذور", "Grow guides": "أدلة الزراعة",
  "Front page": "الصفحة الأولى", Subscribe: "اشترك", Usage: "الاستخدام", "The hotels": "الفنادق", Rooms: "الغرف",
  Reserve: "احجز",
};

const BLOCKS: Record<string, string> = {
  Navbar: "شريط التنقل", Hero: "القسم الافتتاحي", "Logo cloud": "شعارات العملاء", "Feature grid": "شبكة الميزات",
  "Metrics band": "شريط المؤشرات", Testimonial: "رأي عميل", Testimonials: "آراء العملاء", CTA: "دعوة لاتخاذ إجراء",
  Footer: "التذييل", Sidebar: "الشريط الجانبي", "Top bar": "الشريط العلوي", "Stat cards": "بطاقات الإحصاءات",
  "Chart panel": "لوحة الرسم البياني", "Activity list": "قائمة النشاط", "Data table": "جدول البيانات",
  "Section header": "رأس القسم", "Billing toggle": "مبدّل الفوترة", "Pricing tiers": "باقات الأسعار", FAQ: "الأسئلة الشائعة",
  "Navbar + search": "شريط التنقل + البحث", "Campaign hero": "قسم الحملة الافتتاحي", "Category row": "صف الفئات",
  "Product grid": "شبكة المنتجات", "Editorial band": "شريط تحريري", "Minimal nav": "تنقل بسيط",
  "Type statement": "عبارة طباعية", "Work grid": "شبكة الأعمال", "Index list": "قائمة الفهرس",
  "Contact footer": "تذييل التواصل", "Slim header": "رأس نحيف", "Contact fields": "حقول التواصل",
  "Payment form": "نموذج الدفع", "Order summary": "ملخص الطلب", "Pay button": "زر الدفع", "Sign-in card": "بطاقة الدخول",
  "Field group": "مجموعة حقول", "Provider buttons": "أزرار مزوّدي الدخول", Masthead: "ترويسة المجلة",
  "Lead story": "القصة الرئيسية", "Article index": "فهرس المقالات", "Related grid": "شبكة ذات صلة",
  "Docs tree": "شجرة التوثيق", Breadcrumb: "مسار التنقل", "Prose + code": "نص + كود", "On this page": "في هذه الصفحة",
  "Overlay nav": "تنقل فوق المحتوى", "Full-bleed hero": "قسم افتتاحي بعرض كامل", "Services list": "قائمة الخدمات",
  "Case studies": "دراسات الحالة", "Contact band": "شريط التواصل", Header: "الرأس", "Balance card": "بطاقة الرصيد",
  "Quick actions": "إجراءات سريعة", Transactions: "المعاملات", "Tab bar": "شريط التبويبات", "Story rail": "شريط القصص",
  "Feed cards": "بطاقات الموجز", Illustration: "رسم توضيحي", Headline: "العنوان الرئيسي",
  "Progress dots": "نقاط التقدّم", "Primary action": "الإجراء الرئيسي", "Profile stats": "إحصاءات الملف",
  "Segmented control": "مبدّل مقسّم", Grid: "الشبكة", "Content section": "قسم محتوى", "Card grid": "شبكة البطاقات",
  "CTA band": "شريط الدعوة لإجراء", "Feature section": "قسم الميزات", Form: "نموذج", "Sign-in form": "نموذج الدخول",
  "Sign-up form": "نموذج التسجيل",
  /* rule labels that aren't block labels */
  Navigation: "التنقل", Gutters: "الهوامش", "Hero headline": "عنوان القسم الافتتاحي", "Product shot": "صورة المنتج",
  "Chart + activity": "الرسم البياني + النشاط", Tiers: "الباقات", Layout: "التخطيط", Buttons: "الأزرار",
  Services: "الخدمات", "Balance + actions": "الرصيد + الإجراءات", "Status bar": "شريط الحالة", Feed: "الموجز",
  Stories: "القصص", "Profile header": "رأس الملف الشخصي", "Page length": "طول الصفحة",
};

/* the invented sample brands' one-line descriptions; captured brands keep their own words */
const ABOUT: Record<string, string> = {
  ledgerly: "خدمات مصرفية للشركات وإدارة للإنفاق لمن يديرون العمليات.",
  northwind: "أدوات بنية تحتية لفرق المنتجات.",
  "halo-health": "تنسيق رعاية المرضى للعيادات التخصصية.",
  substrate: "استضافة النماذج وتقييمها بشكل خاص.",
  cormorant: "مشغل صغير الإنتاج في لشبونة.",
  quarry: "المستندات والمهام والقرارات في مكان واحد.",
  meridian: "رحلات طويلة بإرشاد.",
  basil: "صناديق وجبات أسبوعية من مزارع محلية.",
  "atlas-ed": "مناهج تتكيّف مع الطالب للمدارس الثانوية.",
  tidal: "بنية تحتية للتداول دون حفظ الأصول.",
  plotline: "تحليلات المنتجات للفرق الصغيرة.",
  "rook-estate": "بيع وتأجير العقارات التاريخية.",
  vellum: "منصة نشر لكتّاب النصوص الطويلة.",
  current: "إدارة مالية شخصية لمن يكرهون الميزانيات.",
  orchid: "مطابقة وجدولة لجلسات العلاج بالحوار.",
  kiln: "التكامل والنشر المستمر للمستودعات الموحّدة.",
  saffron: "تاجر توابل بتجارة مباشرة.",
  lantern: "دورات قصيرة للموظفين.",
  pike: "تدريب القوة دون جداول بيانات.",
  gravel: "مسارات وعتاد لرحلات الدراجات الطويلة.",
  umbra: "إدارة رموز التصميم لفرق التصميم.",
  clearing: "إدارة دورة حياة العقود للفرق القانونية الداخلية.",
  bramble: "بذور وأدوات ونصائح.",
  "signal-post": "صحافة تقنية مستقلة.",
  nimbus: "بنية تحتية دون خوادم بأسعار واضحة.",
  terrace: "مجموعة من ستة فنادق صغيرة.",
  /* Uiverse's own pieces (lib/craft.ts) */
  "uiverse-originals": "قطع تفاعلية صنعتها Uiverse: كل منها ملف HTML واحد بلا اعتماديات، مجانية للاستخدام والتعديل بترخيص MIT.",
};

/** A source's one-line description in `lang` — the captured sites' own words stay as they are */
export function sourceAbout(source: { slug: string; name: string; domain: string; about: string }, lang: Lang) {
  if (lang !== "ar") return source.about;
  if (ABOUT[source.slug]) return ABOUT[source.slug];
  /* the line lib/captures writes for a site without a description of its own */
  if (source.about === `${source.name}, captured from ${source.domain}.`) return `${source.name}، مُلتقط من ${source.domain}.`;
  return source.about;
}

const ARCHETYPES: Record<string, string> = {
  "saas-landing": "صفحة هبوط SaaS", dashboard: "لوحة تحكم", pricing: "صفحة أسعار", ecommerce: "متجر إلكتروني",
  portfolio: "معرض أعمال", checkout: "إتمام الشراء", auth: "تسجيل الدخول", editorial: "تحريري", docs: "توثيق",
  agency: "وكالة", "mobile-finance": "مالية الجوال", "mobile-feed": "موجز الجوال",
  "mobile-onboarding": "ترحيب الجوال", "mobile-profile": "ملف الجوال",
};

const TYPE_NAMES: Record<string, string> = { Display: "عرض", Body: "النص", Small: "صغير", Caption: "تعليق" };
const TYPE_USES: Record<string, string> = {
  "Hero headline": "عنوان القسم الافتتاحي", "Section header": "رأس القسم", "Sub-section": "قسم فرعي",
  "Card title": "عنوان البطاقة", Paragraph: "فقرة", "Meta, labels": "بيانات وصفية، تسميات",
  "Eyebrow, badges": "عنوان تمهيدي، شارات", "Screen headline": "عنوان الشاشة", "Tab labels": "تسميات التبويبات",
  Heading: "عنوان", "Page headline": "عنوان الصفحة", "Links, buttons": "روابط، أزرار", Buttons: "أزرار",
  "Form labels": "تسميات النماذج", "List items": "عناصر القوائم", Label: "تسمية",
};

const RULES: Record<string, string> = {
  "links, sign-in and CTA → links fold into a menu button, sign-in and CTA stay → logo and menu button only":
    "الروابط وزر الدخول وزر الدعوة → الروابط تنطوي في زر القائمة ويبقى الدخول والدعوة → الشعار وزر القائمة فقط",
  "brand beside 4 link columns → brand above 4 columns → brand above a 2 × 2 grid":
    "العلامة بجوار 4 أعمدة روابط → العلامة فوق 4 أعمدة → العلامة فوق شبكة 2 × 2",
  "56–64px → 32px → 20px": "56–64px → 32px → 20px",
  "labelled left nav → labelled tab bar → icon tab bar": "تنقل جانبي بتسميات → شريط تبويبات بتسميات → شريط تبويبات بالأيقونات",
  "none — a single-step flow at every size": "لا يوجد — تدفق من خطوة واحدة بكل المقاسات",
  "68px → 52px → 36px; CTAs side by side → side by side → stacked, full width":
    "68px → 52px → 36px; أزرار الدعوة متجاورة → متجاورة → متراكبة بعرض كامل",
  "sidebar and 3 stat tiles → narrower sidebar → no sidebar, 2 tiles": "شريط جانبي و3 مربعات إحصاءات → شريط جانبي أضيق → بلا شريط جانبي ومربعان",
  "5 in a row → 5, tighter → 4, wrapping": "5 في صف → 5 أقرب → 4 مع الالتفاف",
  "3 columns → 2 (third card spans) → 1": "3 أعمدة → عمودان (البطاقة الثالثة تمتد) → عمود واحد",
  "4 across → 4 across, 34px figures → 2 × 2": "4 متجاورة → 4 متجاورة بأرقام 34px → 2 × 2",
  "30px quote with wide margins → 26px → 20px, full width": "اقتباس 30px بهوامش واسعة → 26px → 20px بعرض كامل",
  "38px heading → 32px → 24px": "عنوان 38px → 32px → 24px",
  "248px with labels → 72px icon rail → hidden behind a menu button, bottom tab bar added":
    "248px بتسميات → شريط أيقونات 72px → مخفي خلف زر القائمة مع إضافة شريط تبويبات سفلي",
  "title, 232px search, actions → 180px search → menu button, title, actions":
    "العنوان وبحث 232px والإجراءات → بحث 180px → زر القائمة والعنوان والإجراءات",
  "4 across → 4 across, 22px values → 2 × 2": "4 متجاورة → 4 متجاورة بقيم 22px → 2 × 2",
  "side by side → stacked, full width → stacked, 16 bars": "متجاوران → متراكبان بعرض كامل → متراكبان، 16 عمودًا",
  "5 columns → 4 (category dropped) → stacked rows with amount and status on the right":
    "5 أعمدة → 4 (بلا الفئة) → صفوف متراكبة مع المبلغ والحالة على اليمين",
  "48px → 40px → 30px": "48px → 40px → 30px",
  "3 across → 3 across, tighter → stacked; phones list the first 4 features":
    "3 متجاورة → 3 متجاورة أقرب → متراكبة؛ الجوال يعرض أول 4 ميزات",
  "centred 840px → full width, 64px gutters → 20px gutters": "في المنتصف 840px → عرض كامل بهوامش 64px → هوامش 20px",
  "logo, links, search, icons → menu button, logo, search → menu button, logo, 2 icons":
    "الشعار والروابط والبحث والأيقونات → زر القائمة والشعار والبحث → زر القائمة والشعار وأيقونتان",
  "copy left, product right → same, smaller → product image above copy, full-width CTA":
    "النص يسارًا والمنتج يمينًا → كذلك بحجم أصغر → صورة المنتج فوق النص وزر دعوة بعرض كامل",
  "one row → one row → crops at the edge and scrolls": "صف واحد → صف واحد → يُقتطع عند الحافة ويُمرَّر",
  "4 columns → 3 → 2": "4 أعمدة → 3 → 2",
  "3 links → 3 links → a single “Menu”": "3 روابط → 3 روابط → «قائمة» واحدة",
  "96px → 64px → 38px": "96px → 64px → 38px",
  "2 columns → 2 → 1": "عمودان → 2 → 1",
  "full-width rows at every size; titles shorten on phones": "صفوف بعرض كامل بكل المقاسات؛ العناوين تقصر على الجوال",
  "form beside order summary → same, tighter → summary folds into a “Show order summary” bar above the form":
    "النموذج بجوار ملخص الطلب → كذلك أقرب → الملخص ينطوي في شريط «اعرض ملخص الطلب» فوق النموذج",
  "full width of the form at every size": "بعرض النموذج كاملًا بكل المقاسات",
  "form beside the art panel → form alone, centred, 420px → form alone, full width, top aligned":
    "النموذج بجوار لوحة الرسم → النموذج وحده في المنتصف 420px → النموذج وحده بعرض كامل محاذى للأعلى",
  "full width of the card at every size": "بعرض البطاقة كاملًا بكل المقاسات",
  "54px, 5 sections → 44px, 5 → 32px, 4": "54px، 5 أقسام → 44px، 5 → 32px، 4",
  "520px image, 46px headline → 380px, 36px → 220px, 26px": "صورة 520px وعنوان 46px → 380px، 36px → 220px، 26px",
  "3 cards in a row → 2 × 2 → thumbnail-left list rows": "3 بطاقات في صف → 2 × 2 → صفوف قائمة بصورة مصغرة يسارًا",
  "tree, article, on-this-page → tree and article → article only": "الشجرة والمقال و«في هذه الصفحة» → الشجرة والمقال → المقال فقط",
  "268px → 220px → behind a menu button": "268px → 220px → خلف زر القائمة",
  "right-hand rail → hidden → collapsed row under the title": "شريط على اليمين → مخفي → صف مطوي تحت العنوان",
  "4 links over the hero → 4 links → menu button": "4 روابط فوق القسم الافتتاحي → 4 روابط → زر القائمة",
  "880px tall, 108px headline → 720px, 72px → 600px, 46px; CTA row → row → stacked":
    "ارتفاع 880px وعنوان 108px → 720px، 72px → 600px، 46px؛ صف الدعوة → صف → متراكبة",
  "38px names → 30px → 22px": "أسماء 38px → 30px → 22px",
  "balance, actions and revenue chart side by side → balance beside a 2 × 2 action grid → stacked (original)":
    "الرصيد والإجراءات ورسم الإيرادات متجاورة → الرصيد بجوار شبكة إجراءات 2 × 2 → متراكبة (الأصلي)",
  "full table → 7-row list in a card → 5-row list (original)": "جدول كامل → قائمة من 7 صفوف في بطاقة → قائمة من 5 صفوف (الأصلي)",
  "none — it's a browser → shown → shown": "لا يوجد — إنه متصفح → ظاهر → ظاهر",
  "one 580px column beside a suggestions rail → 2-column grid → one column (original)":
    "عمود واحد 580px بجوار شريط اقتراحات → شبكة من عمودين → عمود واحد (الأصلي)",
  "8 → 11 → 6 (original)": "8 → 11 → 6 (الأصلي)",
  "split screen, art left, copy and actions right → stacked and centred with wide margins → stacked, full bleed (original)":
    "شاشة مقسومة، الرسم يسارًا والنص والإجراءات يمينًا → متراكبة في المنتصف بهوامش واسعة → متراكبة بعرض كامل (الأصلي)",
  "44px, left aligned → 40px, centred → 30px, centred (original)": "44px محاذى لليسار → 40px في المنتصف → 30px في المنتصف (الأصلي)",
  "180px beside the sign-in link → centred, 394px → full width (original)": "180px بجوار رابط الدخول → في المنتصف 394px → بعرض كامل (الأصلي)",
  "avatar beside name, stats and edit button → same, smaller → centred avatar, stats below (original)":
    "الصورة الرمزية بجوار الاسم والإحصاءات وزر التعديل → كذلك بحجم أصغر → صورة رمزية في المنتصف والإحصاءات أسفلها (الأصلي)",
  "5 columns → 4 → 3 (original)": "5 أعمدة → 4 → 3 (الأصلي)",
};

const COLUMNS: Plural = { one: "عمود واحد", two: "عمودان", few: "{n} أعمدة", many: "{n} عمودًا", other: "{n} عمود" };
const LINKS: Plural = { one: "رابط واحد", two: "رابطان", few: "{n} روابط", many: "{n} رابطًا", other: "{n} رابط" };

/* the capture script writes its rules from a few templates (scripts/capture/derive.mjs responsive()) */
function captureClause(c: string): string {
  let m = c.match(/^heading (.+)$/);
  if (m) return `العنوان ${m[1]}`;
  m = c.match(/^(\d+) columns( → .+)$/);
  if (m) return plural(COLUMNS, Number(m[1]), "ar") + m[2];
  if (c === "collapses behind navigation on mobile") return "يختفي خلف التنقل على الجوال";
  if (/(^|→ )(\d+ links|menu button|—)( →|$)/.test(c))
    return c
      .split(" → ")
      .map((s) => (s === "menu button" ? "زر القائمة" : /^(\d+) links$/.test(s) ? plural(LINKS, Number(s.split(" ")[0]), "ar") : s))
      .join(" → ");
  return c;
}

/* --------------------------------------------------------------- API */

export const itemTitle = (item: Item, lang: Lang) =>
  lang !== "ar"
    ? item.title
    : item.live
      ? item.live.titleAr
      : item.kind === "component"
        ? blockLabel(item.title, item.componentType, lang)
        : TITLES[item.title] ?? item.title;

/** What a Uiverse Original is and does, in `lang` */
export const liveAbout = (item: Item, lang: Lang) => (item.live ? (lang === "ar" ? item.live.aboutAr : item.live.about) : "");

/* the capture script keeps 32 characters of a section's heading in its label — mark the cut */
const HEADING_CUT = 32;

/** "Card grid", "Card grid 2", "Hero: <heading>" — the number and the page's own heading are kept */
export function blockLabel(label: string, type: string | undefined, lang: Lang) {
  const m = label.match(/^(.+?)(: .*| \d+)?$/)!;
  const rest = m[2] && m[2].startsWith(": ") && m[2].length - 2 >= HEADING_CUT ? `${m[2]}…` : (m[2] ?? "");
  if (lang !== "ar") return m[1] + rest;
  return (BLOCKS[m[1]] ?? (type ? name(COMPONENT_TYPES, type, "ar") : m[1])) + rest;
}

export const layoutName = (archetype: string, fallback: string, lang: Lang) => (lang === "ar" ? ARCHETYPES[archetype] ?? fallback : fallback);
export const typeName = (n: string, lang: Lang) => (lang === "ar" ? TYPE_NAMES[n] ?? n : n);
export const typeUse = (u: string, lang: Lang) => (lang === "ar" ? TYPE_USES[u] ?? u : u);

export function ruleText(rule: string, item: Item, lang: Lang) {
  if (lang !== "ar") return rule;
  if (!item.capture) return RULES[rule] ?? rule;
  return rule.split("; ").map(captureClause).join("; ");
}

/** layoutSpec()'s descriptive values */
export function layoutValue(v: string, lang: Lang) {
  if (lang !== "ar") return v;
  const fixed: Record<string, string> = { "single-column sections": "أقسام بعمود واحد", "single column": "عمود واحد", "12 column": "12 عمودًا" };
  /* a body line height the page left at the CSS default: "13px / normal" */
  if (/ \/ normal$/.test(v)) return v.replace(/normal$/, "عادي");
  if (fixed[v]) return fixed[v];
  let m = v.match(/^(\d+)-column hero$/);
  if (m) return `قسم افتتاحي من ${plural(COLUMNS, Number(m[1]), "ar")}`;
  m = v.match(/^(\d+)px-grid$/);
  if (m) return `شبكة ${m[1]}px`;
  return v;
}
