import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Detail", robots: { index: false } };

interface Props { params: Promise<{ id: string }>; }

export default async function PaymentDetailPage({ params }: Props) {
  const { id } = await params;
  return <div><h1>Payment: {id}</h1></div>;
}
