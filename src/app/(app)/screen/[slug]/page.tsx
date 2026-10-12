import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailView } from "@/components/detail/DetailView";
import { detailMetadata, loadDetail } from "@/components/detail/load";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return detailMetadata((await params).slug, "screen");
}

export default async function ScreenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadDetail(slug, "screen");
  if (!data) notFound();
  return <DetailView {...data} />;
}
