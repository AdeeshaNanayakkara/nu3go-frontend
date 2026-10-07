import type { Metadata } from "next";
import { APP_CONFIG } from "@/constants/config";

export const revalidate = 3600;

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug, description: `Read article: ${slug}` };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  return (
    <div>
      <h1>Article: {slug}</h1>
    </div>
  );
}
