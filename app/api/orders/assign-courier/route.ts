import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { updateOrderCourier } from "@/lib/models";
import { z } from "zod";

const assignCourierSchema = z.object({
  orderId: z.string().min(1),
  courierId: z.string().nullable(),
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
    const parsed = assignCourierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = await updateOrderCourier(
      parsed.data.orderId,
      parsed.data.courierId
    );

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to assign courier:", error);
    return NextResponse.json(
      { error: "Failed to assign courier" },
      { status: 500 }
    );
  }
}
