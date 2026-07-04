import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { updateOrderStatus } from "@/lib/models";
import { z } from "zod";
import type { OrderStatus } from "@/lib/models";

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    "pending",
    "preparing",
    "in_transit",
    "delivered",
    "cancelled",
  ] as const satisfies OrderStatus[]),
});

export async function PATCH(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "Database is unavailable in static mode" },
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
      parsed.data.id,
      parsed.data.status as OrderStatus
    );

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
