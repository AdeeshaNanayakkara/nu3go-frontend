import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Service detail page — SSR (SEO critical).
 */
interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug, description: `Details for service: ${slug}` };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  return (
    <div>
      <h1>Service: {slug}</h1>
      {/* TODO: Implement service detail */}
    </div>
  );
}
