import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { updateOrderStatus } from "@/lib/models";
import { z } from "zod";
import type { OrderStatus } from "@/lib/models";

const updateStatusSchema = z.object({
  status: z.enum(["in_transit", "delivered"] as const satisfies OrderStatus[]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна в статическом режиме" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(
      id,
      parsed.data.status as OrderStatus
    );

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Не удалось обновить статус заказа" },
      { status: 500 }
    );
  }
}
