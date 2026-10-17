import { facetRoute } from "@/components/feed/FeedPage";
import { COMPONENT_TYPES, INDUSTRIES, STYLES, TECHNOLOGIES } from "@/lib/taxonomy";

const route = facetRoute(
  "components",
  [
    { param: "componentType", list: COMPONENT_TYPES },
    { param: "style", list: STYLES, titled: false },
    { param: "tech", list: TECHNOLOGIES, titled: false },
  ],
  (t) => [
    { param: "component", label: t.filters.component, options: COMPONENT_TYPES },
    { param: "industry", label: t.filters.industry, options: INDUSTRIES },
    { param: "style", label: t.filters.style, options: STYLES },
    { param: "tech", label: t.filters.framework, options: TECHNOLOGIES },
  ],
);

export const generateMetadata = route.generateMetadata;
export default route.Page;
