"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Sparkles,
  LayoutGrid,
  ShoppingBag,
  Search,
  Phone,
  LogIn,
  User,
} from "lucide-react";

const appName = "Курьер Маркет";

export function HeaderNav() {
  const { user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          {appName}
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LayoutGrid className="h-4 w-4" />
            Каталог
          </Link>
          <Link
            href="/order"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Заказ
          </Link>
          <Link
            href="/tracking"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Search className="h-4 w-4" />
            Отследить
          </Link>
          <Link
            href="/contacts"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Phone className="h-4 w-4" />
            Контакты
          </Link>
          {isLoading ? null : user ? (
            <Link
              href={
                user.role === "admin"
                  ? "/admin"
                  : user.role === "courier"
                    ? "/courier"
                    : "/profile"
              }
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:text-foreground hover:bg-accent transition-colors"
            >
              <User className="h-4 w-4" />
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:text-foreground hover:bg-accent transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
