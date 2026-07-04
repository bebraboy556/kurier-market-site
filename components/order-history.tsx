"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  LogOut,
  History,
  ShoppingBag,
} from "lucide-react";
import type { OrderStatus } from "@/lib/models";

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

interface OrderItem {
  id: string;
  deliveryType: string;
  address: string;
  name: string;
  phone: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string }[];
  createdAt: string;
}

export function OrderHistory() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      const allOrders: OrderItem[] = Array.isArray(data) ? data : [];
      const userOrders = allOrders.filter(
        (o) => o.phone === user.phone || o.name === user.name
      );
      setOrders(userOrders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }
    if (user) {
      fetchOrders();
    }
  }, [authLoading, user, router, fetchOrders]);

  function handleLogout() {
    logout();
    router.push("/auth");
  }

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Мои заказы</h1>
          <p className="text-sm text-muted-foreground">
            {user.name}, всего заказов: {orders.length}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
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
          <p className="text-muted-foreground mb-4">У вас пока нет заказов</p>
          <Button onClick={() => router.push("/order")}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Оформить заказ
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
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
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Тип:</span>{" "}
                  {deliveryTypeLabels[order.deliveryType] || order.deliveryType}
                </div>
                <div>
                  <span className="text-muted-foreground">Адрес:</span>{" "}
                  {order.address}
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Создан:</span>{" "}
                  {new Date(order.createdAt).toLocaleString("ru", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              {order.statusHistory.length > 0 && (
                <div className="border-t pt-3">
                  <h3 className="text-xs font-medium mb-2 flex items-center gap-1 text-muted-foreground">
                    <History className="h-3 w-3" />
                    История статуса
                  </h3>
                  <div className="space-y-2">
                    {order.statusHistory
                      .slice()
                      .reverse()
                      .map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div
                            className={`h-2 w-2 rounded-full ${
                              idx === 0
                                ? "bg-primary"
                                : "bg-muted-foreground/30"
                            }`}
                          />
                          <Badge
                            className={`${statusColors[entry.status]} text-xs px-1.5 py-0`}
                          >
                            {statusLabels[entry.status]}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString("ru", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
