import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { mockPointProducts } from "@/lib/mock-data";
import {
  getAllPointProducts,
  getPointProductsByPoint,
  createPointProduct,
  updatePointProduct,
  deletePointProduct,
} from "@/lib/models";
import { z } from "zod";

const createProductSchema = z.object({
  pointId: z.string().min(1),
  name: z.string().min(1, "Укажите название").max(200),
  price: z.number().min(0, "Цена не может быть отрицательной"),
  description: z.string().max(2000).optional(),
  image: z.string().max(2000).optional(),
  categoryId: z.string().min(1),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().min(0).optional(),
  description: z.string().max(2000).optional(),
  image: z.string().max(2000).optional(),
  categoryId: z.string().min(1).optional(),
});

export async function GET(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const { searchParams } = new URL(request.url);
    const pointId = searchParams.get("pointId");
    if (pointId) {
      return NextResponse.json(
        mockPointProducts.filter((p) => p.pointId === pointId)
      );
    }
    return NextResponse.json(mockPointProducts);
  }

  try {
    const { searchParams } = new URL(request.url);
    const pointId = searchParams.get("pointId");

    let products;
    if (pointId) {
      products = await getPointProductsByPoint(pointId);
    } else {
      products = await getAllPointProducts();
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch point products:", error);
    return NextResponse.json(
      { error: "Failed to fetch point products" },
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
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await createPointProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create point product:", error);
    return NextResponse.json(
      { error: "Failed to create point product" },
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

    const parsed = updateProductSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await updatePointProduct(id, parsed.data);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update point product:", error);
    return NextResponse.json(
      { error: "Failed to update point product" },
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

    await deletePointProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete point product:", error);
    return NextResponse.json(
      { error: "Failed to delete point product" },
      { status: 500 }
    );
  }
}
