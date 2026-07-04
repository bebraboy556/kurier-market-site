"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus, StatusEntry } from "@/lib/models";

const statusFlow: OrderStatus[] = [
  "pending",
  "preparing",
  "in_transit",
  "delivered",
];

const statusLabels: Record<OrderStatus, string> = {
  pending: "Принят",
  preparing: "Готовится",
  in_transit: "В пути",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  preparing: <Package className="h-4 w-4" />,
  in_transit: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
};

const statusColors: Record<OrderStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_transit:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderNumber(id: string) {
  return id.split("-")[0].toUpperCase() + id.slice(-4).toUpperCase();
}

function StatusTimeline({
  history,
  currentStatus,
}: {
  history: StatusEntry[];
  currentStatus: OrderStatus;
}) {
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="space-y-0">
      {statusFlow.map((step, idx) => {
        const entry = history.find((h) => h.status === step);
        const isActive = isCancelled
          ? false
          : statusFlow.indexOf(currentStatus) >= idx;
        const isCurrent = currentStatus === step && !isCancelled;

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                )}
              >
                {statusIcons[step]}
              </div>
              {idx < statusFlow.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-8 transition-colors",
                    isActive && !isCancelled
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
            <div className={cn("pb-8", isCurrent && "font-medium")}>
              <p className="text-sm">{statusLabels[step]}</p>
              {entry && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(entry.timestamp)}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {isCancelled && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="font-medium text-red-600 dark:text-red-400">
            <p className="text-sm">{statusLabels.cancelled}</p>
            {history.find((h) => h.status === "cancelled") && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(
                  history.find((h) => h.status === "cancelled")!.timestamp
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderTracker() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError(
            "Заказ с таким номером не найден. Проверьте номер и попробуйте снова."
          );
        } else {
          setError("Ошибка при поиске заказа. Попробуйте позже.");
        }
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError("Ошибка при поиске заказа. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Отследить заказ</h1>
        <p className="text-muted-foreground">
          Введите номер заказа, чтобы узнать его статус
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Номер заказа, например ABCDE123"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? (
            <Clock className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Найти</span>
        </Button>
      </form>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {order && (
        <div className="space-y-6 rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Номер заказа</p>
              <p className="text-xl font-bold tracking-wider text-primary">
                {getOrderNumber(order.id)}
              </p>
            </div>
            <Badge
              className={cn("text-sm px-3 py-1", statusColors[order.status])}
            >
              <span className="flex items-center gap-1.5">
                {statusIcons[order.status]}
                {statusLabels[order.status]}
              </span>
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Тип:</span>{" "}
              {order.deliveryType === "food" && "Доставка еды"}
              {order.deliveryType === "groceries" && "Доставка продуктов"}
              {order.deliveryType === "parcels" && "Доставка посылок"}
              {order.deliveryType === "flowers" && "Доставка цветов"}
            </div>
            <div>
              <span className="text-muted-foreground">Адрес:</span>{" "}
              {order.address}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">История статуса</h3>
            <StatusTimeline
              history={order.statusHistory}
              currentStatus={order.status}
            />
          </div>
        </div>
      )}
    </div>
  );
}
