import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { mockOrders } from "@/lib/mock-data";
import { getOrderById } from "@/lib/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const order = mockOrders.find((o) => o.id === id);
    if (!order) {
      return NextResponse.json(
        { error: "Заказ с таким номером не найден" },
        { status: 404 }
      );
    }
    return NextResponse.json(order);
  }

  try {
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { error: "Заказ с таким номером не найден" },
        { status: 404 }
      );
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Ошибка при поиске заказа" },
      { status: 500 }
    );
  }
}
