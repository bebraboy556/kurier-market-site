import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getCourierByUserId, updateCourier, getUserById } from "@/lib/models";
import { mockCouriers, mockUsers } from "@/lib/mock-data";
import { z } from "zod";

const updateProfileSchema = z.object({
  isAvailable: z.boolean().optional(),
  workZone: z.string().optional(),
});

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
    const mockCourier = mockCouriers.find((c) => c.id === courierId);
    const mockUser = mockUsers.find((u) => u.id === courierId);
    if (!mockCourier || !mockUser) {
      return NextResponse.json({ error: "Курьер не найден" }, { status: 404 });
    }
    return NextResponse.json({
      id: mockCourier.id,
      name: mockUser.name,
      email: mockUser.email,
      phone: mockUser.phone,
      workZone: mockCourier.workZone,
      isAvailable: mockCourier.isAvailable,
    });
  }

  try {
    const user = await getUserById(courierId);
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const courierProfile = await getCourierByUserId(courierId);
    if (!courierProfile) {
      return NextResponse.json(
        { error: "Профиль курьера не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      workZone: courierProfile.workZone,
      isAvailable: courierProfile.isAvailable,
    });
  } catch (error) {
    console.error("Failed to fetch courier profile:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить профиль" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const courierId = request.headers.get("x-courier-id");
  if (!courierId) {
    return NextResponse.json(
      { error: "Не указан ID курьера" },
      { status: 400 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна в статическом режиме" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateCourier(courierId, parsed.data);

    const user = await getUserById(courierId);

    return NextResponse.json({
      id: courierId,
      name: user?.name ?? "",
      email: user?.email,
      phone: user?.phone,
      workZone: updated.workZone,
      isAvailable: updated.isAvailable,
    });
  } catch (error) {
    console.error("Failed to update courier profile:", error);
    return NextResponse.json(
      { error: "Не удалось обновить профиль" },
      { status: 500 }
    );
  }
}
