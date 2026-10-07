import type { Metadata } from "next";

export const metadata: Metadata = { title: "User Detail", robots: { index: false } };

interface Props { params: Promise<{ id: string }>; }

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  return <div><h1>User: {id}</h1></div>;
}
