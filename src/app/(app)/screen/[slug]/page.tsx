import { notFound } from "next/navigation";
import { DetailView } from "@/components/detail/DetailView";
import { loadDetail } from "@/components/detail/load";

export default async function ScreenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadDetail(slug);
  if (!data) notFound();
  return <DetailView {...data} />;
}
