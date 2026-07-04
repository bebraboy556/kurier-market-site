import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { mockCouriers, mockUsers } from "@/lib/mock-data";
import {
  getAllCouriers,
  createCourier,
  updateCourier,
  createUser,
  getAllUsers,
  getAllOrders,
  getUserById,
  deleteUser,
} from "@/lib/models";
import { z } from "zod";

const createCourierSchema = z.object({
  name: z.string().min(1, "Укажите имя").max(200),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  phone: z.string().min(1, "Укажите телефон"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  workZone: z.string().min(1, "Укажите зону работы"),
});

const updateCourierSchema = z.object({
  userId: z.string().min(1),
  workZone: z.string().min(1).optional(),
  isAvailable: z.boolean().optional(),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const result = mockCouriers.map((c) => {
      const user = mockUsers.find((u) => u.id === c.id);
      return {
        id: c.id,
        name: user?.name ?? "",
        email: user?.email,
        phone: user?.phone,
        workZone: c.workZone,
        isAvailable: c.isAvailable,
        orderCount: 0,
        createdAt: user?.createdAt ?? new Date().toISOString(),
      };
    });
    return NextResponse.json(result);
  }

  try {
    const couriers = await getAllCouriers();
    const users = await getAllUsers();
    const allOrders = await getAllOrders();

    const result = couriers.map((c) => {
      const user = users.find((u) => u.id === c.id);
      const courierOrders = allOrders.filter((o) => o.courierId === c.id);
      return {
        id: c.id,
        name: user?.name ?? "",
        email: user?.email,
        phone: user?.phone,
        workZone: c.workZone,
        isAvailable: c.isAvailable,
        orderCount: courierOrders.length,
        createdAt: c.createdAt,
      };
    });

    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch couriers:", error);
    return NextResponse.json(
      { error: "Failed to fetch couriers" },
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
    const parsed = createCourierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email || undefined,
      phone: parsed.data.phone,
      password: parsed.data.password,
      role: "courier",
    });

    const courier = await createCourier(user.id, parsed.data.workZone);

    return NextResponse.json(
      {
        id: courier.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        workZone: courier.workZone,
        isAvailable: courier.isAvailable,
        orderCount: 0,
        createdAt: courier.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create courier:", error);
    return NextResponse.json(
      { error: "Failed to create courier" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "Database is unavailable in static mode" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const parsed = updateCourierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateCourier(parsed.data.userId, {
      workZone: parsed.data.workZone,
      isAvailable: parsed.data.isAvailable,
    });

    const user = await getUserById(parsed.data.userId);

    return NextResponse.json({
      id: updated.id,
      name: user?.name ?? "",
      email: user?.email,
      phone: user?.phone,
      workZone: updated.workZone,
      isAvailable: updated.isAvailable,
    });
  } catch (error) {
    console.error("Failed to update courier:", error);
    return NextResponse.json(
      { error: "Failed to update courier" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "Database is unavailable in static mode" },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete courier:", error);
    return NextResponse.json(
      { error: "Failed to delete courier" },
      { status: 500 }
    );
  }
}
