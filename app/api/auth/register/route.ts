import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, getUserByEmail, getUserByPhone } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import {
  mockCreateUser,
  mockFindUserByEmail,
  mockFindUserByPhone,
} from "@/lib/mock-auth-store";

const registerSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(100),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  phone: z.string().min(1, "Телефон обязателен"),
  password: z
    .string()
    .min(6, "Пароль должен быть не менее 6 символов")
    .max(100),
  adminCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, phone, password, adminCode } = parsed.data;

  const adminSecret = process.env.ADMIN_SECRET || "admin123";
  const role = adminCode === adminSecret ? "admin" : "client";

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const mockExistingByEmail = email ? mockFindUserByEmail(email) : null;
    if (mockExistingByEmail) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    const mockExistingByPhone = mockFindUserByPhone(phone);
    if (mockExistingByPhone) {
      return NextResponse.json(
        { error: "Пользователь с таким телефоном уже существует" },
        { status: 409 }
      );
    }

    const user = mockCreateUser({
      name,
      email: email || undefined,
      phone,
      password,
      role,
    });

    return NextResponse.json({ user }, { status: 201 });
  }

  const existingByEmail = email ? await getUserByEmail(email) : null;
  if (existingByEmail) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже существует" },
      { status: 409 }
    );
  }

  const existingByPhone = await getUserByPhone(phone);
  if (existingByPhone) {
    return NextResponse.json(
      { error: "Пользователь с таким телефоном уже существует" },
      { status: 409 }
    );
  }

  const user = await createUser({
    name,
    email: email || undefined,
    phone,
    password,
    role,
  });

  return NextResponse.json({ user }, { status: 201 });
}

