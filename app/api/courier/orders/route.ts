import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getOrdersByCourierId } from "@/lib/models";
import { mockOrders } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const courierId = request.headers.get("x-courier-id");
  if (!courierId) {
    return NextResponse.json(
      { error: "Не указан ID курьера" },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const assigned = mockOrders.filter((o) => o.courierId === courierId);
    assigned.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(assigned);
  }

  try {
    const orders = await getOrdersByCourierId(courierId);
    orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch courier orders:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить заказы" },
      { status: 500 }
    );
  }
}
