import { ITEMS } from "@/lib/data";
import { applyFilters } from "@/lib/query";
import { Feed } from "@/components/feed/Feed";
import { PageHeader, Shell } from "@/components/feed/Section";

export default function ThreeDPage() {
  const items = applyFilters(ITEMS, { threed: "true" });
  return (
    <Shell>
      <PageHeader
        title="3D & motion"
        sub="Scenes, WebGL heroes and interactive elements. Deliberately not a launch nav item — it becomes a section when the captures justify one."
      />
      <div className="pt-6">
        <Feed items={items} />
      </div>
    </Shell>
  );
}
