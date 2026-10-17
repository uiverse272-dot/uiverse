import { facetRoute } from "@/components/feed/FeedPage";
import { CATEGORIES, INDUSTRIES, PLATFORMS, STYLES } from "@/lib/taxonomy";

const route = facetRoute(
  "apps",
  [
    { param: "platform", list: PLATFORMS },
    { param: "industry", list: INDUSTRIES },
    { param: "category", list: CATEGORIES, titled: false },
  ],
  (t) => [
    { param: "platform", label: t.filters.platform, options: PLATFORMS },
    { param: "category", label: t.filters.screen, options: CATEGORIES },
    { param: "industry", label: t.filters.category, options: INDUSTRIES },
    { param: "style", label: t.filters.style, options: STYLES },
  ],
);

export const generateMetadata = route.generateMetadata;
export default route.Page;
