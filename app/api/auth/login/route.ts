import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { mockAuthenticateUser } from "@/lib/mock-auth-store";

const loginSchema = z.object({
  login: z.string().min(1, "Email или телефон обязательны"),
  password: z.string().min(1, "Пароль обязателен"),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { login, password } = parsed.data;

  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const user = mockAuthenticateUser(login, password);

    if (!user) {
      return NextResponse.json(
        { error: "Неверный email/телефон или пароль" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  }

  const user = await authenticateUser(login, password);

  if (!user) {
    return NextResponse.json(
      { error: "Неверный email/телефон или пароль" },
      { status: 401 }
    );
  }

  return NextResponse.json({ user });
}
