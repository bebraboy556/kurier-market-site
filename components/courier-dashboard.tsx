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
  MapPin,
  Phone,
  User,
  LogOut,
  History,
  RefreshCw,
  ChevronDown,
  ChevronUp,
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
  cancelled: <Clock className="h-3 w-3" />,
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

interface CourierProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  workZone: string;
  isAvailable: boolean;
}

export function CourierDashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const res = await fetch("/api/courier/profile", {
        headers: { "x-courier-id": user.id },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/courier/orders", {
        headers: { "x-courier-id": user.id },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }
    if (user) {
      if (user.role !== "courier") {
        router.push("/");
        return;
      }
      fetchProfile();
      fetchOrders();
    }
  }, [authLoading, user, router, fetchProfile, fetchOrders]);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    const toastId = toast.loading("Обновляем статус...");
    try {
      const res = await fetch(`/api/courier/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка при обновлении статуса");
      }

      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success("Статус обновлён", { id: toastId });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Не удалось обновить статус",
        { id: toastId }
      );
    }
  }

  async function handleToggleAvailability() {
    if (!profile) return;
    const toastId = toast.loading("Обновляем статус...");
    try {
      const res = await fetch("/api/courier/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-courier-id": user!.id,
        },
        body: JSON.stringify({ isAvailable: !profile.isAvailable }),
      });

      if (!res.ok) {
        throw new Error("Ошибка при обновлении статуса");
      }

      const updated = await res.json();
      setProfile(updated);
      toast.success(
        updated.isAvailable
          ? "Вы снова принимаете заказы"
          : "Вы временно недоступны",
        { id: toastId }
      );
    } catch {
      toast.error("Не удалось обновить статус", { id: toastId });
    }
  }

  function handleLogout() {
    logout();
    router.push("/auth");
  }

  if (authLoading || !user) {
    return null;
  }

  const activeOrders = orders.filter((o) => o.status === "in_transit");
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing"
  );
  const completedOrders = orders.filter((o) => o.status === "delivered");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Кабинет курьера</h1>
          <p className="text-sm text-muted-foreground">
            {profile?.name ?? user.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchOrders();
              fetchProfile();
            }}
            disabled={ordersLoading || profileLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${ordersLoading || profileLoading ? "animate-spin" : ""}`}
            />
            Обновить
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      {profileLoading ? (
        <div className="rounded-lg border p-5 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
      ) : profile ? (
        <div className="rounded-lg border p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">Курьер</p>
            </div>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {profile.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Зона работы: {profile.workZone}
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm text-muted-foreground">Статус:</span>
            <Badge
              variant={profile.isAvailable ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={handleToggleAvailability}
            >
              {profile.isAvailable ? "Свободен" : "Занят"}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-5 text-center text-muted-foreground">
          Не удалось загрузить профиль
        </div>
      )}

      <div className="grid gap-3 grid-cols-3 text-center">
        <div className="rounded-lg border p-3">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {activeOrders.length}
          </div>
          <div className="text-xs text-muted-foreground">В пути</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendingOrders.length}
          </div>
          <div className="text-xs text-muted-foreground">Новых</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedOrders.length}
          </div>
          <div className="text-xs text-muted-foreground">Доставлено</div>
        </div>
      </div>

      {ordersLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
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
          <p className="text-muted-foreground">Нет назначенных заказов</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Назначенные заказы
          </h2>
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
                    {order.status === "preparing" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusChange(order.id, "in_transit")
                        }
                      >
                        <Truck className="h-4 w-4 mr-1" />В путь
                      </Button>
                    )}
                    {order.status === "in_transit" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          handleStatusChange(order.id, "delivered")
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Доставлен
                      </Button>
                    )}
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
                    <span className="text-muted-foreground">Клиент:</span>{" "}
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
