"use client";

import OrderDeskReviewPage from "@/app/order-desk/orders/page";

export default function DeskOrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDeskReviewPage params={params} />;
}
