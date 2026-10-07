import type { Metadata } from "next";
import { APP_CONFIG } from "@/constants/config";

export const revalidate = 3600;

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug, description: `Services in category: ${slug}` };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  return (
    <div>
      <h1>Category: {slug}</h1>
    </div>
  );
}
