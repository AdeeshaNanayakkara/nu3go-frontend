import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Management", robots: { index: false } };

export default function AdminOrdersPage() {
  return (
    <div>
      <h1>Order Management</h1>
      {/* TODO: Implement admin orders table */}
    </div>
  );
}
