import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Detail", robots: { index: false } };

interface Props { params: Promise<{ id: string }>; }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <div><h1>Admin Order: {id}</h1></div>;
}
