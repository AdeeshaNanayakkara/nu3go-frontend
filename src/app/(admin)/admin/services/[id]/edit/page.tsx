import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Service", robots: { index: false } };

interface Props { params: Promise<{ id: string }>; }

export default async function AdminEditServicePage({ params }: Props) {
  const { id } = await params;
  return <div><h1>Edit Service: {id}</h1></div>;
}
