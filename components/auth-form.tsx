"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus, User, Mail, Phone, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export function AuthForm() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const user = await login(email || phone, password);
        toast.success(`Добро пожаловать, ${user.name}!`);
        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/profile");
        }
      } else {
        const user = await register({
          name,
          email: email || undefined,
          phone,
          password,
          adminCode: adminCode || undefined,
        });
        toast.success("Регистрация успешна!");
        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/profile");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Произошла ошибка";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  }

  const isLogin = mode === "login";

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {isLogin ? (
                <LogIn className="h-6 w-6" />
              ) : (
                <UserPlus className="h-6 w-6" />
              )}
            </div>
          </div>
          <CardTitle>{isLogin ? "Вход" : "Регистрация"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Войдите по email или телефону"
              : "Создайте аккаунт для отслеживания заказов"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Ваше имя"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email или телефон</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type={isLogin ? "text" : "email"}
                  placeholder={
                    isLogin
                      ? "email@example.com или +7 (999) 123-45-67"
                      : "email@example.com"
                  }
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={isLogin}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+7 (999) 123-45-67"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Пароль"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isLogin ? 1 : 6}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="adminCode">Код администратора</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="adminCode"
                    type="password"
                    placeholder="Код администратора (необязательно)"
                    className="pl-10"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Подождите..."
                : isLogin
                  ? "Войти"
                  : "Зарегистрироваться"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-primary hover:underline"
            >
              {isLogin ? "Зарегистрироваться" : "Войти"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
