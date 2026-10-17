import { facetRoute } from "@/components/feed/FeedPage";
import { CATEGORIES, INDUSTRIES, STYLES, TECHNOLOGIES } from "@/lib/taxonomy";

const route = facetRoute(
  "web",
  [
    { param: "category", list: CATEGORIES },
    { param: "industry", list: INDUSTRIES },
    { param: "style", list: STYLES },
    { param: "tech", list: TECHNOLOGIES },
  ],
  (t) => [
    { param: "category", label: t.filters.type, options: CATEGORIES },
    { param: "industry", label: t.filters.industry, options: INDUSTRIES },
    { param: "style", label: t.filters.style, options: STYLES },
    { param: "tech", label: t.filters.tech, options: TECHNOLOGIES },
  ],
);

export const generateMetadata = route.generateMetadata;
export default route.Page;
