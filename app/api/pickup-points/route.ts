import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { mockPickupPoints } from "@/lib/mock-data";
import {
  getAllPickupPoints,
  createPickupPoint,
  updatePickupPoint,
  deletePickupPoint,
} from "@/lib/models";
import { z } from "zod";

const createPointSchema = z.object({
  name: z.string().min(1, "Укажите название").max(200),
  address: z.string().min(1, "Укажите адрес").max(500),
  city: z.string().min(1, "Укажите город").max(200),
});

const updatePointSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(500).optional(),
  city: z.string().min(1).max(200).optional(),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(mockPickupPoints);
  }

  try {
    const points = await getAllPickupPoints();
    return NextResponse.json(points);
  } catch (error) {
    console.error("Failed to fetch pickup points:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickup points" },
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
    const parsed = createPointSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const point = await createPickupPoint(parsed.data);
    return NextResponse.json(point, { status: 201 });
  } catch (error) {
    console.error("Failed to create pickup point:", error);
    return NextResponse.json(
      { error: "Failed to create pickup point" },
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
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const parsed = updatePointSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const point = await updatePickupPoint(id, parsed.data);
    return NextResponse.json(point);
  } catch (error) {
    console.error("Failed to update pickup point:", error);
    return NextResponse.json(
      { error: "Failed to update pickup point" },
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

    await deletePickupPoint(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete pickup point:", error);
    return NextResponse.json(
      { error: "Failed to delete pickup point" },
      { status: 500 }
    );
  }
}
