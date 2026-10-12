import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailView } from "@/components/detail/DetailView";
import { Overlay } from "@/components/detail/Overlay";
import { detailMetadata, loadDetail } from "@/components/detail/load";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return detailMetadata((await params).slug, "component");
}

export default async function ComponentModal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadDetail(slug, "component");
  if (!data) notFound();
  return (
    <Overlay label={data.item.title}>
      <DetailView {...data} presentation="overlay" />
    </Overlay>
  );
}
