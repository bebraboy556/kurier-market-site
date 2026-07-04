"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lock,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  LogOut,
  History,
} from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/lib/models";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Новый",
  preparing: "Готовится",
  in_transit: "В пути",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  preparing: <Package className="h-3 w-3" />,
  in_transit: <Truck className="h-3 w-3" />,
  delivered: <CheckCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

const statusColors: Record<OrderStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
  preparing:
    "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  in_transit:
    "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  delivered:
    "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  cancelled:
    "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
};

const deliveryTypeLabels: Record<string, string> = {
  food: "Еда",
  groceries: "Продукты",
  parcels: "Посылки",
  flowers: "Цветы",
};

export function AdminOrders() {
  const { user, isLoading: authContextLoading, logout: authLogout } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordCheckLoading, setPasswordCheckLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const isAdminFromAuth = user?.role === "admin";

  useEffect(() => {
    if (!authContextLoading && isAdminFromAuth) {
      setAuthenticated(true);
    }
  }, [authContextLoading, isAdminFromAuth]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchOrders();
    }
  }, [authenticated, fetchOrders]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setPasswordCheckLoading(true);
    setPasswordError("");
    try {
      const res = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setPasswordError("Неверный пароль");
      }
    } catch {
      setPasswordError("Ошибка соединения");
    } finally {
      setPasswordCheckLoading(false);
    }
  }

  function handleLogout() {
    setAuthenticated(false);
    setPassword("");
    setOrders([]);
    authLogout();
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    const toastId = toast.loading("Обновляем статус...");
    try {
      const res = await fetch(`/api/orders/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Ошибка при обновлении статуса");
      }

      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success("Статус обновлён", { id: toastId });
    } catch {
      toast.error("Не удалось обновить статус", { id: toastId });
    }
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-7 w-7" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Админ-панель</h1>
            <p className="text-muted-foreground">
              Введите пароль для доступа к заказам
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={passwordCheckLoading}
            >
              {passwordCheckLoading ? "Проверка..." : "Войти"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="font-medium text-primary hover:underline"
            >
              Войти через email/телефон
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Заказы</h1>
          <p className="text-sm text-muted-foreground">
            Всего заказов: {orders.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Обновить
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-36" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground">Пока нет заказов</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div
                key={order.id}
                className="rounded-lg border p-4 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        #
                        {order.id.split("-")[0].toUpperCase() +
                          order.id.slice(-4).toUpperCase()}
                      </span>
                      <Badge className={statusColors[order.status]}>
                        <span className="flex items-center gap-1">
                          {statusIcons[order.status]}
                          {statusLabels[order.status]}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("ru", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order.id)
                      }
                    >
                      <History className="h-4 w-4 mr-1" />
                      История
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        value &&
                        handleStatusChange(order.id, value as OrderStatus)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Тип:</span>{" "}
                    {deliveryTypeLabels[order.deliveryType] ||
                      order.deliveryType}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Адрес:</span>{" "}
                    {order.address}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Имя:</span>{" "}
                    {order.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Телефон:</span>{" "}
                    {order.phone}
                  </div>
                  {order.comment && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">
                        Комментарий:
                      </span>{" "}
                      {order.comment}
                    </div>
                  )}
                </div>

                {isExpanded && order.statusHistory.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      История изменений статуса
                    </h3>
                    <div className="space-y-3">
                      {order.statusHistory
                        .slice()
                        .reverse()
                        .map((entry, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className={`h-2.5 w-2.5 rounded-full ${
                                  idx === 0
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30"
                                }`}
                              />
                              {idx < order.statusHistory.length - 1 && (
                                <div className="w-px h-4 bg-border" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`${statusColors[entry.status]} text-xs`}
                              >
                                <span className="flex items-center gap-1">
                                  {statusIcons[entry.status]}
                                  {statusLabels[entry.status]}
                                </span>
                              </Badge>
                              <span className="text-muted-foreground text-xs">
                                {new Date(entry.timestamp).toLocaleString(
                                  "ru",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
