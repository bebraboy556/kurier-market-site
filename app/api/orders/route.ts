import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { mockOrders } from "@/lib/mock-data";
import { createOrder, getAllOrders } from "@/lib/models";
import { z } from "zod";

const createOrderSchema = z.object({
  deliveryType: z.enum(["food", "groceries", "parcels", "flowers"]),
  address: z.string().min(1, "Укажите адрес"),
  name: z.string().min(1, "Укажите имя"),
  phone: z.string().min(1, "Укажите телефон"),
  comment: z.string().optional(),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(mockOrders);
  }

  try {
    const orders = await getAllOrders();
    orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "Database is unavailable in static mode" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = await createOrder({
      deliveryType: parsed.data.deliveryType,
      address: parsed.data.address,
      name: parsed.data.name,
      phone: parsed.data.phone,
      comment: parsed.data.comment ?? "",
      status: "pending",
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
